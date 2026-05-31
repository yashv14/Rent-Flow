import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import API from '../../services/api';

export default function NoticesPage() {
    const { isDark, colors } = useTheme();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('sent');
    const [receivedNotices, setReceivedNotices] = useState([]);

    const emptyForm = { receiver_id: '', title: '', message: '' };
    const [form, setForm] = useState(emptyForm);

    const fetchNotices = async () => {
        try {
            const [sentRes, receivedRes] = await Promise.all([
                API.get('/notices/sent'),
                API.get('/notices/my'),
            ]);
            setNotices(sentRes.data);
            setReceivedNotices(receivedRes.data);
        } catch (err) {
            setError('Failed to load notices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError(''); setSuccess('');
        try {
            await API.post('/notices', form);
            setSuccess('Notice sent successfully!');
            setShowForm(false); setForm(emptyForm); fetchNotices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send notice');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/notices/${id}`);
            setSuccess('Notice deleted successfully!');
            fetchNotices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete notice');
        }
    };

    const timeAgo = (d) => {
        if (!d) return '—';
        const diff = (Date.now() - new Date(d).getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '—';

    const displayed = filter === 'sent' ? notices : receivedNotices;
    const readCount = notices.filter(n => n.is_read).length;
    const readPct = notices.length > 0 ? Math.round((readCount / notices.length) * 100) : 0;
    const unreadCount = notices.filter(n => !n.is_read).length;

    const noticeIcons = ['🔧', '💳', 'ℹ️', '🔔', '📄', '🔒'];
    const statusMap = (n) => {
        if (filter === 'sent') {
            return n.is_read
                ? { label: 'DELIVERED', color: '#16a34a', bg: isDark ? 'rgba(22,163,74,0.12)' : '#dcfce7' }
                : { label: 'SENT', color: '#ca8a04', bg: isDark ? 'rgba(202,138,4,0.12)' : '#fef9c3' };
        }
        return !n.is_read
            ? { label: 'UNREAD', color: colors.accent, bg: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff' }
            : { label: 'READ', color: colors.textMuted, bg: isDark ? colors.cardBgElevated : '#f3f4f6' };
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
                    <div style={{ flex: 1, maxWidth: 480 }}>
                        <h1 style={s.heroTitle}>Communication</h1>
                        <h1 style={s.heroTitleAccent}>Center</h1>
                        <p style={s.heroSub}>
                            Manage tenant notifications, legal notices, and
                            maintenance alerts through our centralized editorial dispatch.
                        </p>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
                        style={s.heroCta}
                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                        <span style={{ fontSize: 16, marginRight: 6 }}>⊕</span> Send New Notice
                    </button>
                </div>

                {/* ═══════════ STAT CARDS ═══════════ */}
                <div style={s.statsGrid}>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>TOTAL SENT</p>
                        <p style={s.statValue}>{notices.length}</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>READ RATE</p>
                        <p style={s.statValue}>{readPct}%</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>RECEIVED</p>
                        <p style={s.statValue}>{receivedNotices.length}</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>ACTIVE ALERTS</p>
                        <p style={s.statValue}>
                            {unreadCount}
                            {unreadCount > 0 && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#dc2626', marginLeft: 8, verticalAlign: 'middle' }}></span>}
                        </p>
                    </div>
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

                {/* ═══════════ SEND FORM ═══════════ */}
                {showForm && (
                    <div style={{ ...s.card, padding: '28px', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.textHeading, margin: '0 0 20px', fontFamily: "'Merriweather', serif" }}>Send New Notice</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={s.formLabel}>Receiver User ID</label>
                                    <input type="number" value={form.receiver_id} onChange={e => setForm({ ...form, receiver_id: e.target.value })} placeholder="Enter tenant's user ID" required style={s.formInput} />
                                    <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Tip: Tenant ID is 3 (tenant@test.com)</p>
                                </div>
                                <div>
                                    <label style={s.formLabel}>Notice Title</label>
                                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Rent Due Reminder" required style={s.formInput} />
                                </div>
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={s.formLabel}>Message</label>
                                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Write your notice message here..." required rows={4}
                                    style={{ ...s.formInput, resize: 'none', minHeight: 100 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" disabled={submitting} style={s.heroCta}
                                    onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                    onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                    {submitting ? 'Sending...' : 'Send Notice'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                                    style={s.cancelBtn}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══════════ TABS ═══════════ */}
                <div style={s.tabRow}>
                    {[
                        { key: 'sent', label: 'SENT NOTICES' },
                        { key: 'received', label: 'RECEIVED' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setFilter(t.key)}
                            style={{
                                ...s.tabBtn,
                                color: filter === t.key ? colors.textPrimary : colors.textMuted,
                                borderBottom: filter === t.key ? `2px solid ${colors.accent}` : '2px solid transparent',
                                fontWeight: filter === t.key ? 700 : 500,
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════ MAIN GRID (Left + Right) ═══════════ */}
                <div style={s.mainGrid}>

                    {/* LEFT: NOTICES LIST */}
                    <div style={s.leftCol}>
                        {displayed.length === 0 ? (
                            <div style={{ ...s.card, padding: '56px 24px', textAlign: 'center' }}>
                                <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.4 }}>🔔</div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 6, fontFamily: "'Merriweather', serif" }}>
                                    No {filter} notices
                                </h3>
                                <p style={{ fontSize: 13, color: colors.textMuted }}>
                                    {filter === 'sent' ? 'You have not sent any notices yet.' : 'You have not received any notices.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {displayed.map((n, i) => {
                                    const status = statusMap(n);
                                    const icon = noticeIcons[i % noticeIcons.length];
                                    return (
                                        <div key={n.id} style={s.noticeCard}>
                                            <div style={s.noticeTop}>
                                                <div style={s.noticeIcon}>{icon}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                        <h3 style={s.noticeTitle}>{n.title}</h3>
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
                                                            background: status.bg, color: status.color, letterSpacing: '0.06em',
                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
                                                        }}>{status.label}</span>
                                                    </div>
                                                    <p style={s.noticeMessage}>
                                                        {n.message?.length > 120 ? n.message.substring(0, 120) + '...' : n.message}
                                                    </p>
                                                    <div style={s.noticeMeta}>
                                                        <div style={{ display: 'flex', gap: 16 }}>
                                                            <span style={s.metaItem}>
                                                                👤 {filter === 'sent' ? `Sent to ${n.receiver_name || '1 Tenant'}` : `From ${n.sender_name}`}
                                                            </span>
                                                            <span style={s.metaItem}>🕐 {formatDate(n.created_at)}</span>
                                                        </div>
                                                        {filter === 'sent' && (
                                                            <button onClick={() => handleDelete(n.id)} style={s.deleteBtn}>DELETE</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: SIDEBAR */}
                    <div style={s.rightCol}>

                        {/* Notice Templates */}
                        <div style={{ ...s.card, padding: '22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                <h3 style={s.sidebarTitle}>NOTICE TEMPLATES</h3>
                                <span style={{ width: 24, height: 24, borderRadius: '50%', background: colors.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>+</span>
                            </div>
                            {[
                                { title: 'Standard Rent Increase', sub: 'LEGAL NOTICE • 6 TEMPLATES' },
                                { title: 'Maintenance Entry', sub: 'HOSPITALITY • 3 TEMPLATES' },
                                { title: 'Lease Renewal Offer', sub: 'RETENTION • 12 TEMPLATES' },
                            ].map(t => (
                                <div key={t.title} style={s.templateRow}>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: '0 0 2px' }}>{t.title}</p>
                                        <p style={{ fontSize: 10, color: colors.textMuted, margin: 0, letterSpacing: '0.04em' }}>{t.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div style={{ ...s.card, padding: '22px' }}>
                            <h3 style={{ ...s.sidebarTitle, marginBottom: 16 }}>RECENT ACTIVITY</h3>
                            {notices.slice(0, 3).map((n, i) => {
                                const dotColors = [colors.accent, '#ca8a04', '#dc2626'];
                                return (
                                    <div key={n.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColors[i % 3], marginTop: 5, flexShrink: 0 }}></div>
                                        <div>
                                            <p style={{ fontSize: 12, color: colors.textPrimary, margin: '0 0 2px', lineHeight: 1.4 }}>
                                                <strong>{n.receiver_name || 'Tenant'}</strong> {n.is_read ? 'read' : 'received'} "{n.title}"
                                            </p>
                                            <p style={{ fontSize: 10, color: colors.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{timeAgo(n.created_at)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {notices.length === 0 && <p style={{ fontSize: 12, color: colors.textMuted }}>No recent activity</p>}
                        </div>

                        {/* Promo CTA */}
                        <div style={s.promoCard}>
                            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px', fontFamily: "'Merriweather', serif", fontStyle: 'italic' }}>Need a legal review?</h4>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 16px' }}>
                                Get your custom notices vetted by our property law experts within 24 hours.
                            </p>
                            <button style={s.promoBtn}>REQUEST REVIEW</button>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}


/* ═══════════ STYLES ═══════════ */
const spinCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;

function makeStyles(c, isDark) {
    return {
        page: { minHeight: '100vh', background: c.pageBg, fontFamily: "'Inter', 'Open Sans', sans-serif", transition: 'background 0.3s' },
        container: { maxWidth: 1440, margin: '0 auto', padding: '0 48px 0' },

        heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '48px 0 28px', flexWrap: 'wrap', gap: 20 },
        heroTitle: { fontSize: 48, fontWeight: 800, color: c.textHeading, letterSpacing: '-1px', margin: 0, lineHeight: 1.1, fontFamily: "'Merriweather', Georgia, serif" },
        heroTitleAccent: { fontSize: 48, fontWeight: 800, color: c.accent, letterSpacing: '-1px', margin: '0 0 14px', lineHeight: 1.1, fontFamily: "'Merriweather', Georgia, serif", fontStyle: 'italic' },
        heroSub: { fontSize: 14, color: c.textSecondary, lineHeight: 1.8, margin: 0 },
        heroCta: { background: c.accent, color: '#fff', border: 'none', padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },
        cancelBtn: { background: 'transparent', color: c.textSecondary, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },

        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
        statCard: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.3s' },
        statLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' },
        statValue: { fontSize: 32, fontWeight: 800, color: c.textPrimary, margin: 0, lineHeight: 1, fontFamily: "'Merriweather', serif" },

        tabRow: { display: 'flex', gap: 24, marginBottom: 20, borderBottom: `1px solid ${c.border}`, paddingBottom: 0 },
        tabBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, letterSpacing: '0.06em', padding: '10px 4px', transition: 'all 0.15s' },

        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },

        mainGrid: { display: 'flex', gap: 24, alignItems: 'flex-start' },
        leftCol: { flex: 1, minWidth: 0 },
        rightCol: { width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 18 },

        noticeCard: { ...cardBase(c), padding: '24px 24px 18px' },
        noticeTop: { display: 'flex', gap: 14, alignItems: 'flex-start' },
        noticeIcon: {
            width: 40, height: 40, borderRadius: '50%',
            background: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0, marginTop: 2,
        },
        noticeTitle: { fontSize: 16, fontWeight: 700, color: c.textHeading, margin: 0, fontFamily: "'Merriweather', serif" },
        noticeMessage: { fontSize: 13, color: c.textSecondary, lineHeight: 1.6, margin: '0 0 12px' },
        noticeMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
        metaItem: { fontSize: 11, color: c.textMuted, fontWeight: 500 },
        deleteBtn: {
            fontSize: 10, fontWeight: 700, padding: '6px 14px', borderRadius: 6,
            border: `1px solid ${isDark ? 'rgba(220,38,38,0.3)' : '#fecaca'}`,
            background: isDark ? 'rgba(220,38,38,0.08)' : '#fef2f2', color: '#dc2626',
            cursor: 'pointer', letterSpacing: '0.06em', transition: 'all 0.15s',
        },

        sidebarTitle: { fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 },
        templateRow: { padding: '12px 0', borderBottom: `1px solid ${c.borderLight}` },

        promoCard: {
            background: isDark ? 'linear-gradient(135deg, #1e3a5f, #1a1a2e)' : 'linear-gradient(135deg, #1e3a5f, #0c1445)',
            borderRadius: 14, padding: '28px 22px', color: '#fff',
        },
        promoBtn: {
            background: '#fff', color: '#1e3a5f', border: 'none', borderRadius: 8,
            padding: '10px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            cursor: 'pointer', transition: 'all 0.15s',
        },

        formLabel: { display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
        formInput: { width: '100%', border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: c.textPrimary, background: c.inputBg, outline: 'none', fontFamily: 'inherit' },

        footerSection: { borderTop: `1px solid ${c.border}`, paddingTop: 48, marginTop: 40 },
        footerGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: 32, marginBottom: 32 },
        footerColTitle: { fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' },
        footerLink: { fontSize: 13, color: c.textSecondary, margin: '0 0 8px', cursor: 'pointer' },
        footerBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 28, borderTop: `1px solid ${c.border}`, fontSize: 10, color: c.textMuted, letterSpacing: '0.04em' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}

function cardBase(c) {
    return { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, transition: 'all 0.3s' };
}