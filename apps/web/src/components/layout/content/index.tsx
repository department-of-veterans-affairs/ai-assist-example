import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./content.module.css";

interface ContentProps {
  children: ReactNode;
}

export function Content({ children }: ContentProps) {
  return (
    <main className={clsx(styles.content, "bg-base-lightest")}>
      <div className="grid-container">{children}</div>
    </main>
  );
}
