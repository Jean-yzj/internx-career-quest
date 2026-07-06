interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function IconStar({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M9 1.5l2.163 4.38 4.837.703-3.5 3.41.826 4.817L9 12.65l-4.326 2.27.826-4.816L2 6.584l4.837-.703L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconStarFilled({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M9 1.5l2.163 4.38 4.837.703-3.5 3.41.826 4.817L9 12.65l-4.326 2.27.826-4.816L2 6.584l4.837-.703L9 1.5z"/>
    </svg>
  );
}

export function IconCalendar({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <rect x="2" y="3.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 2v3M12 2v3M2 7.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconList({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M3 5h12M3 9h12M3 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconPlus({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconChevronLeft({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M11 13L7 9l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronRight({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M7 13l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronDown({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M5 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconEdit({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M13.5 2.5a1.414 1.414 0 012 2L6 14H3v-3L13.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconTrash({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M3 5h12M8 5V3h2v2M7 8v5M11 8v5M4 5l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconLink({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M7.5 10.5a3.535 3.535 0 005 0l2-2a3.535 3.535 0 00-5-5L8.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10.5 7.5a3.535 3.535 0 00-5 0l-2 2a3.535 3.535 0 005 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCopy({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <rect x="6" y="6" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 12V3h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCheck({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M3 9l4.5 4.5L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconDownload({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M9 3v9M6 9l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconUpload({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M9 12V3M6 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconClose({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSpinner({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 10" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.8s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function IconWarning({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M9 2L1.5 15.5h15L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 8v3M9 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconInfo({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 8v5M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconOffline({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M2 2l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 5.5C3.6 6.7 2.5 8.7 2.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 8a5 5 0 015.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  );
}
