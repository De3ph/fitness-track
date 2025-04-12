'use client';

import { cn } from '@/app/lib/utils';
import { Dumbbell, Home, LineChart, ListChecks, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home
  },
  {
    name: 'Workouts',
    href: '/workouts',
    icon: Dumbbell
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: ListChecks
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: LineChart
  }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-10 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full",
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <Link 
          href="/workouts/new" 
          className="bg-primary hover:bg-primary/90 text-white p-3 rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </nav>
  );
}