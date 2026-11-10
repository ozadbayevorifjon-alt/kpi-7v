type Props = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
};

function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  // Ko'k binafsha oralig'ida ushlab turamiz (190–265), sal farqlantirish uchun
  return 190 + (h % 76);
}

export default function Avatar({ name, photoUrl, size = 40, className = "" }: Props) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const hue = hueFromName(name);

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white/10 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`grid shrink-0 select-none place-items-center rounded-full font-black text-white ring-2 ring-white/10 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 85% 55%) 0%, hsl(${hue + 30} 80% 40%) 100%)`,
        boxShadow: `0 8px 20px -8px hsl(${hue} 85% 45% / 0.7)`,
      }}
    >
      {initials || "?"}
    </div>
  );
}
