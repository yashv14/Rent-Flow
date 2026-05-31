import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API from '../../services/api';

export default function TenantRentPage() {
    const { isDark, colors } = useTheme();
    const [rentRecords, setRentRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const fetchRent = async () => {
        try {
            const res = await API.get('/rent/my');
            setRentRecords(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError('Failed to load rent records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRent(); }, []);

    const handlePay = async (id) => {
        setPaying(id);
        setError('');
        setSuccess('');
        try {
            await API.put(`/rent/${id}/pay`);
            setSuccess('Rent marked as paid successfully!');
            fetchRent();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark as paid');
        } finally {
            setPaying(null);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
    }) : '—';

    const isOverdue = (dueDate, isPaid) => !isPaid && new Date(dueDate) < new Date();

    // Computed
    const totalPaid = rentRecords.filter(r => r.is_paid).reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalDue = rentRecords.filter(r => !r.is_paid).reduce((s, r) => s + parseFloat(r.amount), 0);
    const paidCount = rentRecords.filter(r => r.is_paid).length;
    const unpaidCount = rentRecords.filter(r => !r.is_paid).length;
    const overdueCount = rentRecords.filter(r => isOverdue(r.due_date, r.is_paid)).length;

    let displayed = filter === 'all' ? rentRecords
        : filter === 'paid' ? rentRecords.filter(r => r.is_paid)
            : rentRecords.filter(r => !r.is_paid);

    if (search) {
        displayed = displayed.filter(r =>
            (r.property_title || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.landlord_name || '').toLowerCase().includes(search.toLowerCase()));
    }

    const s = makeStyles(colors, isDark);

    if (loading) {
        return (
            <div style={s.page}><Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={s.spinner}></div>
                        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Loading rent records...</p>
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
                        <h1 style={s.heroTitle}>My Rent</h1>
                        <p style={s.heroSub}>Track your rent payments and payment history across all your properties.</p>
                    </div>
                </div>

                {/* ═══════════ STAT CARDS ═══════════ */}
                <div style={s.statsGrid}>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>TOTAL RECORDS</p>
                        <p style={s.statValue}>{rentRecords.length}</p>
                        <p style={{ fontSize: 11, color: colors.textMuted, margin: '6px 0 0' }}>All rent entries</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={{ ...s.statLabel, color: '#16a34a' }}>TOTAL PAID</p>
                        <p style={{ ...s.statValue, fontSize: 28 }}>₹{totalPaid.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: 11, color: '#16a34a', margin: '6px 0 0', fontWeight: 500 }}>✓ {paidCount} payments</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={{ ...s.statLabel, color: '#dc2626' }}>TOTAL DUE</p>
                        <p style={{ ...s.statValue, fontSize: 28 }}>₹{totalDue.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: 11, color: overdueCount > 0 ? '#dc2626' : colors.textMuted, margin: '6px 0 0', fontWeight: overdueCount > 0 ? 600 : 400 }}>
                            {overdueCount > 0 ? `⚠ ${overdueCount} overdue` : `${unpaidCount} pending`}
                        </p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>PAYMENT RATE</p>
                        <p style={s.statValue}>
                            {rentRecords.length > 0 ? Math.round((paidCount / rentRecords.length) * 100) : 0}%
                        </p>
                        <p style={{ fontSize: 11, color: colors.accent, margin: '6px 0 0', fontWeight: 500 }}>On-time completion</p>
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

                {/* ═══════════ RENT TABLE ═══════════ */}
                <div style={{ ...s.card, marginBottom: 48 }}>
                    {/* Table Header */}
                    <div style={{ padding: '22px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.textHeading, margin: 0, fontFamily: "'Merriweather', serif" }}>Payment History</h2>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={s.searchWrap}>
                                <span style={{ color: colors.textMuted, fontSize: 14 }}>🔍</span>
                                <input type="text" placeholder="Search property..." value={search}
                                    onChange={e => setSearch(e.target.value)} style={s.searchInput} />
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {['all', 'paid', 'unpaid'].map(tab => (
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
                            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>💰</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 8, fontFamily: "'Merriweather', serif" }}>
                                {filter !== 'all' ? `No ${filter} records` : 'No rent records'}
                            </h3>
                            <p style={{ fontSize: 13, color: colors.textMuted }}>
                                {filter !== 'all' ? 'Try a different filter.' : 'Your landlord will create rent records for you.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Column Headers */}
                            <div style={s.tHeaderRow}>
                                <span style={{ ...s.tHeaderCell, flex: 2.2 }}>PROPERTY & LANDLORD</span>
                                <span style={{ ...s.tHeaderCell, flex: 1 }}>AMOUNT</span>
                                <span style={{ ...s.tHeaderCell, flex: 1.2 }}>DUE DATE</span>
                                <span style={{ ...s.tHeaderCell, flex: 1.2 }}>PAID ON</span>
                                <span style={{ ...s.tHeaderCell, flex: 0.8 }}>STATUS</span>
                                <span style={{ ...s.tHeaderCell, flex: 0.8, textAlign: 'right' }}>ACTION</span>
                            </div>

                            {/* Rows */}
                            {displayed.map((r) => {
                                const overdue = isOverdue(r.due_date, r.is_paid);
                                const initials = (r.landlord_name || '??').split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
                                const statusInfo = r.is_paid
                                    ? { label: 'Paid', color: '#16a34a', bg: isDark ? 'rgba(22,163,74,0.12)' : '#dcfce7' }
                                    : overdue
                                        ? { label: 'Overdue', color: '#dc2626', bg: isDark ? 'rgba(220,38,38,0.12)' : '#fee2e2' }
                                        : { label: 'Unpaid', color: '#ca8a04', bg: isDark ? 'rgba(202,138,4,0.12)' : '#fef9c3' };

                                return (
                                    <div key={r.id} style={s.tBodyRow}>
                                        {/* Property & Landlord */}
                                        <div style={{ flex: 2.2, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                ...s.avatar,
                                                background: r.is_paid ? (isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7') :
                                                    overdue ? (isDark ? 'rgba(220,38,38,0.15)' : '#fee2e2') :
                                                        (isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff'),
                                                color: r.is_paid ? '#16a34a' : overdue ? '#dc2626' : colors.accent,
                                            }}>{initials}</div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>{r.property_title}</p>
                                                <p style={{ fontSize: 11, color: colors.textMuted, margin: '2px 0 0' }}>{r.landlord_name}</p>
                                            </div>
                                        </div>
                                        {/* Amount */}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: colors.accent, margin: 0, fontFamily: "'Merriweather', serif" }}>
                                                ₹{parseFloat(r.amount).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        {/* Due Date */}
                                        <div style={{ flex: 1.2 }}>
                                            <p style={{ fontSize: 13, color: overdue ? '#dc2626' : colors.textSecondary, fontWeight: overdue ? 600 : 400, margin: 0 }}>
                                                {formatDate(r.due_date)}
                                            </p>
                                        </div>
                                        {/* Paid On */}
                                        <div style={{ flex: 1.2 }}>
                                            <p style={{ fontSize: 13, color: r.paid_on ? colors.textSecondary : colors.textMuted, margin: 0 }}>
                                                {r.paid_on ? formatDate(r.paid_on) : '—'}
                                            </p>
                                        </div>
                                        {/* Status */}
                                        <div style={{ flex: 0.8 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                                                background: statusInfo.bg, color: statusInfo.color,
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color }}></span>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        {/* Action */}
                                        <div style={{ flex: 0.8, textAlign: 'right' }}>
                                            {!r.is_paid ? (
                                                <button onClick={() => handlePay(r.id)} disabled={paying === r.id}
                                                    style={s.payBtn}
                                                    onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                                    onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                                    {paying === r.id ? '...' : 'Mark Paid'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: 12, color: colors.textMuted }}>—</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Pagination Row */}
                    {displayed.length > 0 && (
                        <div style={s.paginationRow}>
                            <span style={{ fontSize: 12, color: colors.textMuted }}>
                                Showing <strong>{displayed.length}</strong> of <strong>{rentRecords.length}</strong> records
                            </span>
                            <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 11, color: colors.textMuted, margin: '0 0 2px' }}>Collected</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', margin: 0, fontFamily: "'Merriweather', serif" }}>₹{totalPaid.toLocaleString('en-IN')}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 11, color: colors.textMuted, margin: '0 0 2px' }}>Outstanding</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', margin: 0, fontFamily: "'Merriweather', serif" }}>₹{totalDue.toLocaleString('en-IN')}</p>
                                </div>
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

        heroSection: { padding: '36px 0 28px' },
        heroTitle: { fontSize: 32, fontWeight: 800, color: c.textHeading, letterSpacing: '-0.5px', margin: '0 0 6px', fontFamily: "'Merriweather', Georgia, serif" },
        heroSub: { fontSize: 14, color: c.textSecondary, margin: 0 },

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

        payBtn: {
            background: c.accent, color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s', letterSpacing: '0.04em',
        },

        paginationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px' },

        footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: '24px 0 32px', borderTop: `1px solid ${c.border}`, fontSize: 11, color: c.textMuted, letterSpacing: '0.04em' },
        footerLink: { cursor: 'pointer', color: c.textSecondary, fontWeight: 600, fontSize: 11, letterSpacing: '0.06em' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}