import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getAnnouncements } from '@/lib/announcements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AnnouncementDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  // Get the specific announcement
  const announcements = await getAnnouncements();
  const announcement = announcements.find((ann: any) => ann.id === params.id);

  if (!announcement) {
    redirect('/community/announcements'); // Redirect if announcement not found
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy HH:mm', { locale: id });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detail Pengumuman</h1>
            <p className="text-muted-foreground">
              Lihat detail pengumuman komunitas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <span>Diposting oleh {announcement.users?.name || 'Admin'}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(announcement.created_at)}</span>
                </div>
              </div>
              {userProfile.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => {
                  window.location.href = `/admin/announcements/edit/${announcement.id}`;
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-line text-lg">
                {announcement.content}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}