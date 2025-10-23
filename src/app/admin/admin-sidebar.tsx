'use client';

import { User } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  DollarSign, 
  Shield, 
  MessageSquare, 
  Calendar,
  Users,
  Bell,
  Settings,
  LogOut,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent 
} from '@/components/ui/card';
import { UserButton } from '@clerk/nextjs';

interface AdminSidebarProps {
  user: User;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  // Navigation items for admin panel
  const navItems = [
    { href: '/admin', label: 'Beranda Admin', icon: Home },
    { href: '/admin/users', label: 'Manajemen Warga', icon: Users },
    { href: '/admin/finance', label: 'Keuangan', icon: DollarSign },
    { href: '/admin/reports', label: 'Laporan Masalah', icon: Shield },
    { href: '/admin/announcements', label: 'Pengumuman', icon: Bell },
    { href: '/admin/polls', label: 'Jajak Pendapat', icon: BarChart3 },
    { href: '/admin/facilities', label: 'Fasilitas', icon: Calendar },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <Card className="w-64 h-full rounded-none border-r hidden md:block">
      <CardContent className="p-4 h-full">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center space-x-2 mb-8 p-2">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-lg w-10 h-10 flex items-center justify-center">
              <span className="text-white font-bold text-lg">CK</span>
            </div>
            <h1 className="text-xl font-bold">Cluster Kita Admin</h1>
          </div>

          {/* User Profile */}
          <div className="mb-6 p-2">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-blue-600">Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start ${isActive ? 'bg-muted' : ''}`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          


          {/* User Actions */}
          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center justify-between">
              <UserButton afterSignOutUrl="/" />
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}