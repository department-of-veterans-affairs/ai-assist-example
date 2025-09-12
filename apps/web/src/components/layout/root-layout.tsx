import type { PropsWithChildren } from 'react';
import { SummarySection } from '@/components/clinical-summary';
import { RecentSection } from '@/components/patient/recent-section';
import { Sidebar } from '@/components/sidebar';
import { Footer } from './footer';
import { Header } from './header';

type RootLayoutProps = PropsWithChildren;

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="display-flex height-full flex-column overflow-hidden">
      <Header />
      <div className="display-flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>

        {/* Sidebar */}
        <Sidebar>
          <SummarySection />
          <RecentSection />
        </Sidebar>
      </div>
      <Footer />
    </div>
  );
}
