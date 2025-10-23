-- ========= 1. DEFINISI TIPE ENUM (Tetap) =========
CREATE TYPE user_role AS ENUM (
    'admin', 
    'warga'
);
CREATE TYPE ipl_status AS ENUM (
    'pending', 
    'paid', 
    'overdue'
);
CREATE TYPE transaction_status AS ENUM (
    'pending', 
    'success', 
    'failed'
);
CREATE TYPE letter_status AS ENUM (
    'pending', 
    'processed', 
    'ready_to_collect',
    'rejected'
);
CREATE TYPE sos_type AS ENUM (
    'kebakaran', 
    'medis', 
    'keamanan'
);
CREATE TYPE report_status AS ENUM (
    'baru', 
    'ditangani', 
    'selesai'
);
CREATE TYPE report_category AS ENUM (
    'kebersihan', 
    'keamanan', 
    'penerangan', 
    'fasilitas', 
    'lainnya'
);
CREATE TYPE booking_status AS ENUM (
    'pending', 
    'approved', 
    'rejected', 
    'cancelled'
);

-- ========= 2. TABEL PENGGUNA (INTI) - MODIFIKASI UNTUK CLERK =========
-- Tabel ini menyimpan data PROFIL, disinkronkan dari Clerk
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- ID dari Clerk (e.g., "user_..."), BUKAN UUID.
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    -- password_hash DIHAPUS, ditangani Clerk
    role user_role NOT NULL DEFAULT 'warga', -- Role aplikasi kita
    block_number VARCHAR(50) UNIQUE, -- Data spesifik aplikasi
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTE: Anda perlu setup Webhook di Clerk (event: user.created, user.updated)
-- untuk memanggil API Route Next.js agar data di tabel 'users' ini
-- selalu sinkron dengan data di Clerk.

-- ========= 3. PILAR 1: KEUANGAN & ADMINISTRASI =========
CREATE TABLE ipl_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    month INT NOT NULL,
    year INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status ipl_status DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, month, year)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    amount_paid NUMERIC(10, 2) NOT NULL,
    status transaction_status DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'qris',
    external_id VARCHAR(255) UNIQUE, -- ID dari Midtrans
    payment_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transaction_bill_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    ipl_bill_id UUID REFERENCES ipl_bills(id) ON DELETE CASCADE,
    UNIQUE(transaction_id, ipl_bill_id)
);

CREATE TABLE transaction_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    fee_type VARCHAR(50) NOT NULL, 
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    letter_type VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    status letter_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========= 4. PILAR 2: KEAMANAN & DARURAT =========
CREATE TABLE sos_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL, -- Diubah
    type sos_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ========= 5. PILAR 3: INTERAKSI & KOMUNITAS =========
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL, -- Diubah
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL, -- Diubah
    question TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL
);

CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poll_id, user_id)
);

-- ========= 6. PILAR 4: PELAPORAN & FASILITAS =========
CREATE TABLE report_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    category report_category NOT NULL,
    description TEXT NOT NULL,
    location_detail VARCHAR(255),
    image_url TEXT, -- Path ke Supabase Storage
    status report_status DEFAULT 'baru',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT, -- Path ke Supabase Storage
    requires_approval BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE facility_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Diubah
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status booking_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT check_time CHECK (end_time > start_time)
);

-- ========= 7. RLS (Row Level SECURITY) SETUP =========
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipl_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_bill_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can view and update their own IPL bills
CREATE POLICY "Users can view own IPL bills" ON ipl_bills
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own IPL bills" ON ipl_bills
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can view and update their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can view and update their own letters
CREATE POLICY "Users can view own letters" ON user_letters
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own letters" ON user_letters
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can view and insert their own SOS logs
CREATE POLICY "Users can view own SOS logs" ON sos_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert SOS logs" ON sos_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view and update their own suggestions
CREATE POLICY "Users can view own suggestions" ON user_suggestions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own suggestions" ON user_suggestions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can view and create forum posts
CREATE POLICY "Users can view forum posts" ON forum_posts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create forum posts" ON forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view and create forum replies
CREATE POLICY "Users can view forum replies" ON forum_replies
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create forum replies" ON forum_replies
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view polls and vote in them
CREATE POLICY "Users can view polls" ON polls
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can vote in polls" ON poll_votes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view and update their own report tickets
CREATE POLICY "Users can view own report tickets" ON report_tickets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create report tickets" ON report_tickets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own report tickets" ON report_tickets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can view bookings and make their own
CREATE POLICY "Users can view own bookings" ON facility_bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON facility_bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings" ON facility_bookings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin policies (users with admin role)
CREATE POLICY "Admin can view all data" ON users
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can update all data" ON users
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));