import type { ReactNode } from "react";

export function PageTitle({ children, lead }: { children: ReactNode; lead?: ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="border-b-2 border-accent pb-2 text-2xl font-bold tracking-tight text-accent sm:text-3xl">
        {children}
      </h1>
      {lead && <div className="mt-3 text-sm leading-7 sm:text-base">{lead}</div>}
    </header>
  );
}

export function SectionHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="border-l-4 border-navy bg-band px-3 py-1.5 text-lg font-bold text-accent dark:border-accent"
    >
      {children}
    </h2>
  );
}
