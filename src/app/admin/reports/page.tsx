import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getSOSLogs } from '@/lib/security';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ShieldAlert, History, AlertTriangle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function AdminSOSPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  const sosLogs = await getSOSLogs();
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy HH:mm', { locale: id });
  };

  // Get label for SOS type
  const getSOSLabel = (type: string) => {
    switch (type) {
      case 'kebakaran':
        return { label: 'Kebakaran', color: 'bg-red-500' };
      case 'medis':
        return { label: 'Medis', color: 'bg-red-500' };
      case 'keamanan':
        return { label: 'Keamanan', color: 'bg-red-500' };
      default:
        return { label: type, color: 'bg-gray-500' };
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin - Laporan Darurat</h1>
        <p className="text-muted-foreground">
          Pantau dan kelola permintaan bantuan darurat dari warga
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Riwayat Permintaan Darurat
          </CardTitle>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Ekspor Laporan
          </Button>
        </CardHeader>
        <CardContent>
          {sosLogs && sosLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Warga</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Jenis Darurat</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sosLogs.map((log: any) => {
                    const sosInfo = getSOSLabel(log.type);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.users?.name || 'Tidak Diketahui'}
                        </TableCell>
                        <TableCell>
                          {log.users?.email || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={sosInfo.color}>
                            {sosInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto" />
              <p className="mt-2">Belum ada permintaan darurat</p>
              <p className="text-sm mt-1">Permintaan darurat dari warga akan muncul di sini</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}