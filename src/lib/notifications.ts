'use server';

import { getUserProfile } from '@/lib/supabase';

interface WhatsAppMessage {
  phone: string; // WhatsApp number in international format (e.g., 6281234567890)
  message: string;
}

// WhatsApp Gateway API service
export async function sendWhatsAppNotification(to: string, message: string): Promise<boolean> {
  try {
    const whatsappApiUrl = process.env.WHATSAPP_GATEWAY_URL;
    const whatsappApiKey = process.env.WHATSAPP_API_KEY;

    if (!whatsappApiUrl || !whatsappApiKey) {
      console.error('WhatsApp API configuration is missing');
      return false;
    }

    // Prepare the message payload
    // This structure depends on the specific WhatsApp gateway you're using
    // Common examples include: WhatsApp Business API, 360dialog, or other providers
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message,
      },
    };

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      return false;
    }

    console.log('WhatsApp message sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

// Specific notification functions for different use cases

// Send payment confirmation notification
export async function sendPaymentConfirmation(userId: string, amount: number): Promise<boolean> {
  try {
    const user = await getUserProfile(userId);
    if (!user) {
      console.error('User not found for payment confirmation');
      return false;
    }

    // In a real app, you'd get the user's phone number from their profile
    // For now, we'll use a placeholder
    const phoneNumber = user.phone_number || '6281234567890'; // Placeholder
    
    const message = `.cluster Kita - Pembayaran IPL Berhasil!\n\nTerima kasih ${user.name}, pembayaran IPL sebesar Rp ${new Intl.NumberFormat('id-ID').format(amount)} telah diterima.\n\nLunas pada: ${new Date().toLocaleDateString('id-ID')}\n\nHormat kami,\nAdmin Cluster`;

    return await sendWhatsAppNotification(phoneNumber, message);
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    return false;
  }
}

// Send emergency notification to admin
export async function sendEmergencyNotification(adminPhone: string, type: string, userName: string): Promise<boolean> {
  try {
    const typeLabels: Record<string, string> = {
      'kebakaran': 'Kebakaran',
      'medis': 'Darurat Medis',
      'keamanan': 'Masalah Keamanan',
    };

    const typeLabel = typeLabels[type] || 'Darurat';

    const message = `.cluster Kita - PERMINTAAN BANTUAN DARURAT!\n\n${typeLabel}\nDilaporkan oleh: ${userName}\nWaktu: ${new Date().toLocaleString('id-ID')}\n\nSegera tangani permintaan darurat ini.`;

    return await sendWhatsAppNotification(adminPhone, message);
  } catch (error) {
    console.error('Error sending emergency notification:', error);
    return false;
  }
}

// Send report status update
export async function sendReportStatusUpdate(userId: string, reportId: string, status: string): Promise<boolean> {
  try {
    const user = await getUserProfile(userId);
    if (!user) {
      console.error('User not found for report status update');
      return false;
    }

    const phoneNumber = user.phone_number || '6281234567890'; // Placeholder

    const statusLabels: Record<string, string> = {
      'baru': 'Laporan baru',
      'ditangani': 'Laporan sedang ditangani',
      'selesai': 'Laporan telah selesai',
    };

    const statusLabel = statusLabels[status] || status;

    const message = `.cluster Kita - Update Status Laporan\n\nLaporan Anda (ID: ${reportId})\nStatus: ${statusLabel}\n\nTerima kasih atas partisipasi Anda dalam menjaga lingkungan cluster.`;

    return await sendWhatsAppNotification(phoneNumber, message);
  } catch (error) {
    console.error('Error sending report status update:', error);
    return false;
  }
}

// Send facility booking confirmation
export async function sendBookingConfirmation(userId: string, facilityName: string, date: string, status: string): Promise<boolean> {
  try {
    const user = await getUserProfile(userId);
    if (!user) {
      console.error('User not found for booking confirmation');
      return false;
    }

    const phoneNumber = user.phone_number || '6281234567890'; // Placeholder

    const statusLabels: Record<string, string> = {
      'pending': 'sedang menunggu persetujuan',
      'approved': 'telah disetujui',
      'rejected': 'ditolak',
    };

    const statusLabel = statusLabels[status] || status;

    const message = `.cluster Kita - Konfirmasi Booking Fasilitas\n\nBooking untuk ${facilityName}\nPada tanggal: ${date}\nStatus: ${statusLabel}\n\nSilakan datang sesuai jadwal jika sudah disetujui.`;

    return await sendWhatsAppNotification(phoneNumber, message);
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
}