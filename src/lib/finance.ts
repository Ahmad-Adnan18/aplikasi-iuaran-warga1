'use server';

import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { IPLBill, Transaction, TransactionBillDetail } from '@/types';

// Get all IPL bills for a user
export async function getUserIPLBills(userId: string): Promise<IPLBill[] | null> {
  try {
    const { data, error } = await supabase
      .from('ipl_bills')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching IPL bills:', error);
      return null;
    }

    return data as IPLBill[];
  } catch (error) {
    console.error('Error in getUserIPLBills:', error);
    return null;
  }
}

// Get all IPL bills (admin only)
export async function getAllIPLBills(): Promise<IPLBill[] | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('ipl_bills')
      .select('*, users(name, email)')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching all IPL bills:', error);
      return null;
    }

    return data as IPLBill[];
  } catch (error) {
    console.error('Error in getAllIPLBills:', error);
    return null;
  }
}

// Create a new IPL bill (admin only)
export async function createIPLBill(billData: Omit<IPLBill, 'id' | 'created_at' | 'updated_at'>): Promise<IPLBill | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('ipl_bills')
      .insert([billData])
      .select()
      .single();

    if (error) {
      console.error('Error creating IPL bill:', error);
      throw error;
    }

    return data as IPLBill;
  } catch (error) {
    console.error('Error in createIPLBill:', error);
    return null;
  }
}

// Update an IPL bill (admin only)
export async function updateIPLBill(id: string, updates: Partial<IPLBill>): Promise<IPLBill | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('ipl_bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating IPL bill:', error);
      throw error;
    }

    return data as IPLBill;
  } catch (error) {
    console.error('Error in updateIPLBill:', error);
    return null;
  }
}

// Create a payment transaction
export async function createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return data as Transaction;
  } catch (error) {
    console.error('Error in createTransaction:', error);
    return null;
  }
}

// Create transaction bill details
export async function createTransactionBillDetail(detailData: Omit<TransactionBillDetail, 'id'>): Promise<TransactionBillDetail | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('transaction_bill_details')
      .insert([detailData])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction bill detail:', error);
      throw error;
    }

    return data as TransactionBillDetail;
  } catch (error) {
    console.error('Error in createTransactionBillDetail:', error);
    return null;
  }
}