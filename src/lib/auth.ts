'use server';

import { cookies } from 'next/headers';
import { currentUser } from '@clerk/nextjs/server';
import { SessionUser, User } from '@/types';
import { getUserProfile, isAdmin as checkIsAdmin, isWarga as checkIsWarga } from './supabase';

// Get current user from Clerk and database
export const getCurrentUser = async (): Promise<SessionUser | null> => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const userProfile = await getUserProfile(clerkUser.id);
    if (!userProfile) {
      return null;
    }

    return {
      id: clerkUser.id,
      name: clerkUser.fullName || userProfile.name || clerkUser.emailAddresses[0]?.emailAddress || 'User',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      role: userProfile.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if current user has admin role
export const requireAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    return user.role === 'admin';
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

// Check if current user has warga role
export const requireWarga = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    return user.role === 'warga' || user.role === 'admin'; // Admin can access warga features too
  } catch (error) {
    console.error('Error checking warga access:', error);
    return false;
  }
};

// Get user role
export const getUserRole = async (): Promise<'admin' | 'warga' | null> => {
  try {
    const user = await getCurrentUser();
    return user?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};