import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import API from '../../services/api';

const PROP_IMAGES = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=320&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=320&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=320&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=320&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=320&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=320&fit=crop',
];

export default function PropertiesPage() {
    const { user } = useAuth();
    const { isDark, colors } = useTheme();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProperty, setEditProperty] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');

    const emptyForm = { title: '', address: '', city: '', rent_amount: '', is_available: true };
    const [form, setForm] = useState(emptyForm);

    const fetchProperties = async () => {
        try {
            const res = await API.get('/properties/my');
            setProperties(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load properties');
            setLoading(false);
        }
    };

    useEffect(() => { fetchProperties(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError(''); setSuccess('');
        try {
            if (editProperty) {
                await API.put(`/properties/${editProperty.id}`, form);
                setSuccess('Property updated successfully!');
            } else {
                await API.post('/properties', form);
                setSuccess('Property added successfully!');
            }
            setShowForm(false); setEditProperty(null); setForm(emptyForm);
            await fetchProperties();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            setTimeout(() => setError(''), 3000);
        } finally { setSubmitting(false); }
    };

    const handleEdit = (prop) => {
        setEditProperty(prop);
        setForm({ title: prop.title, address: prop.address, city: prop.city || '', rent_amount: prop.rent_amount, is_available: prop.is_available });
        setShowForm(true); setError(''); setSuccess('');
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/properties/${id}`);
            setProperties(prev => prev.filter(p => p.id !== id));
            setDeleteConfirm(null);
            setSuccess('Property deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete property');
            setDeleteConfirm(null);
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleCancel = () => { setShowForm(false); setEditProperty(null); setForm(emptyForm); setError(''); };

    // Computed
    const occupied = properties.filter(p => !p.is_available).length;
    const available = properties.filter(p => p.is_available).length;
    const occupancyPct = properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0;
    const totalRevenue = properties.reduce((s, p) => s + (p.is_available ? 0 : parseFloat(p.rent_amount || 0)), 0);

    let displayed = filter === 'all' ? properties
        : filter === 'occupied' ? properties.filter(p => !p.is_available)
            : properties.filter(p => p.is_available);

    if (search) {
        displayed = displayed.filter(p =>
            (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.address || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.city || '').toLowerCase().includes(search.toLowerCase()));
    }

    if (sort === 'price_asc') displayed = [...displayed].sort((a, b) => parseFloat(a.rent_amount) - parseFloat(b.rent_amount));
    if (sort === 'price_desc') displayed = [...displayed].sort((a, b) => parseFloat(b.rent_amount) - parseFloat(a.rent_amount));

    const s = makeStyles(colors, isDark);

    if (loading) {
        return (
            <div style={s.page}><Navbar />
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
                    <div style={{ maxWidth: 520 }}>
                        <h1 style={s.heroTitle}>Property Portfolio</h1>
                        <p style={s.heroSub}>
                            Oversee your curated selection of premium residences. Manage leases, track
                            maintenance, and monitor financial performance from a single editorial interface.
                        </p>
                    </div>
                </div>

                {/* ═══════════ INLINE STATS + CTA ═══════════ */}
                <div style={s.statsRow}>
                    <div style={{ display: 'flex', gap: 40 }}>
                        <div>
                            <p style={s.inlineStatLabel}>TOTAL UNITS</p>
                            <p style={s.inlineStatValue}>{properties.length}</p>
                        </div>
                        <div>
                            <p style={s.inlineStatLabel}>OCCUPANCY RATE</p>
                            <p style={s.inlineStatValue}>{occupancyPct}%</p>
                        </div>
                        <div>
                            <p style={s.inlineStatLabel}>ACTIVE REVENUE</p>
                            <p style={s.inlineStatValue}>
                                ₹{totalRevenue.toLocaleString('en-IN')}
                                <span style={{ fontSize: 13, fontWeight: 400, color: colors.textMuted }}>/mo</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={() => { setShowForm(true); setEditProperty(null); setForm(emptyForm); setError(''); }}
                        style={s.heroCta}
                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                        <span style={{ fontSize: 16, marginRight: 6 }}>+</span> Add New Property
                    </button>
                </div>

                {/* ═══════════ FILTER + SEARCH ROW ═══════════ */}
                <div style={s.controlsRow}>
                    <div style={{ display: 'flex', gap: 0, background: isDark ? colors.surfaceBg : '#f3f4f6', borderRadius: 10, padding: 3 }}>
                        {[
                            { key: 'all', label: 'All Properties' },
                            { key: 'occupied', label: 'Occupied' },
                            { key: 'vacant', label: 'Vacant' },
                        ].map(t => (
                            <button key={t.key} onClick={() => setFilter(t.key)}
                                style={{
                                    ...s.tabBtn,
                                    background: filter === t.key ? (isDark ? colors.cardBg : '#fff') : 'transparent',
                                    color: filter === t.key ? colors.textPrimary : colors.textMuted,
                                    fontWeight: filter === t.key ? 600 : 400,
                                    boxShadow: filter === t.key ? (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)') : 'none',
                                    border: filter === t.key ? `1px solid ${colors.border}` : '1px solid transparent',
                                }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={s.searchWrap}>
                            <span style={{ color: colors.textMuted, fontSize: 13 }}>🔍</span>
                            <input type="text" placeholder="Search address or tenant..." value={search}
                                onChange={e => setSearch(e.target.value)} style={s.searchInput} />
                        </div>
                        <button onClick={() => setSort(sort === 'price_desc' ? 'price_asc' : sort === 'price_asc' ? 'default' : 'price_desc')}
                            style={s.sortBtn}>
                            ⇕ Sort by Price
                        </button>
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

                {/* ═══════════ ADD / EDIT FORM ═══════════ */}
                {showForm && (
                    <div style={{ ...s.card, padding: '28px', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.textHeading, margin: '0 0 20px', fontFamily: "'Merriweather', serif" }}>
                            {editProperty ? 'Edit Property' : 'Add New Property'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={s.formLabel}>Property Title</label>
                                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. 2BHK Flat in Sangli" required style={s.formInput} />
                                </div>
                                <div>
                                    <label style={s.formLabel}>City</label>
                                    <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Sangli" style={s.formInput} />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Full Address</label>
                                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="e.g. Miraj Road, Sangli" required style={s.formInput} />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Rent Amount (₹/month)</label>
                                    <input type="number" value={form.rent_amount} onChange={e => setForm({ ...form, rent_amount: e.target.value })} placeholder="e.g. 8000" required style={s.formInput} />
                                </div>
                            </div>
                            {/* Availability */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <span style={s.formLabel}>Availability</span>
                                <button type="button" onClick={() => setForm({ ...form, is_available: !form.is_available })}
                                    style={{ ...s.toggleTrack, background: form.is_available ? '#16a34a' : (isDark ? '#4b5563' : '#d1d5db') }}>
                                    <span style={{ ...s.toggleThumb, left: form.is_available ? 22 : 3 }}></span>
                                </button>
                                <span style={{ fontSize: 13, fontWeight: 600, color: form.is_available ? '#16a34a' : colors.textMuted }}>
                                    {form.is_available ? 'Available' : 'Not Available'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" disabled={submitting} style={s.heroCta}
                                    onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                    onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                    {submitting ? 'Saving...' : editProperty ? 'Update Property' : 'Add Property'}
                                </button>
                                <button type="button" onClick={handleCancel} style={s.cancelBtn}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══════════ DELETE CONFIRM MODAL ═══════════ */}
                {deleteConfirm && (
                    <div style={s.overlay}>
                        <div style={s.modal}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.textHeading, margin: '0 0 8px', fontFamily: "'Merriweather', serif" }}>Delete Property?</h3>
                            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
                                Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => handleDelete(deleteConfirm.id)}
                                    style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                    Yes, Delete
                                </button>
                                <button onClick={() => setDeleteConfirm(null)}
                                    style={{ ...s.cancelBtn, flex: 1 }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════ PROPERTY GRID ═══════════ */}
                {displayed.length === 0 && !showForm ? (
                    <div style={{ ...s.card, padding: '64px 24px', textAlign: 'center', marginBottom: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🏠</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 8, fontFamily: "'Merriweather', serif" }}>
                            {filter !== 'all' ? `No ${filter} properties` : 'No properties yet'}
                        </h3>
                        <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
                            {filter !== 'all' ? 'Try a different filter.' : 'Add your first property to get started.'}
                        </p>
                        {filter === 'all' && (
                            <button onClick={() => setShowForm(true)} style={s.heroCta}
                                onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                + Add Your First Property
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={s.propGrid}>
                        {displayed.map((prop, i) => (
                            <div key={prop.id} style={s.propCard}>
                                {/* Image with price + status */}
                                <div style={s.propImgWrap}>
                                    <img src={PROP_IMAGES[i % PROP_IMAGES.length]} alt={prop.title} style={s.propImg}
                                        onError={e => { e.target.style.display = 'none'; }} />
                                    <span style={{
                                        ...s.statusBadge,
                                        background: prop.is_available ? '#16a34a' : '#2563eb',
                                    }}>
                                        {prop.is_available ? 'AVAILABLE' : 'OCCUPIED'}
                                    </span>
                                    <span style={s.priceTag}>
                                        ₹{parseFloat(prop.rent_amount).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Body */}
                                <div style={s.propBody}>
                                    <h3 style={s.propTitle}>{prop.title}</h3>
                                    <p style={s.propAddr}>📍 {prop.address}{prop.city ? `, ${prop.city}` : ''}</p>

                                    {/* Meta row */}
                                    <div style={s.metaRow}>
                                        <div style={s.metaBlock}>
                                            <p style={s.metaLabel}>BEDS</p>
                                            <p style={s.metaValue}>{prop.bedrooms || '—'}</p>
                                        </div>
                                        <div style={s.metaBlock}>
                                            <p style={s.metaLabel}>BATHS</p>
                                            <p style={s.metaValue}>{prop.bathrooms || '—'}</p>
                                        </div>
                                        <div style={s.metaBlock}>
                                            <p style={s.metaLabel}>SQ FT</p>
                                            <p style={s.metaValue}>{prop.area || '—'}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={s.actionRow}>
                                        <button onClick={() => handleEdit(prop)} style={s.quickViewBtn}
                                            onMouseEnter={e => e.currentTarget.style.background = isDark ? colors.cardBgElevated : '#e5e7eb'}
                                            onMouseLeave={e => e.currentTarget.style.background = isDark ? colors.surfaceBg : '#f3f4f6'}>
                                            Quick View
                                        </button>
                                        <button onClick={() => handleEdit(prop)} style={s.manageBtn}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = colors.accent}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
                                            Manage
                                        </button>
                                        <button onClick={() => setDeleteConfirm(prop)} style={s.moreBtn}>⋮</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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

        heroSection: { padding: '48px 0 20px' },
        heroTitle: { fontSize: 44, fontWeight: 800, color: c.textHeading, letterSpacing: '-1px', margin: '0 0 14px', fontFamily: "'Merriweather', Georgia, serif", fontStyle: 'italic' },
        heroSub: { fontSize: 14, color: c.textSecondary, lineHeight: 1.8, margin: 0 },

        statsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 24px', borderBottom: `1px solid ${c.border}`, marginBottom: 20, flexWrap: 'wrap', gap: 16 },
        inlineStatLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' },
        inlineStatValue: { fontSize: 30, fontWeight: 800, color: c.textPrimary, margin: 0, lineHeight: 1, fontFamily: "'Merriweather', serif" },

        heroCta: { background: c.accent, color: '#fff', border: 'none', padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },
        cancelBtn: { background: 'transparent', color: c.textSecondary, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },

        controlsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
        tabBtn: { fontSize: 12, padding: '9px 18px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' },

        searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: isDark ? c.inputBg : '#f9fafb', border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px' },
        searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: c.textPrimary, width: 180, fontFamily: 'inherit' },
        sortBtn: { fontSize: 12, fontWeight: 600, padding: '9px 16px', borderRadius: 8, border: `1px solid ${c.border}`, background: isDark ? c.cardBg : '#fff', color: c.textSecondary, cursor: 'pointer', transition: 'all 0.15s' },

        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },

        propGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 56 },
        propCard: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s' },
        propImgWrap: { position: 'relative', height: 220, overflow: 'hidden' },
        propImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        statusBadge: { position: 'absolute', top: 14, left: 14, color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: '0.06em' },
        priceTag: {
            position: 'absolute', bottom: 14, right: 14, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
            color: c.accent, fontSize: 16, fontWeight: 800, padding: '8px 14px', borderRadius: 10,
            fontFamily: "'Merriweather', serif", boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },

        propBody: { padding: '18px 20px 20px' },
        propTitle: { fontSize: 16, fontWeight: 700, color: c.textPrimary, margin: '0 0 4px', fontFamily: "'Merriweather', serif" },
        propAddr: { fontSize: 12, color: c.textSecondary, margin: '0 0 14px' },

        metaRow: { display: 'flex', gap: 20, paddingBottom: 14, borderBottom: `1px solid ${c.borderLight}`, marginBottom: 14 },
        metaBlock: { textAlign: 'left' },
        metaLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' },
        metaValue: { fontSize: 15, fontWeight: 700, color: c.textPrimary, margin: 0 },

        actionRow: { display: 'flex', gap: 8, alignItems: 'center' },
        quickViewBtn: {
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
            background: isDark ? c.surfaceBg : '#f3f4f6', color: c.textPrimary,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        },
        manageBtn: {
            flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${c.border}`,
            background: 'transparent', color: c.textPrimary,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        },
        moreBtn: {
            width: 38, height: 38, borderRadius: 8, border: 'none',
            background: 'transparent', color: c.textMuted, fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        },

        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
        modal: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16, padding: 28, maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },

        formLabel: { display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
        formInput: { width: '100%', border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: c.textPrimary, background: c.inputBg, outline: 'none', fontFamily: 'inherit' },
        toggleTrack: { position: 'relative', width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', border: 'none' },
        toggleThumb: { position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' },

        /* Footer */
        footerSection: { borderTop: `1px solid ${c.border}`, paddingTop: 48, marginTop: 24 },
        footerGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: 32, marginBottom: 32 },
        footerColTitle: { fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' },
        footerLink: { fontSize: 13, color: c.textSecondary, margin: '0 0 8px', cursor: 'pointer' },
        footerBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 28, borderTop: `1px solid ${c.border}`, fontSize: 10, color: c.textMuted, letterSpacing: '0.04em' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}