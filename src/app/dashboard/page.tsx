import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding'); // User needs to complete onboarding
  }

  return <DashboardClient user={userProfile} />;
}