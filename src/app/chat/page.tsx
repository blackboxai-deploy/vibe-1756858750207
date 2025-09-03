'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';

export default function ChatPage() {
  return (
    <MainLayout>
      <ChatView />
    </MainLayout>
  );
}