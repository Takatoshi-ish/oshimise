import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Coral rounded square — matches the dot accent next to "オシミセ" in the header.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FF6F61',
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
      />
    ),
    { ...size },
  );
}
