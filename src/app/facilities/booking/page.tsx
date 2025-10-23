import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getFacilities, getUserBookings } from '@/lib/facilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function FacilitiesBookingPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  const facilities = await getFacilities();
  const bookings = await getUserBookings();
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: id });
  };

  // Format time
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: id });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Booking Fasilitas</h1>
        <p className="text-muted-foreground">
          Pesan fasilitas perumahan sesuai kebutuhan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daftar Fasilitas Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {facilities && facilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((facility) => (
                  <Card key={facility.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{facility.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{facility.description}</p>
                        <div className="flex items-center mt-2 text-sm">
                          <Badge variant="outline">
                            {facility.requires_approval ? 'Perlu Persetujuan' : 'Booking Langsung'}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Pesan
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto" />
                <p className="mt-2">Belum ada fasilitas tersedia</p>
                <p className="text-sm mt-1">Fasilitas akan ditambahkan oleh admin</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Riwayat Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.facilities?.name || 'Fasilitas Tidak Diketahui'}
                        </TableCell>
                        <TableCell>
                          {formatDate(booking.start_time)}<br />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'default' :
                              booking.status === 'pending' ? 'secondary' :
                              booking.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {booking.status === 'approved' ? 'Disetujui' : 
                             booking.status === 'pending' ? 'Menunggu' : 
                             booking.status === 'rejected' ? 'Ditolak' : 'Dibatalkan'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto" />
                <p className="mt-2">Belum ada booking</p>
                <p className="text-sm mt-1">Booking Anda akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}