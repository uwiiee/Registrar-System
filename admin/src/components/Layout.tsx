import { type ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F6FB]">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}