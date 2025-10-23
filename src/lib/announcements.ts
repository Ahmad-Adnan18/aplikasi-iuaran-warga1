'use server';

import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Announcement } from '@/types';

// Get all announcements
export async function getAnnouncements(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

// Get announcements by user role
export async function getAnnouncementsByRole(): Promise<any[]> {
  // Anyone can view announcements
  return await getAnnouncements();
}

// Create announcement (admin only)
export async function createAnnouncement(
  announcementData: Omit<Announcement, 'id' | 'created_at' | 'user_id'>
): Promise<Announcement | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        ...announcementData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    return data as Announcement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    return null;
  }
}

// Update announcement (admin only)
export async function updateAnnouncement(
  id: string,
  updateData: Partial<Announcement>
): Promise<any | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select('*, users(name)')
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    return null;
  }
}

// Delete announcement (admin only)
export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }
}