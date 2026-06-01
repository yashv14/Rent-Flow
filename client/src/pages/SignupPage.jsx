import { useState } from 'react';
import buildingImg from '../assets/building.jpg';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Logo from '../components/Logo';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('tenant');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await API.post('/auth/register', { name, email, password, role, phone });
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Left Panel */}
            <div
                className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative"
                style={{
                    backgroundImage: `url(${buildingImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark overlay so text stays readable */}
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

                {/* All content sits above the overlay */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <Logo white size={22} />
                    </div>
                </div>

                <div className="relative z-10">
                    <h1 className="font-serif text-white text-4xl font-black leading-tight mb-4">
                        Join the<br />RentFlow<br />Community.
                    </h1>
                    <p className="text-gray-200 text-sm leading-relaxed max-w-sm">
                        Create your account and start managing properties, bookings, and rent payments with ease.
                    </p>
                </div>

                <div className="relative z-10 flex gap-8">
                    <div>
                        <div className="font-serif text-white text-2xl font-black">500+</div>
                        <div className="text-gray-300 text-xs mt-1 uppercase tracking-wider">Properties</div>
                    </div>
                    <div>
                        <div className="font-serif text-white text-2xl font-black">1200+</div>
                        <div className="text-gray-300 text-xs mt-1 uppercase tracking-wider">Tenants</div>
                    </div>
                    <div>
                        <div className="font-serif text-white text-2xl font-black">98%</div>
                        <div className="text-gray-300 text-xs mt-1 uppercase tracking-wider">Satisfaction</div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <Logo size={22} />
                    </div>

                    <div className="mb-8">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Get Started</p>
                        <h2 className="font-serif text-3xl font-black text-gray-900 leading-tight">Create your<br />account</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-6">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Phone (Optional)
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Role
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'tenant', label: 'Tenant', desc: 'Looking to rent' },
                                    { value: 'landlord', label: 'Landlord', desc: 'Managing properties' },
                                ].map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRole(r.value)}
                                        className={`border rounded-lg py-3 px-4 text-left transition-all ${
                                            role === r.value
                                                ? 'border-primary bg-blue-50 text-primary'
                                                : 'border-border bg-white text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="text-sm font-semibold">{r.label}</div>
                                        <div className="text-xs mt-0.5 opacity-70">{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-3 rounded-lg text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
