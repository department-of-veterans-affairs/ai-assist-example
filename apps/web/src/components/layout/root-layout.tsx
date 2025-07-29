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
      <div className="display-flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="display-flex flex-1 flex-column">
          <Header />
          <main className="flex-1 overflow-y-auto bg-white">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
