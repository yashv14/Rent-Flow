import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API from '../../services/api';

export default function TenantBookingsPage() {
    const navigate = useNavigate();
    const { isDark, colors } = useTheme();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await API.get('/bookings/my');
                setBookings(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
    }) : '—';

    const timeAgo = (d) => {
        if (!d) return '';
        const diff = (Date.now() - new Date(d).getTime()) / 1000;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // Computed
    const pending = bookings.filter(b => b.status === 'pending').length;
    const approved = bookings.filter(b => b.status === 'approved').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;

    let displayed = filter === 'all' ? bookings
        : bookings.filter(b => b.status === filter);

    if (search) {
        displayed = displayed.filter(b =>
            (b.property_title || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.landlord_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.property_address || '').toLowerCase().includes(search.toLowerCase()));
    }

    const statusInfo = (status) => {
        switch (status) {
            case 'approved': return { label: 'Approved', color: '#16a34a', bg: isDark ? 'rgba(22,163,74,0.12)' : '#dcfce7', icon: '✓' };
            case 'rejected': return { label: 'Rejected', color: '#dc2626', bg: isDark ? 'rgba(220,38,38,0.12)' : '#fee2e2', icon: '✕' };
            default: return { label: 'Pending', color: '#ca8a04', bg: isDark ? 'rgba(202,138,4,0.12)' : '#fef9c3', icon: '⏳' };
        }
    };

    const s = makeStyles(colors, isDark);

    if (loading) {
        return (
            <div style={s.page}><Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={s.spinner}></div>
                        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Loading bookings...</p>
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
                    <div>
                        <h1 style={s.heroTitle}>My Bookings</h1>
                        <p style={s.heroSub}>Track all your property booking requests and their approval status.</p>
                    </div>
                    <button onClick={() => navigate('/tenant/properties')}
                        style={s.heroCta}
                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                        <span style={{ fontSize: 16, marginRight: 6 }}>+</span> Browse Properties
                    </button>
                </div>

                {/* ═══════════ STAT CARDS ═══════════ */}
                <div style={s.statsGrid}>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>TOTAL BOOKINGS</p>
                        <p style={s.statValue}>{bookings.length}</p>
                        <p style={{ fontSize: 11, color: colors.textMuted, margin: '6px 0 0' }}>All time requests</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={{ ...s.statLabel, color: '#ca8a04' }}>PENDING</p>
                        <p style={s.statValue}>{pending}</p>
                        <p style={{ fontSize: 11, color: '#ca8a04', margin: '6px 0 0', fontWeight: 500 }}>Awaiting approval</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={{ ...s.statLabel, color: '#16a34a' }}>APPROVED</p>
                        <p style={s.statValue}>{approved}</p>
                        <p style={{ fontSize: 11, color: '#16a34a', margin: '6px 0 0', fontWeight: 500 }}>✓ Confirmed</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={{ ...s.statLabel, color: '#dc2626' }}>REJECTED</p>
                        <p style={s.statValue}>{rejected}</p>
                        <p style={{ fontSize: 11, color: colors.textMuted, margin: '6px 0 0' }}>Not approved</p>
                    </div>
                </div>

                {/* ═══════════ MESSAGES ═══════════ */}
                {error && (
                    <div style={{ background: isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(220,38,38,0.25)' : '#fecaca'}`, color: '#dc2626', fontSize: 13, padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {/* ═══════════ BOOKINGS TABLE ═══════════ */}
                <div style={{ ...s.card, marginBottom: 48 }}>
                    {/* Table Header */}
                    <div style={{ padding: '22px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.textHeading, margin: 0, fontFamily: "'Merriweather', serif" }}>Booking Requests</h2>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={s.searchWrap}>
                                <span style={{ color: colors.textMuted, fontSize: 14 }}>🔍</span>
                                <input type="text" placeholder="Search property..." value={search}
                                    onChange={e => setSearch(e.target.value)} style={s.searchInput} />
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {['all', 'pending', 'approved', 'rejected'].map(tab => (
                                    <button key={tab} onClick={() => setFilter(tab)}
                                        style={{
                                            ...s.filterBtn,
                                            background: filter === tab ? colors.accent : 'transparent',
                                            color: filter === tab ? '#fff' : colors.textSecondary,
                                            borderColor: filter === tab ? colors.accent : colors.border,
                                        }}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {displayed.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📋</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 8, fontFamily: "'Merriweather', serif" }}>
                                {filter !== 'all' ? `No ${filter} bookings` : 'No bookings yet'}
                            </h3>
                            <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
                                {filter !== 'all' ? 'Try a different filter.' : 'Browse properties and submit a booking request.'}
                            </p>
                            {filter === 'all' && (
                                <button onClick={() => navigate('/tenant/properties')}
                                    style={s.heroCta}
                                    onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                    onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                    Browse Available Properties
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Column Headers */}
                            <div style={s.tHeaderRow}>
                                <span style={{ ...s.tHeaderCell, flex: 2.5 }}>PROPERTY & LANDLORD</span>
                                <span style={{ ...s.tHeaderCell, flex: 1.2 }}>MOVE-IN</span>
                                <span style={{ ...s.tHeaderCell, flex: 1.2 }}>MOVE-OUT</span>
                                <span style={{ ...s.tHeaderCell, flex: 1 }}>RENT</span>
                                <span style={{ ...s.tHeaderCell, flex: 1 }}>STATUS</span>
                            </div>

                            {/* Rows */}
                            {displayed.map((b) => {
                                const st = statusInfo(b.status);
                                const initials = (b.landlord_name || '??').split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
                                return (
                                    <div key={b.id} style={s.tBodyRow}>
                                        {/* Property & Landlord */}
                                        <div style={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                ...s.avatar,
                                                background: b.status === 'approved' ? (isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7') :
                                                    b.status === 'rejected' ? (isDark ? 'rgba(220,38,38,0.15)' : '#fee2e2') :
                                                        (isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff'),
                                                color: b.status === 'approved' ? '#16a34a' : b.status === 'rejected' ? '#dc2626' : colors.accent,
                                            }}>{initials}</div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>{b.property_title}</p>
                                                <p style={{ fontSize: 11, color: colors.textMuted, margin: '2px 0 0' }}>
                                                    📍 {b.property_address} · {b.landlord_name}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Move-in */}
                                        <div style={{ flex: 1.2 }}>
                                            <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0 }}>{formatDate(b.start_date)}</p>
                                        </div>
                                        {/* Move-out */}
                                        <div style={{ flex: 1.2 }}>
                                            <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0 }}>{formatDate(b.end_date)}</p>
                                        </div>
                                        {/* Rent */}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: colors.accent, margin: 0, fontFamily: "'Merriweather', serif" }}>
                                                ₹{parseFloat(b.rent_amount).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        {/* Status */}
                                        <div style={{ flex: 1 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                                                background: st.bg, color: st.color,
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }}></span>
                                                {st.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Pagination row */}
                    {displayed.length > 0 && (
                        <div style={s.paginationRow}>
                            <span style={{ fontSize: 12, color: colors.textMuted }}>
                                Showing <strong>{displayed.length}</strong> of <strong>{bookings.length}</strong> bookings
                            </span>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <button style={{ ...s.pageBtn, opacity: 0.3 }} disabled>Previous</button>
                                <button style={{ ...s.pageBtnNum, background: colors.accent, color: '#fff' }}>1</button>
                                <button style={{ ...s.pageBtn }}>Next</button>
                            </div>
                        </div>
                    )}
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

        heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '36px 0 28px', flexWrap: 'wrap', gap: 16 },
        heroTitle: { fontSize: 32, fontWeight: 800, color: c.textHeading, letterSpacing: '-0.5px', margin: '0 0 6px', fontFamily: "'Merriweather', Georgia, serif" },
        heroSub: { fontSize: 14, color: c.textSecondary, margin: 0 },
        heroCta: { background: c.accent, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },

        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
        statCard: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.3s' },
        statLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' },
        statValue: { fontSize: 32, fontWeight: 800, color: c.textPrimary, margin: 0, lineHeight: 1, fontFamily: "'Merriweather', serif" },

        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },

        searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: isDark ? c.inputBg : '#f9fafb', border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px' },
        searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: c.textPrimary, width: 160, fontFamily: 'inherit' },
        filterBtn: { fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.textSecondary, cursor: 'pointer', transition: 'all 0.15s' },

        tHeaderRow: { display: 'flex', alignItems: 'center', padding: '12px 28px', borderBottom: `1px solid ${c.border}` },
        tHeaderCell: { fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' },
        tBodyRow: { display: 'flex', alignItems: 'center', padding: '16px 28px', borderBottom: `1px solid ${c.borderLight}`, transition: 'background 0.15s' },
        avatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },

        paginationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px' },
        pageBtn: { fontSize: 12, fontWeight: 500, color: c.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px' },
        pageBtnNum: { width: 32, height: 32, borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

        footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: '24px 0 32px', borderTop: `1px solid ${c.border}`, fontSize: 11, color: c.textMuted, letterSpacing: '0.04em' },
        footerLink: { cursor: 'pointer', color: c.textSecondary, fontWeight: 600, fontSize: 11, letterSpacing: '0.06em' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}