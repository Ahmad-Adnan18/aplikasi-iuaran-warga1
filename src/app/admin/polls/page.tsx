import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';

export default async function AdminPollsPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Mock data
  const polls = [
    { id: '1', question: 'Apakah Anda setuju dengan penambahan fasilitas taman?', status: 'aktif', votes: 42 },
    { id: '2', question: 'Jadwal rapat warga yang paling cocok?', status: 'aktif', votes: 28 },
    { id: '3', question: 'Pemilihan RT periode berikutnya', status: 'selesai', votes: 156 },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin - Jajak Pendapat</h1>
            <p className="text-muted-foreground">
              Kelola polling komunitas
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Polling Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map((poll) => (
          <Card key={poll.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{poll.question}</CardTitle>
                <BarChart3 className="h-5 w-5 text-blue-500 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${poll.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {poll.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Suara</span>
                  <span>{poll.votes}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button variant="outline" size="sm" className="flex-1">
                  Lihat Detail
                </Button>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}