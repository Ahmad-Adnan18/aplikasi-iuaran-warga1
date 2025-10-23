import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Users, Bell } from 'lucide-react';

export default async function AdminSettingsPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pengaturan Admin</h1>
        <p className="text-muted-foreground">
          Atur konfigurasi sistem dan pengaturan aplikasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <CardTitle>Umum</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Notifikasi Otomatis</h3>
                <p className="text-sm text-muted-foreground">Kirim notifikasi otomatis ke warga</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Pengumuman Otomatis</h3>
                <p className="text-sm text-muted-foreground">Atur pengumuman otomatis bulanan</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <CardTitle>Keamanan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Verifikasi Akun</h3>
                <p className="text-sm text-muted-foreground">Wajibkan verifikasi email</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Log Aktivitas</h3>
                <p className="text-sm text-muted-foreground">Aktifkan pencatatan aktivitas</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle>Manajemen Pengguna</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Kebijakan Registrasi</h3>
                <p className="text-sm text-muted-foreground">Atur kebijakan pendaftaran warga</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Verifikasi Blok/Rumah</h3>
                <p className="text-sm text-muted-foreground">Verifikasi nomor blok saat registrasi</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <CardTitle>Notifikasi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">WhatsApp Gateway</h3>
                <p className="text-sm text-muted-foreground">Konfigurasi layanan WhatsApp</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Template Pesan</h3>
                <p className="text-sm text-muted-foreground">Atur template pesan notifikasi</p>
              </div>
              <Button variant="outline">Atur</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}