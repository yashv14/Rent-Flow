import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

export default function Footer() {
    const { isDark, colors } = useTheme();
    const s = makeStyles(colors, isDark);

    return (
        <footer style={s.footerSection}>
            <div style={s.footerGrid}>
                {/* Brand */}
                <div>
                    <div style={{ marginBottom: 14 }}>
                        <Logo size={18} color={colors.textMuted} textColor={colors.textMuted} />
                    </div>
                    <p style={s.brandDesc}>
                        Elevating property management into a seamless digital editorial
                        experience for the modern landlord.
                    </p>
                </div>

                {/* Product */}
                <div>
                    <h4 style={s.colTitle}>PRODUCT</h4>
                    {['Features', 'Pricing', 'Integration', 'Enterprise'].map(l => (
                        <p key={l} style={s.link}>{l}</p>
                    ))}
                </div>

                {/* Resources */}
                <div>
                    <h4 style={s.colTitle}>RESOURCES</h4>
                    {['Tenant Guides', 'Landlord Laws', 'Market Trends', 'Support'].map(l => (
                        <p key={l} style={s.link}>{l}</p>
                    ))}
                </div>

                {/* Subscribe */}
                <div>
                    <h4 style={s.colTitle}>STAY UPDATED</h4>
                    <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10, lineHeight: 1.6 }}>
                        Join our quarterly insights on property management.
                    </p>
                    <div style={{ display: 'flex', gap: 0 }}>
                        <input
                            type="email"
                            placeholder="Your Email"
                            style={s.emailInput}
                        />
                        <button
                            style={s.joinBtn}
                            onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                            onMouseLeave={e => e.currentTarget.style.background = colors.accent}
                        >
                            Join
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={s.bottomBar}>
                <span>© {new Date().getFullYear()} RENTFLOW INC. ALL RIGHTS RESERVED.</span>
                <div style={{ display: 'flex', gap: 24 }}>
                    {['PRIVACY', 'TERMS', 'ACCESSIBILITY'].map(l => (
                        <span key={l} style={s.bottomLink}>{l}</span>
                    ))}
                </div>
            </div>
        </footer>
    );
}

function makeStyles(c, isDark) {
    return {
        footerSection: {
            borderTop: `1px solid ${c.border}`,
            paddingTop: 48,
            marginTop: 40,
            fontFamily: "'Inter', 'Open Sans', sans-serif",
        },
        footerGrid: {
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
            gap: 32,
            marginBottom: 32,
        },
        brandDesc: {
            fontSize: 12,
            color: c.textMuted,
            lineHeight: 1.7,
            maxWidth: 220,
            margin: 0,
        },
        colTitle: {
            fontSize: 10,
            fontWeight: 700,
            color: c.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: '0 0 14px',
        },
        link: {
            fontSize: 13,
            color: c.textSecondary,
            margin: '0 0 8px',
            cursor: 'pointer',
            transition: 'color 0.15s',
        },
        emailInput: {
            flex: 1,
            border: `1px solid ${c.border}`,
            borderRadius: '8px 0 0 8px',
            padding: '10px 14px',
            fontSize: 12,
            color: c.textPrimary,
            background: c.inputBg,
            outline: 'none',
            fontFamily: 'inherit',
        },
        joinBtn: {
            background: c.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '0 8px 8px 0',
            padding: '0 18px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            transition: 'background 0.2s',
        },
        bottomBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 20,
            paddingBottom: 28,
            borderTop: `1px solid ${c.border}`,
            fontSize: 10,
            color: c.textMuted,
            letterSpacing: '0.04em',
        },
        bottomLink: {
            fontSize: 10,
            color: c.textMuted,
            fontWeight: 600,
            letterSpacing: '0.06em',
            cursor: 'pointer',
        },
    };
}
