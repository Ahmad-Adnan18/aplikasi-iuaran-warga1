import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  AlertTriangle, 
  MessageSquare, 
  Calendar,
  Shield,
  Users,
  Bell
} from 'lucide-react';
import { IPLStatus, ReportStatus, TransactionStatus } from '@/types';

interface StatusBadgeProps {
  status: IPLStatus | ReportStatus | TransactionStatus | string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'selesai':
      case 'success':
        return { variant: 'default' as const, text: status, className: 'bg-green-500' };
      case 'pending':
      case 'baru':
        return { variant: 'secondary' as const, text: status, className: 'bg-yellow-500' };
      case 'overdue':
      case 'rejected':
      case 'failed':
        return { variant: 'destructive' as const, text: status, className: 'bg-red-500' };
      case 'ditangani':
      case 'processed':
        return { variant: 'default' as const, text: status, className: 'bg-blue-500' };
      default:
        return { variant: 'outline' as const, text: status, className: 'bg-gray-500' };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.text}
    </Badge>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard = ({ title, value, icon: Icon, description, trend }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Icon mapping for different purposes
export const getIconForCategory = (category: string) => {
  switch (category.toLowerCase()) {
    case 'kebersihan':
      return AlertTriangle;
    case 'keamanan':
      return Shield;
    case 'penerangan':
      return AlertTriangle;
    case 'fasilitas':
      return Calendar;
    case 'lainnya':
      return MessageSquare;
    case 'finance':
    case 'keuangan':
      return DollarSign;
    case 'security':
    case 'keamanan':
      return Shield;
    case 'community':
    case 'komunitas':
      return MessageSquare;
    case 'facilities':
    case 'fasilitas':
      return Calendar;
    case 'admin':
      return Users;
    case 'announcements':
    case 'pengumuman':
      return Bell;
    default:
      return MessageSquare;
  }
};