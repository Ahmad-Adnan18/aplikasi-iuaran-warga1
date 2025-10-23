import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import AdminSidebar from './admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/dashboard'); // Redirect non-admin users to dashboard
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar user={userProfile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}