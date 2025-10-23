import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getUserReportTickets } from '@/lib/facilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ReportForm } from '@/components/dashboard/report-form';
import { StatusBadge } from '@/components/dashboard/stat-cards';
import { AlertTriangle, Calendar, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportTicket } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function FacilitiesReportPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  const reports = await getUserReportTickets();
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy HH:mm', { locale: id });
  };

  // Handle form submission
  const handleReportSubmit = async (formData: any) => {
    'use server';
    // In a real app, we would call createReportTicket here
    console.log('Submitting report with data:', formData);
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'kebersihan':
        return 'Kebersihan';
      case 'keamanan':
        return 'Keamanan';
      case 'penerangan':
        return 'Penerangan';
      case 'fasilitas':
        return 'Fasilitas';
      default:
        return category;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Laporkan Masalah Fasilitas</h1>
        <p className="text-muted-foreground">
          Bantu meningkatkan kualitas fasilitas dengan melaporkan masalah
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Riwayat Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports && reports.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report: ReportTicket) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {getCategoryLabel(report.category)}
                        </TableCell>
                        <TableCell>
                          {report.location_detail || '-'}
                        </TableCell>
                        <TableCell>
                          {formatDate(report.created_at)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={report.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto" />
                <p className="mt-2">Belum ada laporan masalah</p>
                <p className="text-sm mt-1">Laporan Anda akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Laporkan Masalah Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReportForm 
              onSubmit={handleReportSubmit}
              submitLabel="Kirim Laporan"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}