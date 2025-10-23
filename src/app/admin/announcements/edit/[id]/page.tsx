import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getAnnouncements, updateAnnouncement } from '@/lib/announcements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { AnnouncementForm } from '@/components/dashboard/announcement-form';

interface EditAnnouncementPageProps {
  params: {
    id: string;
  };
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get the specific announcement to edit
  const announcements = await getAnnouncements();
  const announcement = announcements.find((ann: any) => ann.id === params.id);

  if (!announcement) {
    redirect('/admin/announcements'); // Redirect if announcement not found
  }

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
            <h1 className="text-3xl font-bold">Edit Pengumuman</h1>
            <p className="text-muted-foreground">
              Perbarui pengumuman komunitas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementForm 
              defaultValues={{
                title: announcement.title,
                content: announcement.content,
              }}
              onSubmit={async (data) => {
                'use server';
                const success = await updateAnnouncement(params.id, {
                  title: data.title,
                  content: data.content,
                });
                
                if (success) {
                  redirect('/admin/announcements');
                } else {
                  // Handle error
                  console.error('Failed to update announcement');
                }
              }}
              submitLabel="Simpan Perubahan"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}