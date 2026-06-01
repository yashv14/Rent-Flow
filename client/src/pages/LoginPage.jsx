import { useState } from 'react';
import buildingImg from '../assets/building.jpg';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Logo from '../components/Logo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await API.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);

            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'landlord') navigate('/landlord');
            else navigate('/tenant');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                        Manage Your<br />Properties<br />Smarter.
                    </h1>
                    <p className="text-gray-200 text-sm leading-relaxed max-w-sm">
                        Track rent, approve bookings, and communicate with tenants — all from one professional dashboard.
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
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Welcome Back</p>
                        <h2 className="font-serif text-3xl font-black text-gray-900 leading-tight">Sign in to your<br />account</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-3 rounded-lg text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-xs text-gray-400 text-center mb-3">Quick access for testing</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Admin', email: 'admin@test.com' },
                                { label: 'Landlord', email: 'landlord@test.com' },
                                { label: 'Tenant', email: 'tenant@test.com' },
                            ].map((role) => (
                                <button
                                    key={role.label}
                                    onClick={() => { setEmail(role.email); setPassword('123456'); }}
                                    className="text-xs border border-border rounded-lg py-2 px-3 text-gray-500 hover:border-primary hover:text-primary transition-all bg-white"
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary font-semibold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

