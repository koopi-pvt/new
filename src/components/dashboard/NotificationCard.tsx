'use client';

import Link from 'next/link';
import TimeAgo from 'react-timeago';
import { MessageSquare } from 'lucide-react';
import { Notification } from '@/types'; // Assuming you have a types file

type NotificationCardProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
};

const NotificationCard = ({ notification, onMarkAsRead }: NotificationCardProps) => {
  const { id, message, isRead, createdAt, link, type } = notification;

  return (
    <Link
      href={link || '#'}
      onClick={() => onMarkAsRead(id)}
      className={`flex items-start gap-4 p-6 transition-colors border-b border-gray-200/50 ${
        !isRead ? 'bg-blue-500/10' : 'hover:bg-gray-500/10'
      }`}
    >
      <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center mt-1 ${
        !isRead ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-gray-200 text-gray-600'
      }`}
      >
        <MessageSquare className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 leading-relaxed font-medium">{message}</p>
        <p className="text-xs text-gray-500 mt-1 font-semibold">
          <TimeAgo date={createdAt?.toDate()} />
        </p>
      </div>
      {!isRead && (
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center shadow-md shadow-blue-500/50 animate-pulse"></div>
      )}
    </Link>
  );
};

export default NotificationCard;