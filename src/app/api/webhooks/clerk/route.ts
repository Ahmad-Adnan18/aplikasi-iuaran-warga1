import { Webhook, WebhookRequiredHeaders } from 'svix';
import { headers } from 'next/headers';
import { buffer } from 'micro';
import { NextResponse } from 'next/server';
import { upsertUserProfile } from '@/lib/supabase';

export async function POST(req: Request) {
  // Get the headers from the request
  const headerData = headers();
  const svix_id = headerData.get('svix-id');
  const svix_timestamp = headerData.get('svix-timestamp');
  const svix_signature = headerData.get('svix-signature');

  // If any of the headers are missing, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing Svix headers', { status: 400 });
  }

  // Get the payload (raw body)
  const payload = await req.arrayBuffer();
  const decoder = new TextDecoder();
  const bodyText = decoder.decode(payload);

  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET in environment variables');
    return new NextResponse('Missing webhook secret', { status: 500 });
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(bodyText, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    } as WebhookRequiredHeaders);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error: Invalid signature', { status: 400 });
  }

  // Handle different event types
  const { id, email_addresses, phone_numbers, username, first_name, last_name } = evt.data;
  const { event_type } = evt;

  if (event_type === 'user.created') {
    try {
      // Extract user data from Clerk event
      const userData = {
        name: `${first_name || ''} ${last_name || ''}`.trim() || username || 'User',
        email: email_addresses?.[0]?.email_address || '',
        primaryPhoneNumber: phone_numbers?.[0] || null,
      };

      // Create or update user profile in Supabase
      await upsertUserProfile(id, userData);
      
      console.log(`User profile created for Clerk user: ${id}`);
    } catch (error) {
      console.error('Error creating user profile:', error);
      return new NextResponse('Error creating user profile', { status: 500 });
    }
  } else if (event_type === 'user.updated') {
    try {
      // Extract user data from Clerk event
      const userData = {
        name: `${first_name || ''} ${last_name || ''}`.trim() || username || 'User',
        email: email_addresses?.[0]?.email_address || '',
        primaryPhoneNumber: phone_numbers?.[0] || null,
      };

      // Update user profile in Supabase
      await upsertUserProfile(id, userData);
      
      console.log(`User profile updated for Clerk user: ${id}`);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return new NextResponse('Error updating user profile', { status: 500 });
    }
  } else if (event_type === 'user.deleted') {
    // Optionally handle user deletion
    console.log(`User deleted: ${id}`);
  }

  // Return successful response
  return new NextResponse('Webhook received', { status: 200 });
}