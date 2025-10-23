import { createClient } from '@supabase/supabase-js';
import { User } from '@/types';

// Create a single Supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Function to get user profile from database
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Function to create or update user profile based on Clerk user
export const upsertUserProfile = async (
  clerkUserId: string, 
  clerkUserData: { 
    name: string; 
    email: string; 
    primaryPhoneNumber?: { phoneNumber: string } | null 
  }
): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: clerkUserId,
        name: clerkUserData.name,
        email: clerkUserData.email,
        phone_number: clerkUserData.primaryPhoneNumber?.phoneNumber || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    return null;
  }
};

// Function to check if user has admin role
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await getUserProfile(userId);
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

// Function to check if user has warga role
export const isWarga = async (userId: string): Promise<boolean> => {
  try {
    const user = await getUserProfile(userId);
    return user?.role === 'warga';
  } catch (error) {
    console.error('Error checking warga role:', error);
    return false;
  }
};

// Function to update user role
export const updateUserRole = async (userId: string, role: 'admin' | 'warga'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Function to get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data as User[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};