import { NextResponse } from 'next/server';

export async function GET() {
  // Note: In a real application, you would run the SQL schema directly in Supabase
  // This endpoint just returns the schema as reference
  const schema = `
    -- ========= 1. DEFINISI TIPE ENUM =========
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

    -- ========= 2. TABEL PENGGUNA (INTI) =========
    CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY, 
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20) UNIQUE,
        role user_role NOT NULL DEFAULT 'warga', 
        block_number VARCHAR(50) UNIQUE, 
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ========= 3. PILAR 1: KEUANGAN & ADMINISTRASI =========
    CREATE TABLE ipl_bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
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
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        amount_paid NUMERIC(10, 2) NOT NULL,
        status transaction_status DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'qris',
        external_id VARCHAR(255) UNIQUE,
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
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
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
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        type sos_type NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ========= 5. PILAR 3: INTERAKSI & KOMUNITAS =========
    CREATE TABLE announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE user_suggestions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
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
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE forum_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
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
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(poll_id, user_id)
    );

    -- ========= 6. PILAR 4: PELAPORAN & FASILITAS =========
    CREATE TABLE report_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        category report_category NOT NULL,
        description TEXT NOT NULL,
        location_detail VARCHAR(255),
        image_url TEXT,
        status report_status DEFAULT 'baru',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE facilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        requires_approval BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true
    );

    CREATE TABLE facility_bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        status booking_status DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT check_time CHECK (end_time > start_time)
    );
  `;

  return NextResponse.json({ 
    message: 'Database schema definition for Cluster Kita application', 
    schema 
  });
}