import { NextRequest, NextResponse } from 'next/server';
import { handleMidtransWebhook } from '@/lib/payment';
import { sendPaymentConfirmation } from '@/lib/notifications';
import { getUserIPLBills, updateIPLBill } from '@/lib/finance';

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from Midtrans if possible (implementation depends on your Midtrans plan)
    const payload = await req.json();
    
    console.log('Midtrans webhook received:', payload);
    
    // Handle the Midtrans webhook
    await handleMidtransWebhook(payload);
    
    // If the transaction was successful, update the bill status and send notification
    if (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture') {
      // In a real implementation, you would extract the user ID from the payload
      // For now, we'll just log that the payment was successful
      console.log(`Payment successful for order ${payload.order_id}`);
      
      // Example: send payment confirmation notification
      // This would require looking up the user ID associated with the transaction
      // await sendPaymentConfirmation(userId, amount);
    }
    
    // Return success response to Midtrans
    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook processed successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing Midtrans webhook:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to process webhook'
    }, { status: 500 });
  }
}