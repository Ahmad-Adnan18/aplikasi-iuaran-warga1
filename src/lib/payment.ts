'use server';

import { createTransaction, createTransactionBillDetail } from '@/lib/finance';
import { updateIPLBill } from '@/lib/finance';
import { Transaction, TransactionBillDetail } from '@/types';
import { supabase } from '@/lib/supabase';

// Midtrans API configuration
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;
const baseUrl = isProduction 
  ? 'https://api.midtrans.com' 
  : 'https://api.sandbox.midtrans.com';

interface MidtransTransactionRequest {
  payment_type: string;
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  credit_card?: {
    secure: boolean;
  };
  customer_details?: {
    first_name: string;
    email: string;
    phone: string;
  };
}

interface MidtransTransactionResponse {
  token: string;
  redirect_url: string;
  transaction_id: string;
}

// Create Midtrans transaction
export async function createMidtransTransaction(
  orderId: string,
  amount: number,
  customerDetails?: {
    first_name: string;
    email: string;
    phone: string;
  }
): Promise<MidtransTransactionResponse | null> {
  try {
    if (!serverKey) {
      throw new Error('MIDTRANS_SERVER_KEY is not configured');
    }

    const requestBody: MidtransTransactionRequest = {
      payment_type: 'qris',
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
    };

    if (customerDetails) {
      requestBody.customer_details = customerDetails;
    }

    const response = await fetch(`${baseUrl}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Midtrans API error: ${errorData.status_code} - ${errorData.status_message}`);
    }

    const data = await response.json();
    return {
      token: data.token,
      redirect_url: data.redirect_url,
      transaction_id: data.transaction_id,
    };
  } catch (error) {
    console.error('Error creating Midtrans transaction:', error);
    return null;
  }
}

// Verify Midtrans transaction
export async function verifyMidtransTransaction(transactionId: string): Promise<any> {
  try {
    if (!serverKey) {
      throw new Error('MIDTRANS_SERVER_KEY is not configured');
    }

    const response = await fetch(`${baseUrl}/v2/${transactionId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Midtrans API error: ${errorData.status_code} - ${errorData.status_message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying Midtrans transaction:', error);
    throw error;
  }
}

// Handle Midtrans webhook
export async function handleMidtransWebhook(payload: any): Promise<void> {
  try {
    // Verify the transaction with Midtrans
    const transaction = await verifyMidtransTransaction(payload.transaction_id);
    
    if (transaction.transaction_status === 'settlement' || transaction.transaction_status === 'capture') {
      // Update the IPL bill status to 'paid'
      // Extract the IPL bill IDs from the order_id
      const orderId = transaction.order_id;
      
      // In a real app, we would parse the order_id to get the IPL bill IDs
      // For now, let's assume the order_id corresponds to a single IPL bill id
      // In practice, you might have a mapping of order_id to bill details
      
      // Update the bill status to paid
      // await updateIPLBill(orderId, { status: 'paid' });
      
      // Create a transaction record
      const transactionRecord: Omit<Transaction, 'id' | 'created_at'> = {
        user_id: transaction.custom_field1?.user_id || '', // Assuming user_id is passed as custom field
        amount_paid: transaction.gross_amount,
        status: 'success',
        payment_method: 'qris',
        external_id: transaction.transaction_id,
        payment_time: transaction.settlement_time || new Date().toISOString(),
      };
      
      await createTransaction(transactionRecord);
      
      console.log(`Payment successful for transaction: ${transaction.transaction_id}`);
    } else if (transaction.transaction_status === 'cancel' || 
               transaction.transaction_status === 'expire' || 
               transaction.transaction_status === 'deny') {
      // Update the transaction status to failed
      const transactionRecord: Omit<Transaction, 'id' | 'created_at'> = {
        user_id: transaction.custom_field1?.user_id || '', 
        amount_paid: transaction.gross_amount,
        status: 'failed',
        payment_method: 'qris',
        external_id: transaction.transaction_id,
      };
      
      await createTransaction(transactionRecord);
      
      console.log(`Payment failed for transaction: ${transaction.transaction_id}`);
    }
  } catch (error) {
    console.error('Error handling Midtrans webhook:', error);
    throw error;
  }
}

// Create payment for IPL bills
export async function createPaymentForBills(
  userId: string,
  billIds: string[],
  customerDetails: {
    first_name: string;
    email: string;
    phone: string;
  }
): Promise<MidtransTransactionResponse | null> {
  try {
    // Fetch the specific bills to calculate total amount
    const { data: bills, error } = await supabase
      .from('ipl_bills')
      .select('id, amount, status')
      .in('id', billIds)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
    
    if (!bills || bills.length === 0) {
      throw new Error('No bills found for payment');
    }
    
    // Verify that all bills belong to the user and are pending/overdue
    for (const bill of bills) {
      if (bill.status !== 'pending' && bill.status !== 'overdue') {
        throw new Error(`Bill ${bill.id} is not available for payment`);
      }
    }
    
    // Calculate total amount
    const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
    
    // Create a unique order ID
    const orderId = `IPL_${userId}_${Date.now()}`;
    
    // Create transaction in our system (pending status)
    const transactionRecord: Omit<Transaction, 'id' | 'created_at'> = {
      user_id: userId,
      amount_paid: totalAmount,
      status: 'pending',
      payment_method: 'qris',
      external_id: orderId, // This will be updated with actual transaction ID
    };
    
    const dbTransaction = await createTransaction(transactionRecord);
    if (!dbTransaction) {
      throw new Error('Failed to create transaction record');
    }
    
    // Create transaction details linking to bills
    for (const billId of billIds) {
      const detail: Omit<TransactionBillDetail, 'id'> = {
        transaction_id: dbTransaction.id,
        ipl_bill_id: billId,
      };
      
      await createTransactionBillDetail(detail);
    }
    
    // Create Midtrans transaction
    const midtransResponse = await createMidtransTransaction(orderId, totalAmount, customerDetails);
    
    if (midtransResponse) {
      // Update the external_id with the actual transaction ID from Midtrans
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ external_id: midtransResponse.transaction_id })
        .eq('id', dbTransaction.id);
        
      if (updateError) {
        console.error('Error updating transaction external_id:', updateError);
        throw updateError;
      }
      
      return midtransResponse;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating payment for bills:', error);
    throw error;
  }
}