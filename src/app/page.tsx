"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Zap,
  Database,
  Shield,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <SignedOut>
              <SignInButton>
                <Button size="sm" className="text-xs sm:text-sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-xl sm:w-[60px] sm:h-[60px] flex items-center justify-center">
            <span className="text-white font-bold text-xl">CK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-blue-400 bg-clip-text text-transparent">
            Cluster Kita
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Platform terpadu untuk manajemen klaster dan keterlibatan komunitas
        </p>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="text-4xl sm:text-5xl mb-2">🏠</div>
          <div className="font-bold text-lg sm:text-xl mb-1">Selamat Datang di Cluster Kita</div>
          <div className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Platform terpadu untuk mengelola administrasi, keamanan, dan interaksi komunitas perumahan/klaster Anda
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mb-8">
          {/* Features */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Fitur Utama
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Manajemen Iuran (IPL) & Pembayaran QRIS</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Keamanan & Tombol Darurat (SOS)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Interaksi Komunitas & Forum Warga</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Pelaporan Masalah & Booking Fasilitas</span>
              </li>
            </ul>
          </div>

          {/* Getting Started */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              Mulai Sekarang
            </h3>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Daftar sebagai warga atau admin</li>
              <li>Akses dashboard sesuai peran Anda</li>
              <li>Gunakan fitur-fitur untuk mengelola klaster</li>
              <li>Ikuti komunitas dan komunikasi</li>
            </ol>
          </div>
        </div>

        {/* Chat Section */}
        <SignedIn>
          <div className="mt-6 sm:mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-2">Selamat Datang!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Anda telah berhasil masuk. Akses dashboard sesuai peran Anda.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = "/dashboard"}
                >
                  Dashboard Saya
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = "/profile"}
                >
                  Profil Saya
                </Button>
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
