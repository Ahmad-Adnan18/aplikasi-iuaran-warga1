

-----

**Tech Spec: Aplikasi Full-Stack "Cluster Kita"**
**Versi:** 2.0 (Stack: Next.js, Supabase, Clerk)
**Proyek:** "Cluster Kita" - Platform Manajemen Klaster dan Keterlibatan Komunitas.

## 1\. Ikhtisar & Arsitektur

**Tujuan:** Menciptakan aplikasi terpadu (SaaS) untuk perumahan/klaster yang mengotomatiskan administrasi, meningkatkan keamanan, dan memfasilitasi komunitas, dibangun di atas arsitektur *serverless* yang modern.

**Tech Stack:**

  * **Framework (Full-Stack):** **Next.js** (App Router, Server Actions, API Routes)
  * **Database & BaaS:** **Supabase** (PostgreSQL, Realtime Notifications, Storage)
  * **Otentikasi:** **Clerk** (Manajemen User, Sign-in/Sign-up, Manajemen Sesi, Roles/Metadata)
  * **UI:** **TailwindCSS v4 & shadcn** (Berjalan di dalam Next.js)
  * **API Eksternal:**
      * Payment Gateway: Midtrans (untuk pembayaran QRIS IPL).
      * Notifikasi: Layanan WhatsApp Gateway.

**User Roles:**

  * **Admin (Pengurus):** Dikelola via *metadata* atau *role* di **Clerk**. Memiliki akses ke *route* admin di Next.js yang memanggil fungsi-fungsi Supabase dengan hak penuh.
  * **Warga:** Peran *default* di **Clerk**. Hanya dapat mengakses data pribadi melalui Supabase (menggunakan Row Level Security) atau *endpoint* API Next.js yang spesifik.

-----

## 2\. Fitur Fungsional Lengkap

*(Bagian ini tidak berubah secara fungsional, karena hanya menjelaskan *apa* yang dilakukan aplikasi, bukan *bagaimana*.)*

### Pilar 1: Keuangan & Administrasi Inti

  * **Manajemen Iuran (IPL):** Admin generate tagihan; Warga bayar via Midtrans.
  * **Riwayat Transaksi:** Transparan untuk warga dan admin.
  * **Pengajuan Surat Pengantar:** Warga mengajukan; Admin memproses.
  * **Manajemen Warga:** CRUD data warga oleh Admin (data disinkronkan dari Clerk).

### Pilar 2: Keamanan & Darurat

  * **Tombol Darurat (SOS):** Warga menekan tombol; Notifikasi *realtime* (WA) terkirim ke Admin.
  * **Log Aktivitas Darurat:** Admin memantau *log* SOS.

### Pilar 3: Interaksi & Keterlibatan Komunitas

  * **Papan Pengumuman:** Admin mempublikasikan.
  * **Forum Warga:** Warga berdiskusi; Admin memoderasi.
  * **Jajak Pendapat (Polling):** Admin membuat; Warga memilih.
  * **Kotak Saran (Privat):** Warga mengirim masukan privat.

### Pilar 4: Pelaporan & Pengelolaan Fasilitas

  * **Pelaporan Masalah (Ticketing System):** Warga melapor dengan foto (upload ke **Supabase Storage**); Admin mengubah status; Warga mendapat notifikasi (via **Supabase Realtime**).
  * **Booking Fasilitas:** Admin mendaftarkan fasilitas; Warga mem-*booking*.

-----

## 3\. Alur Aplikasi Kunci (Key Flows)

Arsitektur ini menggantikan *backend* Laravel dengan *server-side logic* Next.js.

### Alur Pembayaran IPL oleh Warga:

1.  Warga *login* (menggunakan *component* **Clerk** di **Next.js**).
2.  Warga membuka *dashboard* (Next.js Page). Halaman ini (via Server Component atau API Route) mengambil data tagihan dari **Supabase** untuk user yang sedang *login* (ID didapat dari **Clerk**).
3.  Warga klik "Bayar".
4.  Sebuah **Next.js Server Action** (atau API Route) dipanggil.
5.  Di *server-side*, *action* ini memvalidasi ID user dari **Clerk**, lalu menghubungi **Midtrans** untuk men-generate transaksi dan mengembalikan data QRIS.
6.  Frontend Next.js menampilkan QRIS.
7.  Warga memindai QRIS.
8.  Midtrans menerima pembayaran dan mengirim *webhook* ke sebuah *endpoint* **Next.js API Route** (misal: `/api/webhooks/midtrans`).
9.  API Route ini memverifikasi *webhook*, lalu meng-update status `ipl_bills` di **Supabase** menjadi `paid`.
10. API Route juga memanggil layanan **WhatsApp Gateway** ("Pembayaran Berhasil").
11. Dashboard warga (yang mendengarkan perubahan tabel `ipl_bills` via **Supabase Realtime**) otomatis me-*refresh* UI dan menampilkan status "Lunas".

### Alur Laporan Masalah oleh Warga:

1.  Warga *login* (via **Clerk**), masuk ke "Lapor Masalah".
2.  Warga mengisi form dan meng-upload foto.
3.  Frontend (Next.js Client Component) meng-upload foto langsung ke **Supabase Storage** menggunakan *signed URL* yang di-*generate* oleh API Route Next.js.
4.  Setelah foto ter-upload dan mendapatkan URL, *client* memanggil **Next.js Server Action**.
5.  *Server Action* mengambil ID user dari **Clerk** dan menyimpan data (deskripsi, URL foto) ke tabel `report_tickets` di **Supabase**.
6.  *Dashboard* Admin (yang *subscribe* ke *channel* **Supabase Realtime** untuk tabel `report_tickets`) langsung menerima *event* dan menampilkan notifikasi "Ada laporan baru".
7.  Admin mengubah status laporan (misal: "Ditangani"). Ini adalah *update* database.
8.  Aplikasi Warga (yang juga *subscribe* ke *channel* **Supabase Realtime**, difilter hanya untuk laporannya sendiri) menerima *event* perubahan status dan menampilkan notifikasi "Laporan Anda sedang ditangani".

-----

## 4\. Skema Database PostgreSQL (Disesuaikan untuk Clerk)

Perubahan Kunci:

1.  Tabel `users` diubah. `id` sekarang adalah `VARCHAR(255)` (atau `TEXT`) untuk menyimpan **Clerk User ID** (misal: `user_2...`).
2.  Kolom `password_hash` **dihapus** karena otentikasi ditangani oleh Clerk.
3.  Semua *Foreign Key* (`user_id`) di tabel lain diubah menjadi `VARCHAR(255)` (atau `TEXT`) agar sesuai.

<!-- end list -->

```sql
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
```