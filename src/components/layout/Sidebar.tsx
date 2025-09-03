'use client';

import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Proyectos', href: '/projects', icon: '📋' },
  { name: 'Equipos', href: '/teams', icon: '👥' },
  { name: 'Chat', href: '/chat', icon: '💬' },
  { name: 'Archivos', href: '/files', icon: '📁' },
];

export function Sidebar() {
  const { state, dispatch } = useApp();
  const pathname = usePathname();

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-20 transition-all duration-300",
      state.sidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!state.sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TW</span>
              </div>
              <span className="font-semibold text-gray-900">TeamWork</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            {state.sidebarCollapsed ? '→' : '←'}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {!state.sidebarCollapsed && (
                      <span>{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        {state.currentUser && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {state.currentUser.name.charAt(0)}
                </span>
              </div>
              {!state.sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {state.currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {state.currentUser.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}