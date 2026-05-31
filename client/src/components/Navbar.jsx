import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme, colors } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = {
        admin: [
            { label: 'Dashboard', path: '/admin' },
            { label: 'Users', path: '/admin/users' },
            { label: 'Properties', path: '/admin/properties' },
            { label: 'Notices', path: '/admin/notices' },
        ],
        landlord: [
            { label: 'Dashboard', path: '/landlord' },
            { label: 'Properties', path: '/landlord/properties' },
            { label: 'Bookings', path: '/landlord/bookings' },
            { label: 'Rent', path: '/landlord/rent' },
            { label: 'Notices', path: '/landlord/notices' },
        ],
        tenant: [
            { label: 'Dashboard', path: '/tenant' },
            { label: 'Properties', path: '/tenant/properties' },
            { label: 'My Bookings', path: '/tenant/bookings' },
            { label: 'Rent', path: '/tenant/rent' },
            { label: 'Notices', path: '/tenant/notices' },
        ],
    };

    const links = navLinks[user?.role] || [];
    const currentPath = window.location.pathname;

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: colors.navBg,
            borderBottom: `1px solid ${colors.navBorder}`,
            padding: '0 48px',
            transition: 'background 0.3s, border-color 0.3s',
        }}>
            {/* Left: Logo */}
            <div style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
                <Logo size={26} color={colors.accent} textColor={colors.textPrimary} />
            </div>

            {/* Center: Nav Links */}
            <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 28,
                pointerEvents: 'none',
            }}>
                {links.map((link) => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '4px 0',
                            color: currentPath === link.path ? colors.accent : colors.textMuted,
                            borderBottom: currentPath === link.path ? `2px solid ${colors.accent}` : '2px solid transparent',
                            transition: 'color 0.15s, border-color 0.15s',
                            pointerEvents: 'auto',
                        }}
                        onMouseEnter={e => { if (currentPath !== link.path) e.currentTarget.style.color = colors.textPrimary; }}
                        onMouseLeave={e => { if (currentPath !== link.path) e.currentTarget.style.color = colors.textMuted; }}
                    >
                        {link.label}
                    </button>
                ))}
            </div>

            {/* Right: Theme toggle + Logout + Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        borderRadius: 10,
                        width: 38,
                        height: 38,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: 18,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {isDark ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = colors.textPrimary}
                    onMouseLeave={e => e.currentTarget.style.color = colors.textSecondary}
                >
                    Logout
                </button>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: colors.accent,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
            </div>
        </nav>
    );
}