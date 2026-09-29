export function SparkBars({
  values,
  color = "var(--accent)",
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-16 items-end gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-full opacity-90"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: color,
          }}
        />
      ))}
    </div>
  );
}
