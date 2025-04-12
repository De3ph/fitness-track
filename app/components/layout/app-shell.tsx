'use client';

import { Navbar } from '@/app/components/navigation/navbar';
import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  showNavigation?: boolean;
  header?: ReactNode;
}

export const AppShell = observer(({
  children,
  showNavigation = true,
  header
}: AppShellProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {header && (
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          {header}
        </header>
      )}
      
      <main className="flex-1 container max-w-md mx-auto px-4 pt-4 pb-20">
        {children}
      </main>
      
      {showNavigation && <Navbar />}
    </div>
  );
});