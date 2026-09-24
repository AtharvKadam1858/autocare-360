'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoWalkthroughModal } from './DemoWalkthroughModal';
import { AuthProvider } from '@/lib/authContext';

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onOpenDemoModal={() => setIsDemoModalOpen(true)} />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
      <DemoWalkthroughModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </AuthProvider>
  );
};
