import type { ReactNode } from 'react';
import { Content } from '@/components/layout/content';
import { Header } from '@/components/layout/header';
import styles from './root-layout.module.css';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <Content>{children}</Content>
    </div>
  );
}
