import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, Settings } from 'lucide-react';

export default async function AdminFacilitiesPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Mock data
  const facilities = [
    { id: '1', name: 'Ruang Serbaguna', description: 'Untuk acara warga dan pertemuan', bookings: 12, active: true },
    { id: '2', name: 'Taman Bermain', description: 'Area bermain anak-anak', bookings: 8, active: true },
    { id: '3', name: 'Kolam Renang', description: 'Kolam renang umum cluster', bookings: 24, active: true },
    { id: '4', name: 'Gazebo', description: 'Tempat bersantai dan kumpul warga', bookings: 5, active: false },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin - Fasilitas</h1>
            <p className="text-muted-foreground">
              Kelola fasilitas cluster dan booking
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Fasilitas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <Card key={facility.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{facility.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-xs">{facility.bookings} booking</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${facility.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {facility.active ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Booking Bulan Ini</span>
                  <span>{facility.bookings}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button variant="outline" size="sm" className="flex-1">
                  Lihat Booking
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}