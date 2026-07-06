// Avatar.tsx — 藍藍角色 6 色變體 SVG
// avatarId: 1=藍 2=黃 3=綠 4=珊瑚 5=紫 6=湖水

export type AvatarId = 1 | 2 | 3 | 4 | 5 | 6;

interface AvatarProps {
  avatarId: AvatarId;
  size?: number;
  className?: string;
}

const AVATAR_COLORS: Record<AvatarId, { body: string; stroke: string; belly: string }> = {
  1: { body: '#4DA3FF', stroke: '#1861A8', belly: '#EAF4FF' },   // 藍
  2: { body: '#FFC93C', stroke: '#C07800', belly: '#FFF8E6' },   // 黃
  3: { body: '#34C784', stroke: '#1A7A4F', belly: '#EAFCF2' },   // 綠
  4: { body: '#FF7A88', stroke: '#C04050', belly: '#FFE9EC' },   // 珊瑚
  5: { body: '#9D8CFF', stroke: '#5C46C8', belly: '#EFEBFF' },   // 紫
  6: { body: '#2BC8C8', stroke: '#0F8080', belly: '#DFF7F7' },   // 湖水
};

export const AVATAR_NAMES: Record<AvatarId, string> = {
  1: '藍藍',
  2: '黃黃',
  3: '綠綠',
  4: '珊珊',
  5: '紫紫',
  6: '湖湖',
};

export default function Avatar({ avatarId, size = 80, className = '' }: AvatarProps) {
  const c = AVATAR_COLORS[avatarId] ?? AVATAR_COLORS[1];

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="60" cy="100" rx="30" ry="6" fill={c.stroke} opacity=".12" />
      <path
        d="M60 18c22 0 34 16 34 36 0 22-14 38-34 38S26 76 26 54c0-20 12-36 34-36z"
        fill={c.body}
        stroke={c.stroke}
        strokeWidth="3"
      />
      <path
        d="M60 46c12 0 20 9 20 20 0 12-8 20-20 20s-20-8-20-20c0-11 8-20 20-20z"
        fill={c.belly}
      />
      {/* left fin */}
      <path d="M28 62c-8 2-12 8-10 12 6 2 12-2 14-8z" fill={c.body} stroke={c.stroke} strokeWidth="3" strokeLinejoin="round" />
      {/* right fin */}
      <path d="M92 62c8 2 12 8 10 12-6 2-12-2-14-8z" fill={c.body} stroke={c.stroke} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="48" cy="50" r="4" fill="#1A2733" />
      <circle cx="72" cy="50" r="4" fill="#1A2733" />
      <circle cx="50" cy="48" r="1.5" fill="#fff" />
      <circle cx="74" cy="48" r="1.5" fill="#fff" />
      <path d="M54 59c3 3 9 3 12 0" stroke="#1A2733" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="57" r="4" fill="#FF9FB0" opacity=".7" />
      <circle cx="80" cy="57" r="4" fill="#FF9FB0" opacity=".7" />
      {/* antenna */}
      <path d="M56 15c2-6 8-6 8 0" stroke={c.stroke} strokeWidth="3" strokeLinecap="round" />
      {/* star badge */}
      <path
        d="M60 72l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"
        fill="#FFC93C"
        stroke="#E8A800"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
