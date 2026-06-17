# Supabase Setup Guide

## 1. Create a Supabase Project
- Go to https://supabase.com
- Sign up / Sign in
- Click "New Project"
- Name your project, set a password, select region
- Wait for project to provision (takes a few minutes)

## 2. Create Database Tables

Run this SQL in the Supabase SQL Editor:

```sql
-- Create claimed_quizzes table
CREATE TABLE claimed_quizzes (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  quiz_id VARCHAR(255) NOT NULL,
  amount NUMERIC NOT NULL,
  claimed_at TIMESTAMP DEFAULT NOW(),
  tx_hash VARCHAR(255),
  UNIQUE(wallet_address, quiz_id)
);

-- Create index for faster lookups
CREATE INDEX idx_claimed_quizzes_wallet ON claimed_quizzes(wallet_address);

-- Create completed_stages table
CREATE TABLE completed_stages (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  stage_name VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, stage_name)
);

-- Create index
CREATE INDEX idx_completed_stages_wallet ON completed_stages(wallet_address);

-- Create perfect_quizzes table
CREATE TABLE perfect_quizzes (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  stage_name VARCHAR(255) NOT NULL,
  quiz_title VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, quiz_title)
);

-- Create index
CREATE INDEX idx_perfect_quizzes_wallet ON perfect_quizzes(wallet_address);
```

## 3. Get Your Keys
- Go to Project Settings → API
- Copy:
  - `Project URL` (for `VITE_SUPABASE_URL` and `SUPABASE_URL`)
  - `anon public` key (for `VITE_SUPABASE_ANON_KEY`)
  - `service_role` key (for `SUPABASE_SERVICE_ROLE_KEY`) (keep this secret!)

## 4. Add Keys to Vercel (or local .env)
Add these to your Vercel project environment variables (or local .env file):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TREASURY_PRIVATE_KEY`
