/**
 * RentFlow Logo — A unique building + flow mark
 * Usage: <Logo color="#2563eb" size={28} /> or <Logo white size={22} />
 */
export default function Logo({ size = 28, color = '#2563eb', white = false, showText = true, textColor }) {
    const c = white ? '#ffffff' : color;
    const tc = textColor || (white ? '#ffffff' : '#111827');

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Building body */}
                <rect x="6" y="10" width="18" height="26" rx="2" fill={c} opacity="0.9" />
                {/* Building windows */}
                <rect x="10" y="14" width="4" height="4" rx="1" fill={white ? 'rgba(255,255,255,0.35)' : '#ffffff'} />
                <rect x="16" y="14" width="4" height="4" rx="1" fill={white ? 'rgba(255,255,255,0.35)' : '#ffffff'} />
                <rect x="10" y="21" width="4" height="4" rx="1" fill={white ? 'rgba(255,255,255,0.35)' : '#ffffff'} />
                <rect x="16" y="21" width="4" height="4" rx="1" fill={white ? 'rgba(255,255,255,0.35)' : '#ffffff'} />
                {/* Building door */}
                <rect x="12" y="29" width="6" height="7" rx="1" fill={white ? 'rgba(255,255,255,0.25)' : '#e0e7ff'} />
                {/* Flow swoosh — the dynamic arc */}
                <path
                    d="M22 28 C28 28, 30 20, 36 14"
                    stroke={c}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.75"
                />
                {/* Flow arrow tip */}
                <path
                    d="M33 10 L36 14 L31 14.5"
                    stroke={c}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.75"
                />
                {/* Roof accent */}
                <path d="M4 12 L15 3 L26 12" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            {showText && (
                <span style={{
                    fontFamily: "'Merriweather', Georgia, serif",
                    fontSize: size * 0.62,
                    fontWeight: 700,
                    color: tc,
                    letterSpacing: '-0.3px',
                    lineHeight: 1,
                }}>
                    RentFlow
                </span>
            )}
        </div>
    );
}
