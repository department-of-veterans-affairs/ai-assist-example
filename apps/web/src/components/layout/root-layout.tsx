import type { PropsWithChildren } from 'react';
import { SummarySection } from '@/components/clinical-summary';
import { Sidebar } from '@/components/sidebar';
import { Footer } from './footer';
import { Header } from './header';

type RootLayoutProps = PropsWithChildren;

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>

        {/* Sidebar */}
        <Sidebar>
          <SummarySection />
        </Sidebar>
      </div>
      <Footer />
    </div>
  );
}
