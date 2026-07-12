import { Hono } from 'hono';
import Stripe from 'stripe';
import { Env, User } from './types';
import { verify } from 'hono/jwt';

const stripeRouter = new Hono<{ Bindings: Env }>();

// Helper to authenticate user from JWT
async function getUserIdFromToken(c: any): Promise<string | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verify(token, c.env.JWT_SECRET, 'HS256');
    return decoded ? (decoded.id as string) : null;
  } catch {
    return null;
  }
}

// POST /checkout-session - Create Stripe Checkout Session
stripeRouter.post('/checkout-session', async (c) => {
  const userId = await getUserIdFromToken(c);
  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const { plan } = await c.req.json(); // 'monthly' or 'yearly'
  if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
    return c.json({ error: 'Invalid plan choice' }, 400);
  }

  try {
    const user = await c.env.DB.prepare('SELECT email, stripe_customer_id FROM users WHERE id = ?')
      .bind(userId)
      .first<{ email: string; stripe_customer_id: string | null }>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Initialize Stripe client
    const stripe = new Stripe(c.env.STRIPE_API_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(), // Cloudflare Workers fetch runtime compatible
    });

    // In local development, if Stripe API key is default mock, simulate success URL redirecting back
    if (c.env.STRIPE_API_KEY === 'sk_test_mock') {
      const mockCheckoutUrl = `${c.env.FRONTEND_URL}/dashboard?checkout_mock=success&plan=${plan}`;
      return c.json({ url: mockCheckoutUrl });
    }

    // Determine Stripe Price ID based on plan
    // These should be configured in Stripe Dashboard
    const priceId = plan === 'monthly' 
      ? 'price_monthly_subscription_id_here' 
      : 'price_yearly_subscription_id_here';

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      
      // Save customer ID in database
      await c.env.DB.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?')
        .bind(customerId, userId)
        .run();
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${c.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.env.FRONTEND_URL}/pricing`,
      client_reference_id: userId,
      subscription_data: {
        metadata: { userId },
      },
    });

    return c.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe session creation failed:', err);
    return c.json({ error: 'Failed to create checkout session: ' + err.message }, 500);
  }
});

// POST /webhook - Stripe webhook events handler
stripeRouter.post('/webhook', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) {
    return c.text('Missing Stripe signature header', 400);
  }

  const stripe = new Stripe(c.env.STRIPE_API_KEY, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const bodyText = await c.req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      bodyText,
      signature,
      c.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Stripe webhook verification failed:', err);
    return c.text(`Webhook Error: ${err.message}`, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || (session as any).subscription_data?.metadata?.userId || session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          // Fetch subscription to get current period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = subscription.current_period_end;

          await c.env.DB.prepare(
            `UPDATE users 
             SET subscription_status = 'active', stripe_customer_id = ?, stripe_subscription_id = ?, current_period_end = ?
             WHERE id = ?`
          )
            .bind(customerId, subscriptionId, periodEnd, userId)
            .run();
          console.log(`User ${userId} successfully subscribed!`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status; // 'active', 'past_due', 'unpaid', etc.
        const periodEnd = subscription.current_period_end;

        const dbStatus = (status === 'active') ? 'active' : (status === 'past_due' ? 'past_due' : 'canceled');

        await c.env.DB.prepare(
          `UPDATE users 
           SET subscription_status = ?, current_period_end = ?
           WHERE stripe_customer_id = ?`
        )
          .bind(dbStatus, periodEnd, customerId)
          .run();
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await c.env.DB.prepare(
          `UPDATE users 
           SET subscription_status = 'canceled', stripe_subscription_id = NULL, current_period_end = NULL
           WHERE stripe_customer_id = ?`
        )
          .bind(customerId)
          .run();
        break;
      }
    }
  } catch (err: any) {
    console.error('Database update on Stripe event failed:', err);
    return c.text('Internal Server Error', 500);
  }

  return c.json({ received: true });
});

// GET /status - Mock / endpoint for verifying mock payment locally
stripeRouter.get('/mock-success', async (c) => {
  const userId = await getUserIdFromToken(c);
  if (!userId) return c.json({ error: 'Auth required' }, 401);

  try {
    const periodEnd = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
    await c.env.DB.prepare(
      `UPDATE users 
       SET subscription_status = 'active', stripe_customer_id = 'cus_mock', stripe_subscription_id = 'sub_mock', current_period_end = ?
       WHERE id = ?`
    )
      .bind(periodEnd, userId)
      .run();
    return c.json({ success: true, message: 'Mock subscription activated successfully!' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default stripeRouter;
