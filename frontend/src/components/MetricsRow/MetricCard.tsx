interface MetricCardProps {
  /** Display label, e.g. "Expected Return" */
  label: string;
  /** Formatted value string, e.g. "+14.7%" */
  value: string;
  /** Tailwind text color class for the value */
  valueColor?: string;
  /** Optional Tailwind background tint class for positive/negative context */
  bgTint?: string;
}

/**
 * Single metric display card used in MetricsRow.
 * All values use font-mono as required by the design system.
 */
export default function MetricCard({
  label,
  value,
  valueColor = 'text-primary',
  bgTint,
}: MetricCardProps) {
  return (
    <div
      className={`
        border border-border rounded-lg p-4 flex flex-col gap-1
        transition-all duration-200 hover:border-secondary
        ${bgTint ?? 'bg-surface'}
      `}
    >
      <span className="text-small text-secondary">{label}</span>
      <span className={`text-value font-mono font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}
