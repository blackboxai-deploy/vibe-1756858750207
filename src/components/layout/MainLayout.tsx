'use client';

import { useApp } from '@/lib/context';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { state } = useApp();

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        state.sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}