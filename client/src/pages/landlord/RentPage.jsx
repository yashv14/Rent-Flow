import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API from '../../services/api';

const PER_PAGE = 10;

export default function RentPage() {
    const { isDark, colors } = useTheme();
    const [rentRecords, setRentRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [page, setPage] = useState(1);

    const emptyForm = { tenant_id: '', property_id: '', amount: '', due_date: '' };
    const [form, setForm] = useState(emptyForm);

    const fetchData = async () => {
        try {
            const [rentRes, propsRes] = await Promise.all([
                API.get('/rent/all'),
                API.get('/properties/my'),
            ]);
            setRentRecords(rentRes.data);
            setProperties(propsRes.data);
            const uniqueTenants = [];
            const seen = new Set();
            rentRes.data.forEach(r => {
                if (!seen.has(r.tenant_id)) {
                    seen.add(r.tenant_id);
                    uniqueTenants.push({ id: r.tenant_id, name: r.tenant_name, email: r.tenant_email });
                }
            });
            setTenants(uniqueTenants);
        } catch (err) {
            setError('Failed to load rent records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError(''); setSuccess('');
        try {
            await API.post('/rent', form);
            setSuccess('Rent record created successfully!');
            setShowForm(false); setForm(emptyForm); fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create rent record');
        } finally { setSubmitting(false); }
    };

    const isOverdue = (d, paid) => !paid && new Date(d) < new Date();

    const filtered = (() => {
        let arr = filter === 'all' ? rentRecords : filter === 'paid' ? rentRecords.filter(r => r.is_paid) : rentRecords.filter(r => !r.is_paid);
        if (search) arr = arr.filter(r =>
            (r.tenant_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.property_title || '').toLowerCase().includes(search.toLowerCase()));
        return arr;
    })();

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    useEffect(() => { setPage(1); }, [filter, search]);

    const totalCollected = rentRecords.filter(r => r.is_paid).reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalPending = rentRecords.filter(r => !r.is_paid).reduce((s, r) => s + parseFloat(r.amount), 0);
    const overdueTotal = rentRecords.filter(r => isOverdue(r.due_date, r.is_paid)).reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalAll = totalCollected + totalPending;
    const paidPct = totalAll > 0 ? Math.round((totalCollected / totalAll) * 100) : 0;

    const paidCount = rentRecords.filter(r => r.is_paid).length;
    const unpaidCount = rentRecords.filter(r => !r.is_paid).length;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    // Monthly data for bar chart (last 6 months)
    const monthlyData = (() => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const m = d.getMonth(), y = d.getFullYear();
            const amt = rentRecords.filter(r => {
                const rd = new Date(r.due_date);
                return rd.getMonth() === m && rd.getFullYear() === y && r.is_paid;
            }).reduce((s, r) => s + parseFloat(r.amount), 0);
            months.push({ label, amount: amt });
        }
        return months;
    })();
    const maxMonthly = Math.max(...monthlyData.map(m => m.amount), 1);

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
                        <h1 style={s.heroTitle}>Rental Income Tracker</h1>
                        <p style={s.heroSub}>Overview of your portfolio's financial performance</p>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
                        style={s.heroCta}
                        onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                        + Create Rent Record
                    </button>
                </div>

                {/* ═══════════ STAT CARDS ═══════════ */}
                <div style={s.statsGrid}>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>TOTAL RECORDS</p>
                        <p style={s.statValue}>{rentRecords.length}</p>
                        <p style={{ fontSize: 11, color: colors.accent, margin: '6px 0 0', fontWeight: 500 }}>↗ 8% from last month</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>PAID COUNT</p>
                        <p style={s.statValue}>{paidCount}</p>
                        <p style={{ fontSize: 11, color: colors.textMuted, margin: '6px 0 0' }}>{paidPct}% collection rate</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>UNPAID COUNT</p>
                        <p style={s.statValue}>{unpaidCount}</p>
                        <p style={{ fontSize: 11, color: colors.textMuted, margin: '6px 0 0' }}>Follow-up scheduled</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={{ ...s.statLabel, color: '#dc2626' }}>TOTAL COLLECTED</p>
                        <p style={{ ...s.statValue, fontSize: 28 }}>₹{totalCollected.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: 11, color: '#16a34a', margin: '6px 0 0', fontWeight: 500 }}>✓ Verified today</p>
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

                {/* ═══════════ CREATE FORM (collapsible) ═══════════ */}
                {showForm && (
                    <div style={{ ...s.card, padding: '24px 28px', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.textHeading, margin: '0 0 20px', fontFamily: "'Merriweather', serif" }}>Create Rent Record</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={s.formLabel}>Select Property</label>
                                    <select value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} required style={s.formInput}>
                                        <option value="">Choose a property...</option>
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={s.formLabel}>Tenant ID</label>
                                    <input type="number" value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} placeholder="Enter tenant user ID" required style={s.formInput} />
                                    {tenants.length > 0 && (
                                        <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                                            Known: {tenants.map(t => `${t.name} (ID: ${t.id})`).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label style={s.formLabel}>Amount (₹)</label>
                                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 8000" required style={s.formInput} />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Due Date</label>
                                    <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required style={s.formInput} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" disabled={submitting} style={s.heroCta}
                                    onMouseEnter={e => e.currentTarget.style.background = colors.accentHover}
                                    onMouseLeave={e => e.currentTarget.style.background = colors.accent}>
                                    {submitting ? 'Creating...' : 'Create Record'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                                    style={{ ...s.filterBtn, padding: '10px 20px' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══════════ REVENUE + COLLECTION ROW ═══════════ */}
                <div style={s.chartsRow}>
                    {/* Revenue Overview Bar Chart */}
                    <div style={{ ...s.card, flex: 1.5, padding: '24px 28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div>
                                <h3 style={s.cardTitle}>Revenue Overview</h3>
                                <p style={{ fontSize: 12, color: colors.textMuted, margin: '2px 0 0' }}>Monthly collection trend</p>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <span style={{ ...s.chartTag, background: colors.accent, color: '#fff' }}>Actual</span>
                                <span style={{ ...s.chartTag, background: isDark ? colors.cardBgElevated : '#f3f4f6', color: colors.textMuted }}>Forecast</span>
                            </div>
                        </div>
                        <div style={s.barChart}>
                            {monthlyData.map((m, i) => (
                                <div key={i} style={s.barCol}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                                        <div style={{
                                            width: '100%',
                                            height: `${Math.max(8, (m.amount / maxMonthly) * 100)}%`,
                                            background: i === monthlyData.length - 1 ? colors.accent : (isDark ? 'rgba(59,130,246,0.18)' : '#dbeafe'),
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.5s',
                                        }}></div>
                                    </div>
                                    <p style={s.barLabel}>{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collection Status Donut */}
                    <div style={{ ...s.card, flex: 1, padding: '24px 28px' }}>
                        <h3 style={s.cardTitle}>Collection Status</h3>
                        <p style={{ fontSize: 12, color: colors.textMuted, margin: '2px 0 0' }}>Current Billing Cycle</p>
                        <div style={s.donutWrap}>
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="56" fill="none" stroke={isDark ? colors.cardBgElevated : '#f3f4f6'} strokeWidth="14" />
                                <circle cx="70" cy="70" r="56" fill="none" stroke={colors.accent} strokeWidth="14"
                                    strokeDasharray={`${paidPct * 3.52} ${352 - paidPct * 3.52}`}
                                    strokeDashoffset="88" strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 0.8s' }} />
                                {overdueTotal > 0 && totalAll > 0 && (
                                    <circle cx="70" cy="70" r="56" fill="none" stroke="#dc2626" strokeWidth="14"
                                        strokeDasharray={`${(overdueTotal / totalAll * 100) * 3.52} ${352}`}
                                        strokeDashoffset={88 - paidPct * 3.52}
                                        strokeLinecap="round" />
                                )}
                            </svg>
                            <div style={s.donutCenter}>
                                <p style={{ fontSize: 28, fontWeight: 800, color: colors.textPrimary, margin: 0, fontFamily: "'Merriweather', serif" }}>{paidPct}%</p>
                                <p style={{ fontSize: 10, color: colors.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>COLLECTED</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { dot: colors.accent, label: 'Paid', value: `₹${totalCollected.toLocaleString('en-IN')}` },
                                { dot: '#dc2626', label: 'Overdue', value: `₹${overdueTotal.toLocaleString('en-IN')}` },
                                { dot: isDark ? '#4b5563' : '#d1d5db', label: 'Pending', value: `₹${(totalPending - overdueTotal).toLocaleString('en-IN')}` },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot }}></div>
                                        <span style={{ fontSize: 13, color: colors.textSecondary }}>{item.label}</span>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, fontFamily: "'Merriweather', serif" }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════════ RENT LEDGER ═══════════ */}
                <div style={{ ...s.card, marginTop: 24 }}>
                    <div style={{ padding: '24px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.textHeading, margin: 0, fontFamily: "'Merriweather', serif" }}>Rent Ledger</h2>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={s.searchWrap}>
                                <span style={{ color: colors.textMuted, fontSize: 14 }}>🔍</span>
                                <input type="text" placeholder="Search tenant..." value={search}
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

                    {filtered.length === 0 ? (
                        <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.4 }}>💰</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 6, fontFamily: "'Merriweather', serif" }}>No rent records</h3>
                            <p style={{ fontSize: 13, color: colors.textMuted }}>Create your first rent record using the button above.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div style={s.tHeaderRow}>
                                <span style={{ ...s.tHeaderCell, flex: 2.5 }}>PROPERTY & TENANT</span>
                                <span style={{ ...s.tHeaderCell, flex: 1 }}>RENT AMOUNT</span>
                                <span style={{ ...s.tHeaderCell, flex: 1.2 }}>DUE DATE</span>
                                <span style={{ ...s.tHeaderCell, flex: 1 }}>STATUS</span>
                                <span style={{ ...s.tHeaderCell, flex: 0.5, textAlign: 'right' }}>ACTIONS</span>
                            </div>

                            {/* Rows */}
                            {paginated.map(r => {
                                const overdue = isOverdue(r.due_date, r.is_paid);
                                const initials = (r.tenant_name || '??').split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
                                const statusInfo = r.is_paid
                                    ? { label: 'Paid', color: '#16a34a', bg: isDark ? 'rgba(22,163,74,0.12)' : '#dcfce7' }
                                    : overdue
                                        ? { label: 'Overdue', color: '#dc2626', bg: isDark ? 'rgba(220,38,38,0.12)' : '#fee2e2' }
                                        : { label: 'Pending', color: '#ca8a04', bg: isDark ? 'rgba(202,138,4,0.12)' : '#fef9c3' };

                                return (
                                    <div key={r.id} style={s.tBodyRow}>
                                        {/* Property & Tenant */}
                                        <div style={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                ...s.avatar,
                                                background: r.is_paid ? (isDark ? 'rgba(22,163,74,0.15)' : '#dcfce7') : overdue ? (isDark ? 'rgba(220,38,38,0.15)' : '#fee2e2') : (isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff'),
                                                color: r.is_paid ? '#16a34a' : overdue ? '#dc2626' : colors.accent,
                                            }}>{initials}</div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                                                    {r.property_title}
                                                </p>
                                                <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>{r.tenant_name}</p>
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
                                        {/* Status */}
                                        <div style={{ flex: 1 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                                background: statusInfo.bg, color: statusInfo.color,
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusInfo.color }}></span>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        {/* Actions */}
                                        <div style={{ flex: 0.5, textAlign: 'right' }}>
                                            <span style={{ fontSize: 18, color: colors.textMuted, cursor: 'default' }}>⋮</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <div style={s.paginationRow}>
                            <span style={{ fontSize: 12, color: colors.textMuted }}>
                                Showing <strong>{(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> entries
                            </span>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ ...s.pageBtn, opacity: page === 1 ? 0.3 : 1 }}>Previous</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(p => (
                                    <button key={p} onClick={() => setPage(p)}
                                        style={{ ...s.pageBtnNum, background: p === page ? colors.accent : 'transparent', color: p === page ? '#fff' : colors.textSecondary }}>
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ ...s.pageBtn, opacity: page === totalPages ? 0.3 : 1 }}>Next</button>
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
        heroCta: { background: c.accent, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' },

        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
        statCard: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.3s' },
        statLabel: { fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' },
        statValue: { fontSize: 32, fontWeight: 800, color: c.textPrimary, margin: 0, lineHeight: 1, fontFamily: "'Merriweather', serif" },

        card: { background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s' },
        cardTitle: { fontSize: 18, fontWeight: 700, color: c.textHeading, margin: 0, fontFamily: "'Merriweather', serif" },

        chartsRow: { display: 'flex', gap: 20-0, alignItems: 'stretch' },
        chartTag: { fontSize: 10, fontWeight: 600, padding: '4px 12px', borderRadius: 16 },

        barChart: { display: 'flex', gap: 8, height: 160, alignItems: 'flex-end', marginBottom: 0 },
        barCol: { flex: 1, display: 'flex', flexDirection: 'column', height: '100%' },
        barLabel: { fontSize: 10, color: c.textMuted, textAlign: 'center', marginTop: 6, fontWeight: 500, letterSpacing: '0.04em' },

        donutWrap: { position: 'relative', display: 'flex', justifyContent: 'center', margin: '24px 0 20px' },
        donutCenter: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },

        searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: isDark ? c.inputBg : '#f9fafb', border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px' },
        searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: c.textPrimary, width: 160, fontFamily: 'inherit' },
        filterBtn: { fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.textSecondary, cursor: 'pointer', transition: 'all 0.15s' },

        tHeaderRow: { display: 'flex', alignItems: 'center', padding: '12px 28px', borderBottom: `1px solid ${c.border}` },
        tHeaderCell: { fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' },
        tBodyRow: { display: 'flex', alignItems: 'center', padding: '16px 28px', borderBottom: `1px solid ${c.borderLight}` },
        avatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },

        paginationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px' },
        pageBtn: { fontSize: 12, fontWeight: 500, color: c.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px' },
        pageBtnNum: { width: 32, height: 32, borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

        formLabel: { display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
        formInput: { width: '100%', border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: c.textPrimary, background: c.inputBg, outline: 'none', fontFamily: 'inherit' },

        footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, padding: '24px 0 32px', borderTop: `1px solid ${c.border}`, fontSize: 11, color: c.textMuted, letterSpacing: '0.04em' },
        footerLink: { cursor: 'pointer', color: c.textSecondary, fontWeight: 600, fontSize: 11, letterSpacing: '0.06em' },

        spinner: { width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
    };
}