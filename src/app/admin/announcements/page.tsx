import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/announcements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Eye, Edit, Trash2 } from 'lucide-react';
import { AnnouncementForm } from '@/components/dashboard/announcement-form';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default async function AdminAnnouncementsPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  const announcements = await getAnnouncements();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: id });
  };

  // Delete action
  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const success = await deleteAnnouncement(id);
    
    if (!success) {
      console.error('Error deleting announcement');
    }
    
    redirect('/admin/announcements');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin - Pengumuman</h1>
            <p className="text-muted-foreground">
              Kelola pengumuman untuk komunitas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daftar Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement: any) => (
                  <Card key={announcement.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span>oleh {announcement.users?.name || 'Admin'}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(announcement.created_at)}</span>
                          </div>
                        </div>
                        <Bell className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 whitespace-pre-line line-clamp-3">
                        {announcement.content}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/admin/announcements/${announcement.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat
                          </Button>
                        </Link>
                        <Link href={`/admin/announcements/edit/${announcement.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={announcement.id} />
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            type="submit"
                            onClick={(e) => {
                              if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 font-medium">Belum ada pengumuman</p>
                <p className="text-sm text-muted-foreground">Pengumuman akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buat Pengumuman Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementForm 
              onSubmit={async (data) => {
                'use server';
                await createAnnouncement({
                  title: data.title,
                  content: data.content,
                });
                redirect('/admin/announcements');
              }}
              submitLabel="Publikasikan"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}