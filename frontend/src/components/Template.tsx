import React from 'react';
import Nav from './Nav';

interface TemplateProps {
  children: React.ReactNode;
}

export default function Template({ children }: TemplateProps) {
  return (
    <div className="h-dvh w-full flex flex-col bg-slate-100 dark:bg-[#0b1b2b] text-slate-800 dark:text-slate-100 font-sans selection:bg-[#569ad5d4] selection:text-white transition-colors overflow-hidden">
      <Nav />
      <main className="flex-1 w-full overflow-hidden flex flex-col p-4 relative">
        {children}
      </main>
    </div>
  );
}
