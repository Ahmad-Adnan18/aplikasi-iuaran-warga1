'use server';

import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Get dashboard stats for warga
export async function getWargaDashboardStats(userId: string) {
  try {
    // Get user's pending bills
    const { data: bills, error: billsError } = await supabase
      .from('ipl_bills')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'overdue']);
    
    if (billsError) throw billsError;
    
    // Get user's report tickets
    const { data: reports, error: reportsError } = await supabase
      .from('report_tickets')
      .select('*')
      .eq('user_id', userId);
    
    if (reportsError) throw reportsError;
    
    // Get recent announcements
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (announcementsError) throw announcementsError;
    
    // Calculate stats
    const pendingBills = bills?.filter(bill => bill.status === 'pending')?.length || 0;
    const overdueBills = bills?.filter(bill => bill.status === 'overdue')?.length || 0;
    const totalReports = reports?.length || 0;
    const newReports = reports?.filter(report => 
      new Date(report.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    )?.length || 0;
    
    return {
      pendingBills,
      overdueBills,
      totalReports,
      newReports,
      totalAnnouncements: announcements?.length || 0,
      recentAnnouncements: announcements || []
    };
  } catch (error) {
    console.error('Error fetching warga dashboard stats:', error);
    return {
      pendingBills: 0,
      overdueBills: 0,
      totalReports: 0,
      newReports: 0,
      totalAnnouncements: 0,
      recentAnnouncements: []
    };
  }
}

// Get dashboard stats for admin
export async function getAdminDashboardStats() {
  try {
    // Get total users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) throw usersError;
    
    // Get all bills
    const { data: bills, error: billsError } = await supabase
      .from('ipl_bills')
      .select('*');
    
    if (billsError) throw billsError;
    
    // Get all report tickets
    const { data: reports, error: reportsError } = await supabase
      .from('report_tickets')
      .select('*');
    
    if (reportsError) throw reportsError;
    
    // Get announcements
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*');
    
    if (announcementsError) throw announcementsError;
    
    // Calculate stats
    const totalUsers = users?.length || 0;
    const pendingBills = bills?.filter(bill => bill.status === 'pending')?.length || 0;
    const overdueBills = bills?.filter(bill => bill.status === 'overdue')?.length || 0;
    const totalReports = reports?.length || 0;
    const newReports = reports?.filter(report => 
      new Date(report.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    )?.length || 0;
    
    return {
      totalUsers,
      pendingBills,
      overdueBills,
      totalReports,
      newReports,
      totalAnnouncements: announcements?.length || 0
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return {
      totalUsers: 0,
      pendingBills: 0,
      overdueBills: 0,
      totalReports: 0,
      newReports: 0,
      totalAnnouncements: 0
    };
  }
}