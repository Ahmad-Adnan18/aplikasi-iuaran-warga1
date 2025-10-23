'use server';

import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { SOSLog } from '@/types';

// Create a new SOS log
export async function createSOSLog(sosData: Omit<SOSLog, 'id' | 'created_at'>): Promise<SOSLog | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('sos_logs')
      .insert([{
        ...sosData,
        user_id: user.id, // Ensure it's the current user
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating SOS log:', error);
      throw error;
    }

    return data as SOSLog;
  } catch (error) {
    console.error('Error in createSOSLog:', error);
    return null;
  }
}

// Get SOS logs for admin
export async function getSOSLogs(): Promise<SOSLog[] | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('sos_logs')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching SOS logs:', error);
      return null;
    }

    return data as SOSLog[];
  } catch (error) {
    console.error('Error in getSOSLogs:', error);
    return null;
  }
}

// Get SOS logs for a specific user
export async function getUserSOSLogs(): Promise<SOSLog[] | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('sos_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user SOS logs:', error);
      return null;
    }

    return data as SOSLog[];
  } catch (error) {
    console.error('Error in getUserSOSLogs:', error);
    return null;
  }
}