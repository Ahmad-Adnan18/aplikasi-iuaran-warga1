import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getAnnouncements } from '@/lib/announcements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function AnnouncementsPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  const announcements = await getAnnouncements();
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy HH:mm', { locale: id });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pengumuman Komunitas</h1>
        <p className="text-muted-foreground">
          Informasi penting dari admin untuk seluruh warga
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement: any) => (
            <Card key={announcement.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <Bell className="h-5 w-5 text-blue-500 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4">
                  <p className="text-muted-foreground whitespace-pre-line">{announcement.content}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-auto pt-4 border-t">
                  <User className="h-4 w-4 mr-2" />
                  <span>
                    {announcement.users?.name || 'Admin'} • {formatDate(announcement.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2">Belum ada pengumuman</p>
            <p className="text-sm text-muted-foreground">Pengumuman akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
}