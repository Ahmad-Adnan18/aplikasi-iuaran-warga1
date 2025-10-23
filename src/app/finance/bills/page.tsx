import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getUserIPLBills } from '@/lib/finance';
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
import { DollarSign, Calendar, CreditCard, Eye, QrCode } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/stat-cards';
import { createPaymentForBills } from '@/lib/payment';
import { getUserById } from '@/lib/user-management';
import { toast } from 'sonner';

interface IPLBillsPageProps {
  searchParams?: {
    billId?: string;
  };
}

export default async function IPLBillsPage({ searchParams }: IPLBillsPageProps) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  const bills = await getUserIPLBills(clerkUser.id);
  
  if (!bills) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Gagal memuat data tagihan IPL</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Terjadi kesalahan saat memuat data tagihan Anda.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format month to name
  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1] || month.toString();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Keuangan - Tagihan IPL</h1>
        <p className="text-muted-foreground">
          Kelola dan bayar iuran perumahan Anda
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Tagihan IPL</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              QRIS
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {bills.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bulan & Tahun</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal Jatuh Tempo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        {getMonthName(bill.month)} {bill.year}
                      </TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell>
                        {bill.due_date ? new Date(bill.due_date).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={bill.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.status === 'paid' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" /> 
                            Lihat Bukti
                          </Button>
                        ) : (
                          <form 
                            action={async () => {
                              'use server';
                              // Create payment for this specific bill
                              const paymentResult = await createPaymentForBills(
                                clerkUser.id,
                                [bill.id], // Only this bill
                                {
                                  first_name: userProfile.name.split(' ')[0] || userProfile.name,
                                  email: userProfile.email,
                                  phone: userProfile.phone_number || '6281234567890', // Add default if not available
                                }
                              );

                              if (paymentResult) {
                                // Redirect to Midtrans page
                                redirect(paymentResult.redirect_url);
                              } else {
                                // For now, just redirect back to the bills page if payment creation fails
                                redirect('/finance/bills?error=payment_failed');
                              }
                            }}
                          >
                            <Button 
                              variant="default" 
                              size="sm"
                              type="submit"
                            >
                              <QrCode className="h-4 w-4 mr-1" /> 
                              Bayar Sekarang
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto" />
              <p className="mt-2">Belum ada tagihan IPL</p>
              <p className="text-sm mt-1">Tagihan IPL akan muncul di sini ketika sudah dibuat oleh admin</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}