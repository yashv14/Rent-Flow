import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import API from '../../services/api';

const PROP_IMAGES = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop',
];
const HERO_IMG = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=500&fit=crop';

export default function TenantPropertiesPage() {
    const navigate = useNavigate();
    const { isDark, colors } = useTheme();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null); // property being booked (shown inline)
    const [form, setForm] = useState({ start_date: '', end_date: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchCity, setSearchCity] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await API.get('/properties');
                setProperties(res.data);
            } catch (err) {
                setError('Failed to load properties');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await API.post('/bookings', {
                property_id: booking.id,
                start_date: form.start_date,
                end_date: form.end_date,
            });
            setSuccess(`Booking request sent for ${booking.title}!`);
            setBooking(null);
            setForm({ start_date: '', end_date: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit booking');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = searchCity
        ? properties.filter(p =>
            (p.address || '').toLowerCase().includes(searchCity.toLowerCase()) ||
            (p.city || '').toLowerCase().includes(searchCity.toLowerCase()) ||
            (p.title || '').toLowerCase().includes(searchCity.toLowerCase()))
        : properties;

    const s = makeStyles(colors, isDark);

    if (loading) {
        return (
            <div style={s.page}>
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={s.spinner}></div>
                        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Loading properties...</p>
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
                    <h1 style={s.heroTitle}>Discover Your Next<br />Home</h1>
                    <p style={s.heroSub}>
                        Curated premium residences across the city's most desirable neighborhoods,
                        managed with absolute precision.
                    </p>
                </div>

                {/* ═══════════ SEARCH BAR ═══════════ */}
                <div style={s.searchBar}>
                    <div style={s.searchField}>
                        <span style={s.searchIcon}>📍</span>
                        <div>
                            <p style={s.searchLabel}>LOCATION</p>
                            <input type="text" placeholder="Search city or neighborhood"
                                value={searchCity} onChange={e => setSearchCity(e.target.value)}
                                style={s.searchInput} />
                        </div>
                    </div>
                    <div style={s.searchDivider}></div>
                    <div style={s.searchField}>
                        <span style={s.searchIcon}>💰</span>
                        <div>
                            <p style={s.searchLabel}>PRICE RANGE</p>
                            <p style={{ ...s.searchInput, cursor: 'default', fontSize: 13, color: colors.textPrimary, margin: 0, padding: 0, border: 'none', background: 'none' }}>
                                ₹5,000 – ₹50,000
                            </p>
                        </div>
                    </div>
                    <div style={s.searchDivider}></div>
                    <div style={s.searchField}>
                        <span style={s.searchIcon}>🏠</span>
                        <div>
                            <p style={s.searchLabel}>PROPERTY TYPE</p>
                            <p style={{ ...s.searchInput, cursor: 'default', fontSize: 13, color: colors.textPrimary, margin: 0, padding: 0, border: 'none', background: 'none' }}>
                                All Types
                            </p>
                        </div>
                    </div>
                    <button style={s.searchBtn}
                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                        🔍&nbsp; Find Results
                    </button>
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

                {/* ═══════════ PROPERTIES GRID ═══════════ */}
                {filtered.length === 0 ? (
                    <div style={{ ...s.card, padding: '64px 24px', textAlign: 'center', marginBottom: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🏠</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 8, fontFamily: "'Merriweather', serif" }}>
                            No properties available
                        </h3>
                        <p style={{ fontSize: 13, color: colors.textMuted }}>Check back later for new listings.</p>
                    </div>
                ) : (
                    <div style={s.propGrid}>
                        {filtered.map((prop, i) => {
                            const isBooking = booking?.id === prop.id;
                            return (
                                <div key={prop.id} style={{
                                    ...s.propCard,
                                    ...(isBooking ? s.propCardActive : {}),
                                }}>
                                    {/* IMAGE */}
                                    <div style={s.propImgWrap}>
                                        <img src={PROP_IMAGES[i % PROP_IMAGES.length]} alt={prop.title} style={s.propImg} />
                                        <span style={s.availBadge}>● AVAILABLE</span>
                                        {isBooking && (
                                            <button onClick={() => setBooking(null)}
                                                style={s.closeBtn}>✕</button>
                                        )}
                                    </div>

                                    {/* BODY */}
                                    <div style={s.propBody}>
                                        <h3 style={s.propTitle}>{prop.title}</h3>
                                        <p style={s.propAddr}>📍 {prop.address}{prop.city ? `, ${prop.city}` : ''}</p>

                                        {/* Meta row */}
                                        <div style={s.metaRow}>
                                            <span style={s.metaItem}>🛏 {prop.bedrooms || '—'} BR</span>
                                            <span style={s.metaItem}>🛁 {prop.bathrooms || '—'} BA</span>
                                            <span style={s.metaItem}>📐 {prop.area || '—'} SF</span>
                                        </div>

                                        {/* Price + Booking */}
                                        {isBooking ? (
                                            <form onSubmit={handleBook} style={{ marginTop: 12 }}>
                                                <p style={s.propPrice}>
                                                    ₹{parseFloat(prop.rent_amount).toLocaleString('en-IN')}
                                                    <span style={s.priceUnit}>/mo</span>
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '12px 0' }}>
                                                    <div>
                                                        <p style={s.dateLabel}>MOVE-IN DATE</p>
                                                        <div style={s.dateInputWrap}>
                                                            <input type="date" value={form.start_date}
                                                                onChange={e => setForm({ ...form, start_date: e.target.value })}
                                                                required style={s.dateInput} />
                                                            <span style={s.dateIcon}>📅</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p style={s.dateLabel}>MOVE-OUT DATE</p>
                                                        <div style={s.dateInputWrap}>
                                                            <input type="date" value={form.end_date}
                                                                onChange={e => setForm({ ...form, end_date: e.target.value })}
                                                                style={s.dateInput} />
                                                            <span style={s.dateIcon}>📅</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={s.bookingInfo}>
                                                    <span style={{ fontSize: 14 }}>ℹ️</span>
                                                    <span>Total due at signing: ₹{parseFloat(prop.rent_amount).toLocaleString('en-IN')} (First month + Security Deposit)</span>
                                                </div>
                                                <button type="submit" disabled={submitting}
                                                    style={s.confirmBtn}
                                                    onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                                    onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                                    {submitting ? 'Sending...' : 'CONFIRM BOOKING'}
                                                </button>
                                            </form>
                                        ) : (
                                            <div style={s.priceRow}>
                                                <p style={s.propPrice}>
                                                    ₹{parseFloat(prop.rent_amount).toLocaleString('en-IN')}
                                                    <span style={s.priceUnit}>/mo</span>
                                                </p>
                                                <button onClick={() => { setBooking(prop); setError(''); setSuccess(''); }}
                                                    style={s.bookBtn}
                                                    onMouseEnter={e => { e.currentTarget.style.background = colors.textPrimary; e.currentTarget.style.color = isDark ? '#0f1117' : '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textPrimary; }}>
                                                    BOOK THIS PROPERTY
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════════ WHY RENTFLOW SECTION ═══════════ */}
                <div style={s.whySection}>
                    <div style={s.whyImgWrap}>
                        <img src={HERO_IMG} alt="Premium property" style={s.whyImg} />
                        <div style={s.whyImgOverlay}>
                            <p style={s.whyImgLabel}>PREMIUM STANDARD</p>
                            <p style={s.whyImgTitle}>Professional management, curated comfort.</p>
                        </div>
                    </div>
                    <div style={s.whyContent}>
                        <div style={{ width: 40, height: 3, background: colors.accent, borderRadius: 2, marginBottom: 16 }}></div>
                        <h2 style={s.whyTitle}>Why RentFlow?</h2>
                        {[
                            { icon: '✓', title: 'Vetted Properties', desc: 'Every listing undergoes a 50-point inspection before appearing on our platform.' },
                            { icon: '⚡', title: 'Instant Booking', desc: 'Skip the long applications. Our verified tenant profiles enable 24-hour approvals.' },
                            { icon: '🛎', title: 'Concierge Service', desc: '24/7 maintenance support and a dedicated property manager for every tenant.' },
                        ].map(item => (
                            <div key={item.title} style={s.featureRow}>
                                <div style={s.featureIcon}>{item.icon}</div>
                                <div>
                                    <p style={s.featureTitle}>{item.title}</p>
                                    <p style={s.featureDesc}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
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

        /* Hero */
        heroSection: { padding: '48px 0 28px' },
        heroTitle: { fontSize: 48, fontWeight: 800, color: c.textHeading, letterSpacing: '-1px', margin: '0 0 16px', lineHeight: 1.1, fontFamily: "'Merriweather', Georgia, serif" },
        heroSub: { fontSize: 15, color: c.textSecondary, lineHeight: 1.7, margin: 0, maxWidth: 480 },

        /* Search bar */
        searchBar: {
            display: 'flex', alignItems: 'center', gap: 0, background: c.cardBg, border: `1px solid ${c.border}`,
            borderRadius: 14, padding: '8px 8px 8px 20px', marginBottom: 32, transition: 'all 0.3s',
        },
        searchField: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px' },
        searchIcon: { fontSize: 18 },
        searchLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' },
        searchInput: { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: c.textPrimary, padding: 0, fontFamily: 'inherit' },
        searchDivider: { width: 1, height: 36, background: c.border, flexShrink: 0 },
        searchBtn: {
            background: c.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 28px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s', flexShrink: 0,
        },

        /* Cards base */
        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },

        /* Properties grid */
        propGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 56 },
        propCard: {
            background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden',
            transition: 'all 0.3s, transform 0.2s',
        },
        propCardActive: { border: `2px solid ${c.accent}`, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(37,99,235,0.12)' },
        propImgWrap: { position: 'relative', height: 200, overflow: 'hidden' },
        propImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        availBadge: { position: 'absolute', top: 12, left: 12, background: isDark ? 'rgba(22,163,74,0.85)' : '#16a34a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: '0.06em' },
        closeBtn: {
            position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%',
            background: c.cardBg, border: `1px solid ${c.border}`, color: c.textPrimary,
            fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        },

        propBody: { padding: '16px 18px 18px' },
        propTitle: { fontSize: 16, fontWeight: 700, color: c.textPrimary, margin: '0 0 4px', fontFamily: "'Merriweather', serif" },
        propAddr: { fontSize: 12, color: c.textSecondary, margin: '0 0 8px' },
        metaRow: { display: 'flex', gap: 14, marginBottom: 12 },
        metaItem: { fontSize: 11, color: c.textMuted, fontWeight: 500 },

        priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 12, borderTop: `1px solid ${c.borderLight}` },
        propPrice: { fontSize: 20, fontWeight: 800, color: c.textPrimary, margin: 0, fontFamily: "'Merriweather', serif" },
        priceUnit: { fontSize: 12, fontWeight: 400, color: c.textMuted },
        bookBtn: {
            background: 'transparent', color: c.textPrimary, border: `1.5px solid ${c.border}`,
            borderRadius: 8, padding: '8px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            cursor: 'pointer', transition: 'all 0.2s',
        },

        /* Inline booking form */
        dateLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' },
        dateInputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
        dateInput: {
            width: '100%', border: `1px solid ${c.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 12,
            color: c.textPrimary, background: c.inputBg, outline: 'none', fontFamily: 'inherit',
        },
        dateIcon: { position: 'absolute', right: 10, fontSize: 14, pointerEvents: 'none' },
        bookingInfo: {
            display: 'flex', gap: 8, alignItems: 'flex-start', background: isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
            border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}`, borderRadius: 8,
            padding: '10px 12px', fontSize: 11, color: c.textSecondary, lineHeight: 1.5, marginBottom: 12,
        },
        confirmBtn: {
            width: '100%', background: c.accent, color: '#fff', border: 'none', borderRadius: 10,
            padding: '14px 0', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s',
        },

        /* Why RentFlow */
        whySection: { display: 'flex', gap: 48, alignItems: 'stretch', marginBottom: 56, borderRadius: 14, overflow: 'hidden' },
        whyImgWrap: { flex: 1, position: 'relative', minHeight: 360, borderRadius: 14, overflow: 'hidden' },
        whyImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 14 },
        whyImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '60px 28px 28px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' },
        whyImgLabel: { fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' },
        whyImgTitle: { fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "'Merriweather', serif", fontStyle: 'italic', margin: 0, lineHeight: 1.3 },

        whyContent: { flex: 1, padding: '32px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
        whyTitle: { fontSize: 28, fontWeight: 800, color: c.textHeading, margin: '0 0 28px', fontFamily: "'Merriweather', serif" },
        featureRow: { display: 'flex', gap: 14, marginBottom: 24 },
        featureIcon: {
            width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
            color: c.accent,
        },
        featureTitle: { fontSize: 14, fontWeight: 700, color: c.textPrimary, margin: '0 0 4px' },
        featureDesc: { fontSize: 12, color: c.textSecondary, lineHeight: 1.6, margin: 0 },

        /* Footer */
        footer: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0 32px',
            borderTop: `1px solid ${c.border}`, flexWrap: 'wrap', gap: 16, transition: 'border-color 0.3s',
        },
        footerLinks: { display: 'flex', gap: 24 },
        footerLink: { fontSize: 10, fontWeight: 600, color: c.textMuted, letterSpacing: '0.06em', cursor: 'pointer' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}