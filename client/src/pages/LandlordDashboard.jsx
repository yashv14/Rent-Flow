import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../services/api';

const PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop',
];

export default function LandlordDashboard() {
    const { user } = useAuth();
    const { isDark, colors } = useTheme();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [rentRecords, setRentRecords] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [propsRes, bookRes, rentRes, noticeRes] = await Promise.all([
                    API.get('/properties/my'),
                    API.get('/bookings/all'),
                    API.get('/rent/all'),
                    API.get('/notices/sent'),
                ]);
                setProperties(propsRes.data);
                setBookings(bookRes.data);
                setRentRecords(rentRes.data);
                setNotices(noticeRes.data);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const totalCollected = rentRecords.filter(r => r.is_paid).reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalPending = rentRecords.filter(r => !r.is_paid).reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalExpected = totalCollected + totalPending;
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const activeTenants = bookings.filter(b => b.status === 'approved');

    const s = makeStyles(colors, isDark);

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    if (loading) {
        return (
            <div style={s.page}>
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={s.spinner}></div>
                        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Loading dashboard...</p>
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <Navbar />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={s.container}>

                {/* ═══════════ HERO ═══════════ */}
                <div style={s.heroSection}>
                    <div style={{ flex: 1 }}>
                        <h1 style={s.heroTitle}>{greeting}, {user?.name || 'Landlord'}</h1>
                        <p style={s.heroSub}>Here's what's happening with your properties today.</p>
                    </div>
                    <button onClick={() => navigate('/landlord/properties')} style={s.heroCta}
                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                        <span style={{ fontSize: 18, marginRight: 6 }}>⊕</span> Add Property
                    </button>
                </div>

                {/* ═══════════ STAT CARDS ═══════════ */}
                <div style={s.statsGrid}>
                    <StatCard c={colors} isDark={isDark}
                        label="TOTAL PROPERTIES" value={properties.length}
                        icon={<GridIcon color={colors.accent} />} accentColor={colors.accent} />
                    <StatCard c={colors} isDark={isDark}
                        label="ACTIVE TENANTS" value={activeTenants.length}
                        icon={<UsersIcon color={colors.accent} />} accentColor={colors.accent}
                        trend={activeTenants.length > 0 ? `+${activeTenants.length}` : null} trendUp />
                    <StatCard c={colors} isDark={isDark}
                        label="RENT COLLECTED" value={`₹${totalCollected.toLocaleString('en-IN')}`}
                        icon={<WalletIcon color="#16a34a" />} accentColor="#16a34a"
                        trend={totalCollected > 0 ? '+12%' : null} trendUp />
                    <StatCard c={colors} isDark={isDark}
                        label="PENDING DUES" value={`₹${totalPending.toLocaleString('en-IN')}`}
                        icon={<AlertIcon color="#dc2626" />} accentColor="#dc2626"
                        trend={totalPending > 0 ? `-${rentRecords.filter(r => !r.is_paid).length}` : null} />
                </div>

                {/* ═══════════ MAIN GRID ═══════════ */}
                <div style={s.mainGrid}>

                    {/* LEFT COLUMN */}
                    <div style={s.leftCol}>

                        {/* PORTFOLIO GRID */}
                        <div>
                            <div style={s.sectionHeader}>
                                <h2 style={s.sectionTitle}>Portfolio Grid</h2>
                                <button onClick={() => navigate('/landlord/properties')} style={s.viewAllLink}
                                    onMouseEnter={e => e.currentTarget.style.color = colors.accentHover}
                                    onMouseLeave={e => e.currentTarget.style.color = colors.accent}>
                                    VIEW ALL &nbsp;→
                                </button>
                            </div>

                            {properties.length === 0 ? (
                                <div style={{ ...s.card, padding: '48px 24px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🏢</div>
                                    <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 16 }}>No properties added yet.</p>
                                    <button onClick={() => navigate('/landlord/properties')}
                                        style={{ ...s.heroCta, fontSize: 13, padding: '10px 20px' }}>
                                        Add your first property →
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                    {properties.slice(0, 4).map((prop, i) => (
                                        <div key={prop.id} style={s.propertyCard}>
                                            {/* Image with price overlay */}
                                            <div style={s.propImgWrap}>
                                                <img src={PROPERTY_IMAGES[i % PROPERTY_IMAGES.length]}
                                                    alt={prop.title} style={s.propImg} />
                                                <span style={{
                                                    ...s.propStatusBadge,
                                                    background: prop.is_available ? '#16a34a' : '#2563eb',
                                                }}>
                                                    {prop.is_available ? 'AVAILABLE' : 'OCCUPIED'}
                                                </span>
                                                <span style={s.propPriceTag}>
                                                    ₹{parseFloat(prop.rent_amount).toLocaleString('en-IN')}
                                                    <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>/mo</span>
                                                </span>
                                            </div>
                                            {/* Info */}
                                            <div style={s.propBody}>
                                                <h3 style={s.propTitle}>{prop.title}</h3>
                                                <p style={s.propAddr}>📍 {prop.address}</p>
                                                <div style={s.propActions}>
                                                    <button onClick={() => navigate('/landlord/properties')}
                                                        style={s.editBtn}
                                                        onMouseEnter={e => e.currentTarget.style.background = colors.border}
                                                        onMouseLeave={e => e.currentTarget.style.background = isDark ? colors.cardBgElevated : '#f3f4f6'}>
                                                        EDIT
                                                    </button>
                                                    <button style={s.deleteBtn}
                                                        onClick={() => navigate('/landlord/properties')}>
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PENDING BOOKINGS */}
                        {pendingBookings.length > 0 && (
                            <div style={s.card}>
                                <div style={{ ...s.cardInnerHeader, padding: '18px 24px 0' }}>
                                    <h3 style={s.cardTitle}>
                                        Pending Bookings
                                        <span style={s.countBadge}>{pendingBookings.length}</span>
                                    </h3>
                                    <button onClick={() => navigate('/landlord/bookings')} style={s.viewAllLink}
                                        onMouseEnter={e => e.currentTarget.style.color = colors.accentHover}
                                        onMouseLeave={e => e.currentTarget.style.color = colors.accent}>
                                        View All →
                                    </button>
                                </div>
                                <div style={{ padding: '12px 24px 16px' }}>
                                    {pendingBookings.slice(0, 3).map((b) => (
                                        <div key={b.id} style={s.bookingRow}>
                                            <div style={s.bookingAvatar}>{b.tenant_name?.charAt(0)}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>{b.tenant_name}</p>
                                                <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>{b.property_title}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => navigate('/landlord/bookings')} style={s.approveBtn}>Approve</button>
                                                <button onClick={() => navigate('/landlord/bookings')} style={s.rejectBtn}>Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div style={s.rightCol}>

                        {/* RENT OVERVIEW */}
                        <div style={{ ...s.card, padding: '20px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <WalletIcon color={colors.accent} />
                                </div>
                                <h3 style={s.cardTitle}>Rent Overview</h3>
                            </div>
                            {[
                                { label: 'TOTAL EXPECTED', value: `₹${totalExpected.toLocaleString('en-IN')}`, color: colors.textPrimary },
                                { label: 'RECEIVED', value: `₹${totalCollected.toLocaleString('en-IN')}`, color: '#16a34a' },
                                { label: 'REMAINING', value: `₹${totalPending.toLocaleString('en-IN')}`, color: '#dc2626' },
                            ].map(item => (
                                <div key={item.label} style={s.rentRow}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.06em' }}>{item.label}</span>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: item.color, fontFamily: "'Merriweather', serif" }}>{item.value}</span>
                                </div>
                            ))}
                            <button onClick={() => navigate('/landlord/rent')}
                                style={{ ...s.viewAllLink, display: 'block', textAlign: 'center', width: '100%', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${colors.borderLight}` }}
                                onMouseEnter={e => e.currentTarget.style.color = colors.accentHover}
                                onMouseLeave={e => e.currentTarget.style.color = colors.accent}>
                                View Rent Tracker →
                            </button>
                        </div>

                        {/* RECENT NOTICES */}
                        <div style={{ ...s.card, padding: '20px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                <span style={{ fontSize: 18 }}>📢</span>
                                <h3 style={s.cardTitle}>Recent Notices</h3>
                            </div>
                            {notices.length === 0 ? (
                                <p style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No notices sent yet.</p>
                            ) : (
                                notices.slice(0, 3).map((n, i) => {
                                    const borderColors = [colors.accent, '#dc2626', '#16a34a', '#eab308'];
                                    const tagLabels = ['INFO', 'OVERDUE', 'REMINDER', 'NOTE'];
                                    return (
                                        <div key={n.id} style={{
                                            padding: '12px 0 12px 14px',
                                            borderLeft: `3px solid ${borderColors[i % 4]}`,
                                            marginBottom: 14,
                                        }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: '0 0 3px' }}>{n.title}</p>
                                            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 4px' }}>
                                                To: {n.receiver_name} · {n.is_read ? 'Seen ✓' : 'Unread'}
                                            </p>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: borderColors[i % 4], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                {tagLabels[i % 4]}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <button onClick={() => navigate('/landlord/notices')}
                                style={{ ...s.viewAllLink, display: 'block', textAlign: 'center', width: '100%', paddingTop: 14, borderTop: `1px solid ${colors.borderLight}` }}
                                onMouseEnter={e => e.currentTarget.style.color = colors.accentHover}
                                onMouseLeave={e => e.currentTarget.style.color = colors.accent}>
                                Send New Notice →
                            </button>
                        </div>

                        {/* QUICK ACTIONS */}
                        <div>
                            <h4 style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                                QUICK ACTIONS
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Send Announcement', icon: '➤', path: '/landlord/notices' },
                                    { label: 'Generate Report', icon: '📄', path: '/landlord/rent' },
                                    { label: 'View Analytics', icon: '📊', path: '/landlord/bookings' },
                                ].map(action => (
                                    <button key={action.label} onClick={() => navigate(action.path)}
                                        style={s.quickActionBtn}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textPrimary; }}>
                                        <span>{action.label}</span>
                                        <span style={{ fontSize: 16, opacity: 0.6 }}>{action.icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}


/* ═══════════ ICON COMPONENTS ═══════════ */

function GridIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    );
}
function UsersIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function WalletIcon({ color }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="22" height="14" rx="2" /><path d="M1 10h22" />
        </svg>
    );
}
function AlertIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}


/* ═══════════ STAT CARD ═══════════ */

function StatCard({ c, isDark, label, value, icon, accentColor, trend, trendUp }) {
    return (
        <div style={{
            background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '18px 20px',
            borderLeft: `3px solid ${accentColor}`, transition: 'all 0.3s',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? `${accentColor}18` : `${accentColor}12`,
                }}>{icon}</div>
            </div>
            <p style={{ fontSize: 30, fontWeight: 800, color: c.textPrimary, letterSpacing: '-1px', margin: 0, lineHeight: 1, fontFamily: "'Merriweather', serif" }}>{value}</p>
            {trend && (
                <p style={{ fontSize: 11, color: trendUp ? '#16a34a' : '#dc2626', marginTop: 6, fontWeight: 600, margin: '6px 0 0' }}>
                    <span style={{ fontSize: 10 }}>{trendUp ? '↗' : '↘'}</span> {trend}
                </p>
            )}
        </div>
    );
}


/* ═══════════ STYLES FACTORY ═══════════ */

function makeStyles(c, isDark) {
    return {
        page: { minHeight: '100vh', background: c.pageBg, fontFamily: "'Inter', 'Open Sans', sans-serif", transition: 'background 0.3s' },
        container: { maxWidth: 1440, margin: '0 auto', padding: '0 48px 40px' },

        heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '36px 0 32px', flexWrap: 'wrap', gap: 16 },
        heroTitle: { fontSize: 36, fontWeight: 800, color: c.textHeading, letterSpacing: '-0.5px', margin: '0 0 8px', lineHeight: 1.15, fontFamily: "'Merriweather', Georgia, serif", fontStyle: 'italic' },
        heroSub: { fontSize: 14, color: c.textSecondary, lineHeight: 1.7, margin: 0 },
        heroCta: { background: c.accent, color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },

        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },

        mainGrid: { display: 'flex', gap: 24, alignItems: 'flex-start' },
        leftCol: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 },
        rightCol: { width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 },

        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },

        sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
        sectionTitle: { fontSize: 22, fontWeight: 700, color: c.textHeading, margin: 0, fontFamily: "'Merriweather', Georgia, serif" },
        cardTitle: { fontSize: 16, fontWeight: 700, color: c.textHeading, margin: 0, fontFamily: "'Merriweather', Georgia, serif" },
        cardInnerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },

        viewAllLink: { fontSize: 12, fontWeight: 700, color: c.accent, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.15s', padding: 0 },

        /* Property cards */
        propertyCard: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },
        propImgWrap: { position: 'relative', height: 180, overflow: 'hidden' },
        propImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        propStatusBadge: { position: 'absolute', top: 12, left: 12, color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: '0.08em' },
        propPriceTag: { position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 16, fontWeight: 700, padding: '6px 12px', borderRadius: 8, backdropFilter: 'blur(4px)' },
        propBody: { padding: '14px 16px 16px' },
        propTitle: { fontSize: 15, fontWeight: 700, color: c.textPrimary, margin: '0 0 3px', fontFamily: "'Merriweather', serif" },
        propAddr: { fontSize: 12, color: c.textSecondary, margin: '0 0 12px' },
        propActions: { display: 'flex', gap: 8 },
        editBtn: { flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: isDark ? c.cardBgElevated : '#f3f4f6', color: c.textPrimary, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s', letterSpacing: '0.06em' },
        deleteBtn: { width: 36, height: 36, borderRadius: 8, border: 'none', background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2', color: '#dc2626', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

        /* Bookings */
        countBadge: { display: 'inline-block', background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8, verticalAlign: 'middle' },
        bookingRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${c.borderLight}` },
        bookingAvatar: { width: 36, height: 36, borderRadius: '50%', background: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
        approveBtn: { fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(22,163,74,0.3)' : '#bbf7d0'}`, background: isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', color: '#16a34a', cursor: 'pointer', transition: 'all 0.15s' },
        rejectBtn: { fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(220,38,38,0.3)' : '#fecaca'}`, background: isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2', color: '#dc2626', cursor: 'pointer', transition: 'all 0.15s' },

        /* Rent rows */
        rentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${c.borderLight}` },

        /* Quick Actions */
        quickActionBtn: {
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '14px 16px',
            color: c.textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
        },

        /* Footer */
        footer: { textAlign: 'center', marginTop: 56, paddingTop: 24, borderTop: `1px solid ${c.border}`, fontSize: 11, color: c.textMuted, letterSpacing: '0.08em', fontWeight: 500, transition: 'border-color 0.3s' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}