import styles from '@/app.module.css';
import { RootLayout } from '@/components/layout/root-layout';

function App() {
  return (
    <RootLayout>
      <div className={styles.welcomeContainer}>
        <h1 className={styles.welcomeTitle}>Welcome to AI Assist</h1>
        <p className={styles.welcomeText}>
          A VA Clinical Tool designed to assist healthcare providers with
          AI-powered insights.
        </p>
      </div>
    </RootLayout>
  );
}

export default App;
