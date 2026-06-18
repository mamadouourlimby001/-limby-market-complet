import Svg, { Path } from 'react-native-svg';

// Portage exact de frontend/src/assets/logo.svg (identique au SVG inline de Navbar.jsx)
export default function Logo({ size = 20, color = '#1B2A6B' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M50 5C55 5 65 15 65 25C65 35 55 40 50 50C45 60 35 65 35 75C35 85 45 95 50 95"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M50 5C45 5 35 15 35 25C35 35 45 40 50 50C55 60 65 65 65 75C65 85 55 95 50 95"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
      />
    </Svg>
  );
}
