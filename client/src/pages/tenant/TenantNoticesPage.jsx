import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API from '../../services/api';

export default function TenantNoticesPage() {
    const { isDark, colors } = useTheme();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [marking, setMarking] = useState(null);
    const [tab, setTab] = useState('received'); // received | read

    const fetchNotices = async () => {
        try {
            const res = await API.get('/notices/my');
            setNotices(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError('Failed to load notices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleMarkRead = async (id) => {
        setMarking(id);
        setError('');
        setSuccess('');
        try {
            await API.put(`/notices/${id}/read`);
            setSuccess('Notice marked as read!');
            fetchNotices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark as read');
        } finally {
            setMarking(null);
        }
    };

    const timeAgo = (d) => {
        if (!d) return '—';
        const diff = (Date.now() - new Date(d).getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const unread = notices.filter(n => !n.is_read).length;

    const displayed = tab === 'received'
        ? notices.filter(n => !n.is_read)
        : notices.filter(n => n.is_read);

    // If "received" tab is empty, show all
    const finalList = tab === 'received' && displayed.length === 0 ? notices : displayed;

    const noticeIcons = ['🔔', '📄', '🔒', '🏠', '💳', '⚙️'];
    const statusLabels = (n) => {
        if (!n.is_read) return { label: 'UNREAD', color: colors.accent, bg: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff' };
        return { label: 'PROCESSED', color: colors.textMuted, bg: isDark ? colors.cardBgElevated : '#f3f4f6' };
    };

    const s = makeStyles(colors, isDark);

    if (loading) {
        return (
            <div style={s.page}><Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={s.spinner}></div>
                        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Loading notices...</p>
                    </div>
                </div>
                <style>{spinCSS}</style>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <Navbar />
            <style>{spinCSS}</style>

            <div style={s.container}>

                {/* ═══════════ HERO ═══════════ */}
                <div style={s.heroSection}>
                    <h1 style={s.heroTitle}>Notices</h1>
                    <p style={s.heroSub}>Stay updated with the latest alerts from property management.</p>
                </div>

                {/* ═══════════ TABS ═══════════ */}
                <div style={s.tabRow}>
                    {['received', 'read'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{
                                ...s.tabBtn,
                                background: tab === t ? (isDark ? colors.cardBgElevated : '#fff') : 'transparent',
                                color: tab === t ? colors.accent : colors.textMuted,
                                fontWeight: tab === t ? 700 : 500,
                                border: tab === t ? `1px solid ${colors.border}` : '1px solid transparent',
                                boxShadow: tab === t ? (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)') : 'none',
                            }}>
                            {t === 'received' ? 'Received' : 'Sent'}
                        </button>
                    ))}
                </div>

                {/* ═══════════ MESSAGES ═══════════ */}
                {success && (
                    <div style={{ background: isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', border: `1px solid ${isDark ? 'rgba(22,163,74,0.25)' : '#bbf7d0'}`, color: '#16a34a', fontSize: 13, padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                        ✓ {success}
                    </div>
                )}
                {error && (
                    <div style={{ background: isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(220,38,38,0.25)' : '#fecaca'}`, color: '#dc2626', fontSize: 13, padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {/* ═══════════ NOTICES LIST ═══════════ */}
                {notices.length === 0 ? (
                    <div style={{ ...s.card, padding: '64px 24px', textAlign: 'center', marginBottom: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🔔</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 8, fontFamily: "'Merriweather', serif" }}>
                            No notices yet
                        </h3>
                        <p style={{ fontSize: 13, color: colors.textMuted }}>Your landlord will send notices here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {finalList.map((n, i) => {
                            const status = statusLabels(n);
                            const icon = noticeIcons[i % noticeIcons.length];
                            return (
                                <div key={n.id} style={{
                                    ...s.noticeCard,
                                    borderLeft: !n.is_read ? `3px solid ${colors.accent}` : `3px solid transparent`,
                                }}>
                                    <div style={s.noticeTop}>
                                        {/* Icon */}
                                        <div style={s.noticeIcon}>{icon}</div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Title + Badge row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                                                <h3 style={s.noticeTitle}>{n.title}</h3>
                                                <span style={{
                                                    fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
                                                    background: status.bg, color: status.color,
                                                    letterSpacing: '0.06em', flexShrink: 0, textTransform: 'uppercase',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                                }}>
                                                    {status.label}
                                                </span>
                                            </div>

                                            {/* Message */}
                                            <p style={s.noticeMessage}>{n.message}</p>

                                            {/* Footer row */}
                                            <div style={s.noticeFooter}>
                                                <div style={{ display: 'flex', gap: 24 }}>
                                                    <div>
                                                        <p style={s.metaLabel}>SENDER</p>
                                                        <p style={s.metaValue}>{n.sender_name || n.sender_role || 'Management'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={s.metaLabel}>TIME</p>
                                                        <p style={s.metaValue}>{timeAgo(n.created_at)}</p>
                                                    </div>
                                                </div>

                                                {/* Action button */}
                                                {!n.is_read ? (
                                                    <button onClick={() => handleMarkRead(n.id)} disabled={marking === n.id}
                                                        style={s.markReadBtn}
                                                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                                        {marking === n.id ? 'MARKING...' : 'MARK READ'}
                                                    </button>
                                                ) : (
                                                    <button style={s.deleteBtn}>DELETE</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════════ BOTTOM INFO ═══════════ */}
                {notices.length > 0 && (
                    <div style={s.bottomInfo}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                            VIEWING ALL CURRENT NOTICES
                        </p>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent }}></div>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDark ? colors.cardBgElevated : '#d1d5db' }}></div>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDark ? colors.cardBgElevated : '#d1d5db' }}></div>
                        </div>
                    </div>
                )}

                <Footer />

                {/* ═══════════ SUPPORT FAB ═══════════ */}
                <div style={s.supportFab}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <span style={{ fontSize: 16 }}>❓</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>SUPPORT</span>
                </div>
            </div>
        </div>
    );
}


/* ═══════════ STYLES ═══════════ */
const spinCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;

function makeStyles(c, isDark) {
    return {
        page: { minHeight: '100vh', background: c.pageBg, fontFamily: "'Inter', 'Open Sans', sans-serif", transition: 'background 0.3s', position: 'relative' },
        container: { maxWidth: 900, margin: '0 auto', padding: '0 48px 60px' },

        heroSection: { padding: '48px 0 24px' },
        heroTitle: { fontSize: 42, fontWeight: 800, color: c.textHeading, letterSpacing: '-0.5px', margin: '0 0 10px', fontFamily: "'Merriweather', Georgia, serif" },
        heroSub: { fontSize: 15, color: c.textSecondary, margin: 0 },

        tabRow: { display: 'flex', gap: 0, marginBottom: 28, background: isDark ? c.surfaceBg : '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content' },
        tabBtn: { fontSize: 13, padding: '10px 24px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.01em' },

        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },

        noticeCard: {
            background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16,
            padding: '28px 28px 20px', transition: 'all 0.3s',
        },
        noticeTop: { display: 'flex', gap: 16, alignItems: 'flex-start' },
        noticeIcon: {
            width: 44, height: 44, borderRadius: '50%',
            background: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0, marginTop: 2,
        },
        noticeTitle: { fontSize: 18, fontWeight: 700, color: c.textHeading, margin: 0, fontFamily: "'Merriweather', serif" },
        noticeMessage: { fontSize: 14, color: c.textSecondary, lineHeight: 1.7, margin: '0 0 18px' },

        noticeFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 },
        metaLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' },
        metaValue: { fontSize: 13, fontWeight: 600, color: c.textPrimary, margin: 0 },

        markReadBtn: {
            background: c.accent, color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 22px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            cursor: 'pointer', transition: 'background 0.2s',
        },
        deleteBtn: {
            background: 'transparent', color: c.textMuted, border: `1px solid ${c.border}`,
            borderRadius: 8, padding: '9px 20px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.15s',
        },

        bottomInfo: { textAlign: 'center', padding: '40px 0 20px' },

        supportFab: {
            position: 'fixed', bottom: 28, right: 28, background: isDark ? '#1e293b' : '#111827',
            color: '#fff', borderRadius: 28, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 40,
        },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}