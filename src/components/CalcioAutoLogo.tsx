/** Monogramma — logo Side Pitch Hub */
export function CalcioAutoLogo({
  className = "h-8 w-8",
  title = "Side Pitch Hub",
}: {
  className?: string;
  title?: string;
}) {
  return (
    // PNG generato monogramma CA (sfondo scuro + lime)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-ca.png"
      alt={title}
      width={72}
      height={72}
      className={`rounded-[22%] object-cover ${className}`}
    />
  );
}
