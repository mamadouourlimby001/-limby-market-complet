import Svg, { Path } from 'react-native-svg';

export default function Logo({ size = 20, color = '#1B2A6B' }) {
  const w = size * 2.4;
  const h = size;
  return (
    <Svg width={w} height={h} viewBox="0 0 240 100" fill="none">
      {/* Vague du bas (plus grande) */}
      <Path
        d="M 8,82 C 45,38 88,35 128,70 C 150,86 170,78 200,55"
        stroke={color}
        strokeWidth={14}
        strokeLinecap="round"
        fill="none"
      />
      {/* Vague du haut (plus fine) */}
      <Path
        d="M 20,58 C 57,14 100,11 140,46 C 162,62 182,54 212,31"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
