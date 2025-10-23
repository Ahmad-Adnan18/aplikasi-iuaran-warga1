import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getUserSOSLogs } from '@/lib/security';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SosButton } from '@/components/dashboard/sos-button';
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
import { ShieldAlert, History, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function SOSSecurityPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  const sosLogs = await getUserSOSLogs();
  
  // Handle SOS emergency submission
  const handleEmergency = async (type: string) => {
    'use server';
    // This would call the createSOSLog function in a real application
    console.log('Emergency type:', type);
  };

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
        <h1 className="text-3xl font-bold">Keamanan & Darurat</h1>
        <p className="text-muted-foreground">
          Akses tombol darurat dan lihat riwayat permintaan bantuan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Tombol Darurat (SOS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Tekan tombol di bawah ini dalam situasi darurat. Permintaan bantuan akan langsung terkirim ke admin dan pihak berwenang.
              </p>
              
              <SosButton onEmergency={async (type) => {
                'use server';
                // In a real app, we would call the createSOSLog function here
                console.log('Emergency triggered:', type);
              }} />
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Panduan Penggunaan
                </h3>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Gunakan tombol ini hanya dalam situasi darurat yang sebenarnya</li>
                  <li>Pilih jenis darurat yang paling sesuai dengan situasi Anda</li>
                  <li>Bantuan akan segera datang setelah permintaan dikirim</li>
                  <li>Anda akan menerima notifikasi melalui WhatsApp setelah permintaan diproses</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Permintaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sosLogs && sosLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sosLogs.map((log) => {
                      const sosInfo = getSOSLabel(log.type);
                      return (
                        <TableRow key={log.id}>
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
              <div className="text-center py-4 text-muted-foreground">
                <ShieldAlert className="h-10 w-10 mx-auto opacity-50" />
                <p className="mt-2">Belum ada permintaan darurat</p>
                <p className="text-sm mt-1">Riwayat permintaan akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}