interface SectionLabelProps {
  children: string;
  className?: string;
}

export default function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.18em] text-white/38 ${className}`}>
      {children}
    </p>
  );
}
