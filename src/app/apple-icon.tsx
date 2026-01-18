import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', // Subtle white/grey
          borderRadius: '24%', // Apple style squircle
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom right, #ffecd2 0%, #fcb69f 100%)', // Warm gradient
            opacity: 0.8
        }} />
        <div style={{ fontSize: 110, position: 'relative', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>🐱</div>
      </div>
    ),
    { ...size }
  )
}
