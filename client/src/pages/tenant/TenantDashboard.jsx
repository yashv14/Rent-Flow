import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API from '../../services/api';

export default function TenantDashboard() {
    const { user } = useAuth();
    const { isDark, colors } = useTheme();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [rentRecords, setRentRecords] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [bookRes, rentRes, noticeRes] = await Promise.all([
                    API.get('/bookings/my'),
                    API.get('/rent/my'),
                    API.get('/notices/my'),
                ]);
                setBookings(Array.isArray(bookRes.data) ? bookRes.data : []);
                setRentRecords(Array.isArray(rentRes.data) ? rentRes.data : []);
                setNotices(Array.isArray(noticeRes.data) ? noticeRes.data : []);
            } catch (err) {
                console.error('Tenant dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const unpaidRent = rentRecords.filter(r => !r.is_paid);
    const unreadNotices = notices.filter(n => !n.is_read);
    const activeBooking = bookings.find(b => b.status === 'approved');
    const totalUnpaid = unpaidRent.reduce((s, r) => s + parseFloat(r.amount), 0);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric'
    }) : '—';

    const propertyImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop';

    /* ── dynamic styles based on theme ── */
    const s = makeStyles(colors, isDark);

    if (loading) {
        return (
            <div style={s.page}>
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={s.spinner}></div>
                        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Loading your dashboard...</p>
                    </div>
                </div>
                <style>{spinnerKeyframes}</style>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <Navbar />
            <style>{spinnerKeyframes}</style>

            <div style={s.container}>

                {/* ═══════════════ HERO HEADER ═══════════════ */}
                <div style={s.heroSection}>
                    <div style={{ flex: 1 }}>
                        <h1 style={s.heroTitle}>Welcome back, {user?.name || 'Tenant'}</h1>
                        <p style={s.heroSubtitle}>
                            {activeBooking
                                ? `Your lease at ${activeBooking.property_title} is active and up to date.`
                                : 'Explore new listings or manage your current residence below.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/tenant/properties')}
                        style={s.heroCta}
                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}
                    >
                        Browse Properties &nbsp;&#10148;
                    </button>
                </div>

                {/* ═══════════════ STAT CARDS ═══════════════ */}
                <div style={s.statsGrid}>
                    <StatCard c={colors} isDark={isDark}
                        icon={<CalendarIcon color={colors.accent} />}
                        label="MY BOOKINGS" value={bookings.length}
                        tag="TOTAL" tagColor={colors.accent}
                    />
                    <StatCard c={colors} isDark={isDark}
                        icon={<HomeIcon color={colors.accent} />}
                        label="ACTIVE BOOKING" value={activeBooking ? 1 : 0}
                        tag="ACTIVE" tagColor="#16a34a"
                    />
                    <StatCard c={colors} isDark={isDark}
                        icon={<WalletIcon color={colors.danger} />}
                        label="UNPAID RENT" value={`₹${totalUnpaid.toLocaleString('en-IN')}`}
                        tag="BALANCE" tagColor={colors.danger}
                    />
                    <StatCard c={colors} isDark={isDark}
                        icon={<BellIcon color={colors.danger} />}
                        label="UNREAD NOTICES" value={unreadNotices.length}
                        tag={unreadNotices.length > 0 ? null : "NEW"} tagColor={colors.danger}
                        badge={unreadNotices.length > 0 ? `${unreadNotices.length} NEW` : null}
                    />
                </div>

                {/* ═══════════════ MAIN 2-COL LAYOUT ═══════════════ */}
                <div style={s.mainGrid}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={s.leftCol}>

                        {/* CURRENT RESIDENCE */}
                        <div style={s.card}>
                            {activeBooking ? (
                                <>
                                    <div style={s.propertyImageWrap}>
                                        <img src={propertyImage} alt={activeBooking.property_title} style={s.propertyImage} />
                                        <span style={s.currentBadge}>CURRENT RESIDENCE</span>
                                    </div>
                                    <div style={s.propertyBody}>
                                        <div style={s.propertyHeader}>
                                            <div>
                                                <h2 style={s.propertyTitle}>{activeBooking.property_title}</h2>
                                                <p style={s.propertyAddr}>{activeBooking.property_address}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={s.rentLabel}>MONTHLY RENT</p>
                                                <p style={s.rentAmount}>₹{parseFloat(activeBooking.rent_amount).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                        <div style={s.leaseMeta}>
                                            <div>
                                                <p style={s.metaLabel}>LEASE START</p>
                                                <p style={s.metaValue}>{formatDate(activeBooking.start_date)}</p>
                                            </div>
                                            <div>
                                                <p style={s.metaLabel}>LEASE END</p>
                                                <p style={s.metaValue}>{formatDate(activeBooking.end_date)}</p>
                                            </div>
                                            <div>
                                                <p style={s.metaLabel}>STATUS</p>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: colors.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors.success, display: 'inline-block' }}></span>
                                                    ACTIVE
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🏠</div>
                                    <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 16 }}>No active booking yet.</p>
                                    <button onClick={() => navigate('/tenant/properties')}
                                        style={{ ...s.heroCta, fontSize: 13, padding: '10px 20px' }}>
                                        Browse Available Properties →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RENT PAYMENTS TABLE */}
                        <div style={s.card}>
                            <div style={s.sectionHeader}>
                                <h3 style={s.sectionTitle}>Rent Payments</h3>
                                <button onClick={() => navigate('/tenant/rent')} style={s.viewLink}
                                    onMouseEnter={e => e.currentTarget.style.color = colors.accentHover}
                                    onMouseLeave={e => e.currentTarget.style.color = colors.accent}>
                                    View Statement →
                                </button>
                            </div>
                            {rentRecords.length === 0 ? (
                                <div style={{ padding: '32px 0', textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>
                                    No rent records yet.
                                </div>
                            ) : (
                                <div>
                                    <div style={s.tableHeaderRow}>
                                        <span style={{ ...s.tableHeaderCell, flex: 2 }}>MONTH</span>
                                        <span style={{ ...s.tableHeaderCell, flex: 1 }}>AMOUNT</span>
                                        <span style={{ ...s.tableHeaderCell, flex: 1.5 }}>DUE DATE</span>
                                        <span style={{ ...s.tableHeaderCell, flex: 1, textAlign: 'right' }}>STATUS</span>
                                    </div>
                                    {rentRecords.slice(0, 4).map((r) => (
                                        <div key={r.id} style={s.tableRow}>
                                            <span style={{ ...s.tableCell, flex: 2, fontWeight: 600, color: colors.textPrimary }}>
                                                {new Date(r.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <span style={{ ...s.tableCell, flex: 1, fontWeight: 700, color: colors.textPrimary }}>
                                                ₹{parseFloat(r.amount).toLocaleString('en-IN')}
                                            </span>
                                            <span style={{ ...s.tableCell, flex: 1.5, color: colors.textSecondary }}>
                                                {formatDate(r.due_date)}
                                            </span>
                                            <span style={{ ...s.tableCell, flex: 1, textAlign: 'right' }}>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                                    letterSpacing: '0.05em', textTransform: 'uppercase',
                                                    background: r.is_paid ? colors.successBg : colors.warningBg,
                                                    color: r.is_paid ? colors.success : colors.warning,
                                                }}>
                                                    {r.is_paid ? 'PAID' : 'PENDING'}
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div style={s.rightCol}>

                        {/* QUICK ACTIONS */}
                        <div style={s.quickActionsCard}>
                            <h3 style={s.quickActionsTitle}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Browse Properties', icon: '🏠', path: '/tenant/properties' },
                                    { label: 'Pay Rent Early', icon: '💳', path: '/tenant/rent' },
                                    { label: 'My Bookings', icon: '📋', path: '/tenant/bookings' },
                                ].map((action) => (
                                    <button key={action.label} onClick={() => navigate(action.path)}
                                        style={s.quickActionBtn}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                                        <span>{action.label}</span>
                                        <span style={{ fontSize: 16 }}>{action.icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* NOTICES */}
                        <div style={{ ...s.card, padding: '20px 22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={s.sectionTitle}>Notices</h3>
                                {unreadNotices.length > 0 && (
                                    <span style={s.noticeBadge}>{unreadNotices.length} NEW</span>
                                )}
                            </div>

                            {notices.length === 0 ? (
                                <p style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                                    No notices yet.
                                </p>
                            ) : (
                                <div>
                                    {notices.slice(0, 3).map((n, i) => (
                                        <div key={n.id} style={{
                                            padding: '14px 0',
                                            borderBottom: i < Math.min(notices.length, 3) - 1 ? `1px solid ${colors.borderLight}` : 'none',
                                            display: 'flex', gap: 10, alignItems: 'flex-start',
                                        }}>
                                            <div style={{
                                                width: 7, height: 7, borderRadius: '50%', marginTop: 7, flexShrink: 0,
                                                background: n.is_read ? colors.textMuted : colors.accent,
                                            }}></div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>
                                                    {n.sender_role || 'GENERAL'}
                                                </p>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: '0 0 4px' }}>{n.title}</p>
                                                <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.45, margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.message}</p>
                                                <p style={{ fontSize: 11, color: colors.textMuted, margin: 0 }}>
                                                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button onClick={() => navigate('/tenant/notices')}
                                style={{
                                    display: 'block', width: '100%', textAlign: 'center', padding: '14px 0 4px',
                                    marginTop: 12, background: 'none', border: 'none',
                                    borderTop: `1px solid ${colors.borderLight}`,
                                    color: colors.textPrimary, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    transition: 'color 0.15s', letterSpacing: '0.01em',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = colors.accent}
                                onMouseLeave={e => e.currentTarget.style.color = colors.textPrimary}>
                                View All Notices
                            </button>
                        </div>

                        {/* UPGRADE PROMO */}
                        <div style={s.promoCard}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h3 style={s.promoTitle}>Upgrade Your Space</h3>
                                <p style={s.promoText}>Request premium upgrades for your unit, like smart thermostats or designer lighting.</p>
                                <button style={s.promoBtn} onClick={() => navigate('/tenant/properties')}
                                    onMouseEnter={e => { e.currentTarget.style.background = colors.textPrimary; e.currentTarget.style.color = isDark ? '#0f1117' : '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textPrimary; }}>
                                    LEARN MORE
                                </button>
                            </div>
                            <div style={s.promoDecor}>HQ</div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}


/* ═══════════════ SVG ICONS ═══════════════ */

function CalendarIcon({ color }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}
function HomeIcon({ color }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}
function WalletIcon({ color }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="22" height="14" rx="2" /><path d="M1 10h22" />
        </svg>
    );
}
function BellIcon({ color }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}


/* ═══════════════ STAT CARD ═══════════════ */

function StatCard({ c, isDark, icon, label, value, tag, tagColor, badge }) {
    return (
        <div style={{
            background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '18px 18px 16px',
            transition: 'background 0.3s, border-color 0.3s',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark
                        ? (tagColor === c.danger ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)')
                        : (tagColor === c.danger ? '#fef2f2' : '#eff6ff'),
                }}>{icon}</div>
                {badge ? (
                    <span style={{ background: tagColor, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 10, letterSpacing: '0.05em' }}>{badge}</span>
                ) : (
                    <span style={{ fontSize: 9, fontWeight: 700, color: tagColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{tag}</span>
                )}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: c.textPrimary, letterSpacing: '-1px', marginTop: 14, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 5, fontWeight: 500 }}>{label}</div>
        </div>
    );
}


/* ═══════════════ SPINNER ═══════════════ */
const spinnerKeyframes = `@keyframes spin { to { transform: rotate(360deg); } }`;


/* ═══════════════ STYLES FACTORY ═══════════════ */

function makeStyles(c, isDark) {
    return {
        page: {
            minHeight: '100vh',
            background: c.pageBg,
            fontFamily: "'Inter', 'Open Sans', -apple-system, sans-serif",
            transition: 'background 0.3s',
        },
        container: { maxWidth: 1440, margin: '0 auto', padding: '0 48px 40px' },

        heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '36px 0 32px', flexWrap: 'wrap', gap: 16 },
        heroTitle: { fontSize: 36, fontWeight: 800, color: c.textHeading, letterSpacing: '-0.5px', margin: '0 0 8px', lineHeight: 1.15, fontFamily: "'Merriweather', 'Georgia', serif" },
        heroSubtitle: { fontSize: 14, color: c.textSecondary, lineHeight: 1.7, maxWidth: 440, margin: 0 },
        heroCta: { background: c.accent, color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' },

        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },

        mainGrid: { display: 'flex', gap: 24, alignItems: 'flex-start' },
        leftCol: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 },
        rightCol: { width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 },

        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s' },

        propertyImageWrap: { position: 'relative', height: 220, overflow: 'hidden' },
        propertyImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        currentBadge: { position: 'absolute', top: 16, left: 16, background: c.accent, color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 8, letterSpacing: '0.08em' },
        propertyBody: { padding: '22px 24px 24px' },
        propertyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
        propertyTitle: { fontSize: 22, fontWeight: 800, color: c.textHeading, letterSpacing: '-0.3px', margin: '0 0 4px', fontFamily: "'Merriweather', 'Georgia', serif" },
        propertyAddr: { fontSize: 13, color: c.textSecondary, margin: 0 },
        rentLabel: { fontSize: 11, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px', fontWeight: 500 },
        rentAmount: { fontSize: 28, fontWeight: 800, color: c.accent, letterSpacing: '-1px', lineHeight: 1.1, margin: 0 },
        leaseMeta: { display: 'flex', gap: 40, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${c.borderLight}` },
        metaLabel: { fontSize: 10, fontWeight: 600, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' },
        metaValue: { fontSize: 14, fontWeight: 600, color: c.textPrimary, margin: 0 },

        sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 0', marginBottom: 16 },
        sectionTitle: { fontSize: 18, fontWeight: 700, color: c.textHeading, margin: 0, fontFamily: "'Merriweather', 'Georgia', serif" },
        viewLink: { fontSize: 13, color: c.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, transition: 'color 0.15s' },

        tableHeaderRow: { display: 'flex', padding: '0 24px 10px', borderBottom: `1px solid ${c.border}` },
        tableHeaderCell: { fontSize: 10, fontWeight: 600, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' },
        tableRow: { display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: `1px solid ${c.borderLight}` },
        tableCell: { fontSize: 13 },

        quickActionsCard: { background: c.quickActionsBg, borderRadius: 14, padding: '22px 20px' },
        quickActionsTitle: { fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 16px', fontFamily: "'Merriweather', 'Georgia', serif" },
        quickActionBtn: {
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
            padding: '13px 16px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
        },

        noticeBadge: { background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, letterSpacing: '0.03em' },

        promoCard: { background: c.promoBg, borderRadius: 14, padding: '24px 22px', position: 'relative', overflow: 'hidden' },
        promoTitle: { fontSize: 18, fontWeight: 700, color: c.textHeading, margin: '0 0 8px', fontFamily: "'Merriweather', 'Georgia', serif" },
        promoText: { fontSize: 12, color: c.textSecondary, lineHeight: 1.5, margin: '0 0 16px', maxWidth: 200 },
        promoBtn: { background: 'transparent', color: c.textPrimary, border: `1.5px solid ${c.textPrimary}`, padding: '8px 16px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s' },
        promoDecor: { position: 'absolute', bottom: -8, right: 10, fontSize: 64, fontWeight: 900, color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)', lineHeight: 1, fontFamily: "'Merriweather', serif" },

        footer: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, paddingTop: 24,
            borderTop: `1px solid ${c.border}`, fontSize: 12, color: c.textMuted, flexWrap: 'wrap', gap: 12,
            transition: 'border-color 0.3s',
        },
        footerLink: { cursor: 'pointer', color: c.textSecondary, fontWeight: 600, fontSize: 11, letterSpacing: '0.06em' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}