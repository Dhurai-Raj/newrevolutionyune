export interface Env {
  DB: D1Database;
  ROYALTUNE_BUCKET: R2Bucket;
  ROYALTUNE_KV: KVNamespace;
  JWT_SECRET: string;
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: 'free' | 'active' | 'past_due' | 'canceled';
  current_period_end: number | null;
  free_downloads_count: number;
  created_at: number;
  updated_at: number;
}

export interface Track {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  preview_url: string;
  thumbnail_url: string;
  duration: number;
  genre: string;
  mood: string;
  instrument: string | null;
  bpm: number;
  vocals: string;
  language: string;
  tags: string; // comma-separated
  is_free: number; // 0 or 1
  is_featured: number; // 0 or 1
  is_trending: number; // 0 or 1
  waveform_data: string; // JSON string
  downloads_count: number;
  created_at: number;
  updated_at: number;
}

export interface Download {
  id: string;
  user_id: string;
  track_id: string;
  license_id: string;
  buyer_name: string;
  buyer_email: string;
  created_at: number;
}
