import styles from './example-card.module.css';

interface ExampleCardProps {
  title: string;
  children: React.ReactNode;
}

export function ExampleCard({ title, children }: ExampleCardProps) {
  return (
    <div
      className={`${styles.card} margin-bottom-3 border border-base-dark bg-base-lightest`}
    >
      <h3 className={`${styles.cardTitle} font-sans-lg text-ink`}>{title}</h3>
      <div className={`${styles.cardContent} text-base`}>{children}</div>
    </div>
  );
}
