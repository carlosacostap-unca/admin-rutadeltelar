type FeaturedDataProps = {
  value?: string | null;
  className?: string;
};

export default function FeaturedData({ value, className = '' }: FeaturedDataProps) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) return null;

  return (
    <div className={`rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-4 ${className}`}>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface)]">
        Dato destacado
      </h3>
      <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-[var(--color-on-surface)]">
        {trimmedValue}
      </p>
    </div>
  );
}
