export const GradientBackground = () => (
  <>
    <style>
      {`
        @keyframes float1 {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-10px, 10px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes float2 {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, -10px); }
          100% { transform: translate(0, 0); }
        }
      `}
    </style>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute top-0 left-0 w-full h-full"
    >
      <defs>
        {/* Top left - #5A9665 */}
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#5A9665', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#5A9665', stopOpacity: 0.6 }} />
        </radialGradient>
        {/* Bottom left - #5f87a3 */}
        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#5f87a3', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#5f87a3', stopOpacity: 0.6 }} />
        </radialGradient>
        {/* Top right - #6a76a6 */}
        <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#6a76a6', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#6a76a6', stopOpacity: 0.6 }} />
        </radialGradient>
        {/* Bottom right - #b0866a */}
        <radialGradient id="grad4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#b0866a', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#b0866a', stopOpacity: 0.6 }} />
        </radialGradient>
        <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="35" />
        </filter>
        <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="25" />
        </filter>
        <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="45" />
        </filter>
      </defs>
      <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
        {/* Bottom left - #5f87a3 */}
        <ellipse
          cx="200"
          cy="500"
          rx="250"
          ry="180"
          fill="url(#grad2)"
          filter="url(#blur1)"
          transform="rotate(-30 200 500)"
        />
        {/* Top right - #6a76a6 */}
        <rect
          x="500"
          y="100"
          width="300"
          height="250"
          rx="80"
          fill="url(#grad3)"
          filter="url(#blur2)"
          transform="rotate(15 650 225)"
        />
      </g>
      <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
        {/* Bottom right - #b0866a */}
        <circle
          cx="650"
          cy="450"
          r="150"
          fill="url(#grad4)"
          filter="url(#blur3)"
        />
        {/* Top left - #5A9665 */}
        <ellipse
          cx="50"
          cy="150"
          rx="180"
          ry="120"
          fill="url(#grad1)"
          filter="url(#blur2)"
        />
      </g>
    </svg>
  </>
);
