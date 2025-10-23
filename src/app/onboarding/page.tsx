import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile, upsertUserProfile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function OnboardingPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Check if user profile already exists
  const existingProfile = await getUserProfile(clerkUser.id);
  if (existingProfile) {
    redirect('/dashboard');
  }

  // Create user profile
  const createProfile = async (formData: FormData) => {
    'use server';
    
    const blockNumber = formData.get('blockNumber') as string;
    const phone = formData.get('phone') as string;
    
    // Get user data from Clerk
    const user = await currentUser();
    if (!user) return;

    // Create profile in Supabase
    await upsertUserProfile(user.id, {
      name: user.fullName || user.firstName + ' ' + user.lastName || user.username || 'User',
      email: user.emailAddresses[0]?.emailAddress || '',
      primaryPhoneNumber: phone ? { phoneNumber: phone } : null,
    });

    // Update with block number if provided
    if (blockNumber) {
      const { supabase } = await import('@/lib/supabase');
      await supabase
        .from('users')
        .update({ block_number: blockNumber })
        .eq('id', user.id);
    }

    redirect('/dashboard');
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="mt-4">Selamat Datang di Cluster Kita!</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Lengkapi profil Anda untuk memulai
          </p>
        </CardHeader>
        <CardContent>
          <form action={createProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="flex items-center border rounded-md px-3 bg-muted">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  defaultValue={clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User'}
                  readOnly
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center border rounded-md px-3 bg-muted">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  defaultValue={clerkUser.emailAddresses[0]?.emailAddress || ''}
                  readOnly
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input 
                id="phone" 
                name="phone" 
                placeholder="Contoh: 081234567890"
                defaultValue={clerkUser.phoneNumbers[0]?.phoneNumber || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="block">Nomor Blok/Rumah</Label>
              <div className="flex items-center border rounded-md px-3">
                <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input 
                  id="block" 
                  name="blockNumber" 
                  placeholder="Contoh: A1-5"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Selesaikan Onboarding
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}