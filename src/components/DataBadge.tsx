export function DataBadge({ usingMock }: { usingMock: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        usingMock
          ? "bg-[color-mix(in_srgb,var(--warn)_20%,transparent)] text-[var(--warn)]"
          : "bg-[color-mix(in_srgb,var(--accent-2)_20%,transparent)] text-[var(--accent-2)]"
      }`}
    >
      {usingMock ? "Dati demo (manca API token)" : "Live API free"}
    </span>
  );
}
