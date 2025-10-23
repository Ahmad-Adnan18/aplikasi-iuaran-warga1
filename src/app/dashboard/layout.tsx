import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import DashboardSidebar from './sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar user={userProfile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}