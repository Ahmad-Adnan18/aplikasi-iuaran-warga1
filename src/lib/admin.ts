'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

// Fungsi untuk memeriksa apakah pengguna adalah admin
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  return user;
}

// Fungsi untuk memeriksa akses ke fitur admin tertentu
export async function checkAdminAccess(feature?: string) {
  const user = await requireAdmin();
  
  // Di sini kita bisa menambahkan logika tambahan untuk akses spesifik fitur
  // Misalnya berdasarkan izin penggunaan fitur tertentu
  
  return user;
}