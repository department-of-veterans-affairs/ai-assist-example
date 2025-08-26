import type { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Footer } from './footer';
import { Header } from './header';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="display-flex height-full flex-column overflow-hidden">
      <Header />
      <div className="display-flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>
        <Sidebar />
      </div>
      <Footer />
    </div>
  );
}
