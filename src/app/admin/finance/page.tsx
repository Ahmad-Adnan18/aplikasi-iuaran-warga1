import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getAllIPLBills, createIPLBill } from '@/lib/finance';
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
import { DollarSign, Plus, Calendar, CreditCard } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/stat-cards';
import { IPLBillForm } from '@/components/dashboard/ipl-bill-form';

export default async function AdminFinancePage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  const bills = await getAllIPLBills();
  
  if (!bills) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Gagal memuat data keuangan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Anda mungkin tidak memiliki izin untuk mengakses halaman ini.
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

  // Handle form submission
  const handleCreateBill = async (formData: any) => {
    'use server';
    // This would be handled in a separate action file in a real application
    console.log('Creating bill with data:', formData);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin - Keuangan</h1>
        <p className="text-muted-foreground">
          Kelola tagihan IPL untuk seluruh warga
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Tagihan IPL</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Warga</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Bulan & Tahun</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tanggal Jatuh Tempo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill: any) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          {bill.users?.name || 'Tidak Diketahui'}
                        </TableCell>
                        <TableCell>
                          {bill.users?.email || '-'}
                        </TableCell>
                        <TableCell>
                          {getMonthName(bill.month)} {bill.year}
                        </TableCell>
                        <TableCell>{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>
                          {bill.due_date ? new Date(bill.due_date).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={bill.status} />
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
                <p className="text-sm mt-1">Buat tagihan IPL baru menggunakan form di samping</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buat Tagihan IPL</CardTitle>
          </CardHeader>
          <CardContent>
            <IPLBillForm 
              onSubmit={async (data) => {
                'use server';
                await createIPLBill({
                  user_id: userProfile.id, // In a real app, this would be selected from a user list
                  month: data.month,
                  year: data.year,
                  amount: parseFloat(data.amount),
                  due_date: data.dueDate,
                });
                // Revalidate the page to show the new bill
                redirect('/admin/finance');
              }}
              submitLabel="Buat Tagihan"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}