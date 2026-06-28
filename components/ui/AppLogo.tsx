type Props = {
  size?: number;
};

// Coral-gradient rounded tile with a white location-pin SVG — same artwork
// as app/icon.tsx (favicon) and the layout.tsx header logo.
export function AppLogo({ size = 28 }: Props) {
  const radius = Math.round((size * 14) / 64); // match favicon ratio (14/64)
  const inner = Math.round(size * 0.6);
  return (
    <span
      className="inline-flex items-center justify-center bg-gradient-to-br from-coral-500 to-coral-600 shadow-soft"
      style={{ width: size, height: size, borderRadius: radius }}
      aria-hidden
    >
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 24 24"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </span>
  );
}
