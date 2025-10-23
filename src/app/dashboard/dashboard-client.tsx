'use client';

import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  AlertTriangle, 
  MessageSquare, 
  Calendar,
  Bell,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getWargaDashboardStats } from '@/lib/dashboard';

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [dashboardStats, setDashboardStats] = useState({
    pendingBills: 0,
    overdueBills: 0,
    totalReports: 0,
    newReports: 0,
    totalAnnouncements: 0,
    recentAnnouncements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getWargaDashboardStats(user.id);
        setDashboardStats(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-muted-foreground">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Warga</h1>
        <p className="text-muted-foreground">
          Selamat datang, {user.name}! Ini adalah ringkasan aktivitas Anda.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tagihan IPL</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.pendingBills} belum lunas
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.overdueBills} terlambat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laporan Masalah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.newReports} baru hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengumuman</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">Terbaru</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/finance/bills">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keuangan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Kelola tagihan IPL</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/security/sos">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keamanan</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Tombol darurat & log</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community/announcements">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komunitas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Pengumuman & forum</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/facilities/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fasilitas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Laporan & booking</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Aktivitas Terbaru</h2>
        <Card>
          {dashboardStats.recentAnnouncements.length > 0 ? (
            <CardContent className="p-4 space-y-4">
              {dashboardStats.recentAnnouncements.slice(0, 3).map((announcement: any, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {announcement.content.length > 100 ? `${announcement.content.substring(0, 100)}...` : announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(announcement.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent className="p-4">
              <p className="text-muted-foreground text-center py-8">
                Tidak ada aktivitas terbaru saat ini. Mulai dengan mengeksplorasi fitur-fitur di atas.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}