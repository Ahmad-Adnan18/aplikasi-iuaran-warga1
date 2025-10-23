import { getAllUsers } from '@/lib/user-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Lock, Shield, User, UserRoundX } from 'lucide-react';
import { updateUserRole } from '@/lib/user-management';
import { revalidatePath } from 'next/cache';

export default async function UserManagementPage() {
  const users = await getAllUsers();

  if (!users) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <UserRoundX className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Gagal memuat data pengguna</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Anda mungkin tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'warga') => {
    'use server';
    await updateUserRole(userId, newRole);
    revalidatePath('/admin/users');
  };

  const UserActionCell = ({ user }: { user: { id: string; role: string } }) => {
    const isAdmin = user.role === 'admin';
    
    return (
      <form className="flex gap-2">
        <Button
          formAction={async () => {
            'use server';
            await updateUserRole(user.id, isAdmin ? 'warga' : 'admin');
            revalidatePath('/admin/users');
          }}
          variant="outline"
          size="sm"
        >
          {isAdmin ? 'Jadikan Warga' : 'Jadikan Admin'}
        </Button>
      </form>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manajemen Warga</h1>
        <p className="text-muted-foreground">
          Kelola pengguna dan peran dalam sistem
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Warga Perumahan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={user.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" /> 
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" /> 
                            Warga
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.block_number || '-'}</TableCell>
                    <TableCell>
                      <UserActionCell user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto" />
              <p className="mt-2">Belum ada pengguna terdaftar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}