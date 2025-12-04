-- Create payments table
-- Created: 2025-12-04

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  negotiation_id uuid references negotiations(id) not null,
  user_id uuid references auth.users(id) not null,
  imp_uid text not null, -- PortOne unique payment ID
  merchant_uid text not null, -- Order ID
  amount integer not null,
  status text not null check (status in ('ready', 'paid', 'failed', 'cancelled')),
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table payments enable row level security;

-- Policies
create policy "Users can view their own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own payments"
  on payments for insert
  with check (auth.uid() = user_id);

create policy "Service role can manage all payments"
  on payments for all
  using (auth.role() = 'service_role');

-- Create index for faster lookups
create index payments_negotiation_id_idx on payments(negotiation_id);
create index payments_user_id_idx on payments(user_id);
create index payments_merchant_uid_idx on payments(merchant_uid);
