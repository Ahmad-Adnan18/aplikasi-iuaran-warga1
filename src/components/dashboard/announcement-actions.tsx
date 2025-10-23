'use client';

import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import Link from 'next/link';

interface AnnouncementActionsProps {
  id: string;
  isAdmin?: boolean;
}

export function AnnouncementActions({ id, isAdmin = false }: AnnouncementActionsProps) {
  const basePath = isAdmin ? '/admin/announcements' : '/community/announcements';
  
  return (
    <div className="flex gap-2">
      <Link href={`${basePath}/${id}`}>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Lihat
        </Button>
      </Link>
      {isAdmin && (
        <Link href={`${basePath}/edit/${id}`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      )}
    </div>
  );
}