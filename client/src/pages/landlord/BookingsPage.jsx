import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import API from '../../services/api';

const PER_PAGE = 4;

export default function BookingsPage() {
    const { isDark, colors } = useTheme();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [updating, setUpdating] = useState(null);
    const [page, setPage] = useState(1);

    const fetchBookings = async () => {
        try {
            const res = await API.get('/bookings/all');
            setBookings(res.data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleStatus = async (id, status) => {
        setUpdating(id);
        setError('');
        setSuccess('');
        try {
            await API.put(`/bookings/${id}`, { status });
            setSuccess(`Booking ${status} successfully!`);
            fetchBookings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking');
        } finally {
            setUpdating(null);
        }
    };

    const filtered = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // Reset to page 1 when filter changes
    useEffect(() => { setPage(1); }, [filter]);

    const counts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        approved: bookings.filter(b => b.status === 'approved').length,
        rejected: bookings.filter(b => b.status === 'rejected').length,
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    }) : '—';

    const s = makeStyles(colors, isDark);

    if (loading) {
        return (
            <div style={s.page}>
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={s.spinner}></div>
                        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Loading bookings...</p>
                    </div>
                </div>
                <style>{spinnerCSS}</style>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <Navbar />
            <style>{spinnerCSS}</style>

            <div style={s.container}>

                {/* ═══════════ HERO HEADER ═══════════ */}
                <div style={s.heroSection}>
                    <div style={{ flex: 1 }}>
                        <h1 style={s.heroTitle}>Booking Requests</h1>
                        <p style={s.heroSub}>Review and manage upcoming lease applications for your portfolio.</p>
                    </div>
                    <div style={s.statCardsRow}>
                        {[
                            { label: 'TOTAL', value: counts.all, color: colors.textPrimary },
                            { label: 'PENDING', value: counts.pending, color: '#ca8a04' },
                            { label: 'APPROVED', value: counts.approved, color: '#16a34a' },
                            { label: 'REJECTED', value: counts.rejected, color: '#dc2626' },
                        ].map(st => (
                            <div key={st.label} style={s.miniStat}>
                                <p style={{ ...s.miniStatLabel, color: st.color }}>{st.label}</p>
                                <p style={{ ...s.miniStatValue, color: st.color }}>{st.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══════════ MESSAGES ═══════════ */}
                {success && (
                    <div style={{ background: isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', border: `1px solid ${isDark ? 'rgba(22,163,74,0.25)' : '#bbf7d0'}`, color: '#16a34a', fontSize: 13, padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                        {success}
                    </div>
                )}
                {error && (
                    <div style={{ background: isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(220,38,38,0.25)' : '#fecaca'}`, color: '#dc2626', fontSize: 13, padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {/* ═══════════ FILTER TABS ═══════════ */}
                <div style={s.tabRow}>
                    {['all', 'pending', 'approved', 'rejected'].map(tab => (
                        <button key={tab} onClick={() => setFilter(tab)}
                            style={{
                                ...s.tab,
                                color: filter === tab ? colors.textPrimary : colors.textMuted,
                                borderBottom: filter === tab ? `2px solid ${colors.accent}` : '2px solid transparent',
                                fontWeight: filter === tab ? 700 : 500,
                            }}>
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* ═══════════ TABLE ═══════════ */}
                <div style={s.tableCard}>
                    {filtered.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📋</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 8, fontFamily: "'Merriweather', serif" }}>
                                No {filter === 'all' ? '' : filter} bookings
                            </h3>
                            <p style={{ fontSize: 13, color: colors.textMuted }}>
                                {filter === 'pending'
                                    ? 'No pending booking requests right now.'
                                    : 'No bookings found for this filter.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header Row */}
                            <div style={s.headerRow}>
                                <span style={{ ...s.headerCell, flex: 2.2 }}>TENANT</span>
                                <span style={{ ...s.headerCell, flex: 2 }}>PROPERTY</span>
                                <span style={{ ...s.headerCell, flex: 1.5 }}>DATES</span>
                                <span style={{ ...s.headerCell, flex: 1, textAlign: 'center' }}>STATUS</span>
                                <span style={{ ...s.headerCell, flex: 1, textAlign: 'right' }}>ACTIONS</span>
                            </div>

                            {/* Body Rows */}
                            {paginated.map((b) => (
                                <div key={b.id} style={s.bodyRow}>
                                    {/* Tenant */}
                                    <div style={{ flex: 2.2, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={s.avatar}>{b.tenant_name?.charAt(0)?.toUpperCase()}</div>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>{b.tenant_name}</p>
                                            <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>{b.tenant_email}</p>
                                        </div>
                                    </div>

                                    {/* Property */}
                                    <div style={{ flex: 2 }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>{b.property_title}</p>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '2px 0 0' }}>
                                            {b.property_address || 'Property Unit'}
                                        </p>
                                    </div>

                                    {/* Dates */}
                                    <div style={{ flex: 1.5 }}>
                                        <p style={{ fontSize: 12, color: colors.textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ fontSize: 11, opacity: 0.5 }}>📅</span> {formatDate(b.start_date)}
                                        </p>
                                        <p style={{ fontSize: 12, color: colors.textMuted, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ fontSize: 11, opacity: 0.5 }}>→</span> {formatDate(b.end_date)}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <span style={{
                                            ...s.statusBadge,
                                            ...(b.status === 'pending' ? s.statusPending :
                                                b.status === 'approved' ? s.statusApproved : s.statusRejected),
                                        }}>
                                            {b.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                        {b.status === 'pending' ? (
                                            <>
                                                <button onClick={() => handleStatus(b.id, 'approved')} disabled={updating === b.id}
                                                    style={s.approveBtn}
                                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(22,163,74,0.2)' : '#dcfce7'}
                                                    onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4'}>
                                                    {updating === b.id ? '...' : '✓'}
                                                </button>
                                                <button onClick={() => handleStatus(b.id, 'rejected')} disabled={updating === b.id}
                                                    style={s.rejectBtn}
                                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(220,38,38,0.2)' : '#fee2e2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2'}>
                                                    {updating === b.id ? '...' : '✕'}
                                                </button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: 18, color: colors.textMuted, cursor: 'default' }}>
                                                {b.status === 'approved' ? '⋮' : '⟲'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* ═══════════ PAGINATION ═══════════ */}
                {filtered.length > 0 && (
                    <div style={s.paginationRow}>
                        <span style={{ fontSize: 12, color: colors.textMuted }}>
                            Showing <strong style={{ color: colors.accent }}>{paginated.length}</strong> of <strong style={{ color: colors.accent }}>{filtered.length}</strong> applications
                        </span>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                style={{ ...s.pageBtn, opacity: page === 1 ? 0.3 : 1 }}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    style={{
                                        ...s.pageBtn,
                                        background: p === page ? colors.accent : 'transparent',
                                        color: p === page ? '#fff' : colors.textSecondary,
                                        fontWeight: p === page ? 700 : 500,
                                    }}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                style={{ ...s.pageBtn, opacity: page === totalPages ? 0.3 : 1 }}>›</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


/* ═══════════ STYLES FACTORY ═══════════ */

const spinnerCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;

function makeStyles(c, isDark) {
    return {
        page: { minHeight: '100vh', background: c.pageBg, fontFamily: "'Inter', 'Open Sans', sans-serif", transition: 'background 0.3s' },
        container: { maxWidth: 1440, margin: '0 auto', padding: '0 48px 40px' },

        /* Hero */
        heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '36px 0 28px', flexWrap: 'wrap', gap: 20 },
        heroTitle: { fontSize: 36, fontWeight: 800, color: c.textHeading, letterSpacing: '-0.5px', margin: '0 0 8px', lineHeight: 1.15, fontFamily: "'Merriweather', Georgia, serif" },
        heroSub: { fontSize: 14, color: c.textSecondary, lineHeight: 1.7, margin: 0 },

        /* Mini stat cards */
        statCardsRow: { display: 'flex', gap: 12 },
        miniStat: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '10px 18px', minWidth: 90, textAlign: 'center', transition: 'all 0.3s' },
        miniStatLabel: { fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 4px', textTransform: 'uppercase' },
        miniStatValue: { fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1, fontFamily: "'Merriweather', serif" },

        /* Filter tabs */
        tabRow: { display: 'flex', gap: 24, marginBottom: 20, borderBottom: `1px solid ${c.border}`, paddingBottom: 0 },
        tab: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, letterSpacing: '0.06em', padding: '10px 4px', transition: 'all 0.15s' },

        /* Table card */
        tableCard: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },
        headerRow: { display: 'flex', alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${c.border}` },
        headerCell: { fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' },
        bodyRow: { display: 'flex', alignItems: 'center', padding: '18px 28px', borderBottom: `1px solid ${c.borderLight}`, transition: 'background 0.15s' },

        /* Avatar */
        avatar: {
            width: 42, height: 42, borderRadius: '50%',
            background: isDark ? 'rgba(59,130,246,0.12)' : '#f3f4f6',
            color: c.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, flexShrink: 0,
        },

        /* Status badges */
        statusBadge: { fontSize: 10, fontWeight: 700, padding: '5px 14px', borderRadius: 20, letterSpacing: '0.04em', display: 'inline-block' },
        statusPending: { background: isDark ? 'rgba(202,138,4,0.12)' : '#fef9c3', color: '#ca8a04' },
        statusApproved: { background: isDark ? 'rgba(22,163,74,0.12)' : '#dcfce7', color: '#16a34a' },
        statusRejected: { background: isDark ? 'rgba(220,38,38,0.12)' : '#fee2e2', color: '#dc2626' },

        /* Action buttons */
        approveBtn: {
            width: 34, height: 34, borderRadius: 8, border: `1px solid ${isDark ? 'rgba(22,163,74,0.3)' : '#bbf7d0'}`,
            background: isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', color: '#16a34a',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        rejectBtn: {
            width: 34, height: 34, borderRadius: 8, border: `1px solid ${isDark ? 'rgba(220,38,38,0.3)' : '#fecaca'}`,
            background: isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2', color: '#dc2626',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
        },

        /* Pagination */
        paginationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '0 4px' },
        pageBtn: {
            width: 34, height: 34, borderRadius: 8, border: `1px solid ${c.border}`,
            background: 'transparent', color: c.textSecondary,
            fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}