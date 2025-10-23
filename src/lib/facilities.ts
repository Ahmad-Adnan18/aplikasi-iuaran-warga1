'use server';

import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { ReportTicket, Facility, FacilityBooking } from '@/types';

// Report tickets services
export async function createReportTicket(reportData: Omit<ReportTicket, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>): Promise<ReportTicket | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('report_tickets')
      .insert([{
        ...reportData,
        user_id: user.id,
        status: 'baru',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating report ticket:', error);
      throw error;
    }

    return data as ReportTicket;
  } catch (error) {
    console.error('Error in createReportTicket:', error);
    return null;
  }
}

export async function getUserReportTickets(): Promise<ReportTicket[] | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('report_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user report tickets:', error);
      return null;
    }

    return data as ReportTicket[];
  } catch (error) {
    console.error('Error in getUserReportTickets:', error);
    return null;
  }
}

export async function getAllReportTickets(): Promise<ReportTicket[] | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('report_tickets')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all report tickets:', error);
      return null;
    }

    return data as ReportTicket[];
  } catch (error) {
    console.error('Error in getAllReportTickets:', error);
    return null;
  }
}

export async function updateReportTicketStatus(id: string, status: 'baru' | 'ditangani' | 'selesai'): Promise<ReportTicket | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('report_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report ticket status:', error);
      throw error;
    }

    return data as ReportTicket;
  } catch (error) {
    console.error('Error in updateReportTicketStatus:', error);
    return null;
  }
}

// Facilities services
export async function getFacilities(): Promise<Facility[] | null> {
  try {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching facilities:', error);
      return null;
    }

    return data as Facility[];
  } catch (error) {
    console.error('Error in getFacilities:', error);
    return null;
  }
}

export async function createFacility(facilityData: Omit<Facility, 'id'>): Promise<Facility | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('facilities')
      .insert([facilityData])
      .select()
      .single();

    if (error) {
      console.error('Error creating facility:', error);
      throw error;
    }

    return data as Facility;
  } catch (error) {
    console.error('Error in createFacility:', error);
    return null;
  }
}

// Facility booking services
export async function createBooking(bookingData: Omit<FacilityBooking, 'id' | 'created_at'>): Promise<FacilityBooking | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('facility_bookings')
      .insert([{
        ...bookingData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data as FacilityBooking;
  } catch (error) {
    console.error('Error in createBooking:', error);
    return null;
  }
}

export async function getUserBookings(): Promise<FacilityBooking[] | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('facility_bookings')
      .select('*, facilities(name)')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching user bookings:', error);
      return null;
    }

    return data as FacilityBooking[];
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    return null;
  }
}