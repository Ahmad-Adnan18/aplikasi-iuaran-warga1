# Cluster Kita - Platform Manajemen Klaster dan Keterlibatan Komunitas

Platform terpadu untuk perumahan/klaster yang mengotomatiskan administrasi, meningkatkan keamanan, dan memfasilitasi komunitas.

## Fitur Utama

### Pilar 1: Keuangan & Administrasi Inti
- Manajemen Iuran (IPL) dengan pembayaran QRIS via Midtrans
- Riwayat transaksi yang transparan
- Pengajuan surat pengantar
- Manajemen data warga

### Pilar 2: Keamanan & Darurat
- Tombol darurat (SOS) dengan notifikasi instan
- Log aktivitas darurat

### Pilar 3: Interaksi & Keterlibatan Komunitas
- Papan pengumuman
- Forum warga
- Jajak pendapat (polling)
- Kotak saran privat

### Pilar 4: Pelaporan & Pengelolaan Fasilitas
- Sistem pelaporan masalah (ticketing)
- Booking fasilitas

## Teknologi yang Digunakan

- **Framework**: Next.js (App Router)
- **Backend**: Server Actions dan API Routes
- **Database**: Supabase (PostgreSQL)
- **Otentikasi**: Clerk
- **UI**: TailwindCSS dan shadcn/ui
- **Payment Gateway**: Midtrans
- **Notifikasi**: WhatsApp Gateway API

## Prasyarat

- Node.js 18+
- npm atau yarn
- Akun Supabase
- Akun Clerk
- Akun Midtrans (Sandbox atau Production)

## Instalasi

1. Clone repository ini:
```bash
git clone <repository-url>
cd aplikasi-iuaran-warga1
```

2. Install dependensi:
```bash
npm install
```

3. Salin file environment dan konfigurasi:
```bash
cp .env.example .env.local
```

4. Atur variabel lingkungan:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Midtrans Configuration (for payment gateway)
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

# WhatsApp Gateway Configuration
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_GATEWAY_URL=your_whatsapp_gateway_url

# Other Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Jalankan aplikasi:
```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## Konfigurasi Supabase

1. Buat proyek baru di https://supabase.com
2. Jalankan skema database dari `src/lib/database-setup.sql` di SQL Editor Supabase
3. Atur Row Level Security (RLS) sesuai dengan skema
4. Konfigurasi variabel lingkungan

## Konfigurasi Clerk

1. Buat aplikasi di https://clerk.com
2. Dapatkan key Clerk dan tambahkan ke variabel lingkungan
3. Konfigurasi webhook di Clerk untuk URL: `http://your-domain.com/api/webhooks/clerk`

## Konfigurasi Midtrans

1. Daftar akun Midtrans (sandbox atau production)
2. Dapatkan server key dan client key
3. Tambahkan ke variabel lingkungan
4. Konfigurasi webhook di Midtrans untuk URL: `http://your-domain.com/api/webhooks/midtrans`

## Struktur Aplikasi

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API Routes
│   ├── dashboard/          # Dashboard user
│   ├── admin/              # Admin panel
│   ├── finance/            # Financial management
│   ├── security/           # Security features
│   ├── community/          # Community features
│   ├── facilities/         # Facilities management
├── components/            # UI Components
│   ├── ui/                # shadcn/ui components
│   └── dashboard/         # Dashboard-specific components
├── lib/                   # Business logic and utilities
│   ├── supabase.ts        # Supabase client and functions
│   ├── auth.ts            # Authentication utilities
│   ├── finance.ts         # Financial management functions
│   ├── security.ts        # Security functions
│   ├── community.ts       # Community functions
│   ├── facilities.ts      # Facilities functions
│   ├── payment.ts         # Payment integration
│   ├── notifications.ts   # Notification functions
│   └── database-setup.sql # Database schema
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Penggunaan

- Warga dapat mendaftar dan login melalui Clerk
- Setelah login, warga dapat mengakses dashboard dan fitur sesuai peran
- Admin memiliki akses ke panel admin untuk mengelola sistem
- Sistem mendukung pembayaran IPL melalui QRIS Midtrans
- Notifikasi dikirim melalui WhatsApp Gateway

## Testing

```bash
npm run dev  # Menjalankan aplikasi dalam mode development
npm run build  # Membangun aplikasi untuk production
npm start  # Menjalankan aplikasi dalam mode production
```

## Deployment

Aplikasi siap untuk dideploy ke platform apapun yang mendukung Next.js 14+ dengan App Router (Vercel, Netlify, Railway, DigitalOcean, dll.)

Pastikan untuk:
1. Mengonfigurasi semua variabel lingkungan di production
2. Mengganti URL webhook di Clerk dan Midtrans ke URL production
3. Mengganti `MIDTRANS_IS_PRODUCTION` ke `true` jika menggunakan akun production Midtrans

## Lisensi

MIT