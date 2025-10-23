'use server';

import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { 
  getAllUsers as getAllUsersFromDb, 
  updateUserRole as updateUserRoleInDb,
  getUserProfile 
} from '@/lib/supabase';
import { User } from '@/types';

export async function getAllUsers(): Promise<User[] | null> {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return await getAllUsersFromDb();
  } catch (error) {
    console.error('Error getting all users:', error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: 'admin' | 'warga'): Promise<boolean> {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    await updateUserRoleInDb(userId, role);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      // Regular users can only get their own profile
      if (currentUser?.id !== userId) {
        throw new Error('Unauthorized: Cannot access other users profile');
      }
    }
    
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}