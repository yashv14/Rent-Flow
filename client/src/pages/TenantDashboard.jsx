// import Navbar from '../components/Navbar';
// import { useAuth } from '../context/AuthContext';

// export default function TenantDashboard() {
//     const { user } = useAuth();
//     return (
//         <div className="min-h-screen bg-surface">
//             <Navbar />
//             <div className="p-8">
//                 <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Tenant Portal</p>
//                 <h1 className="font-serif text-3xl font-black text-gray-900">
//                     Welcome, {user?.name} 👋
//                 </h1>
//                 <p className="text-gray-400 text-sm mt-2">Day 9 — full dashboard coming next!</p>
//             </div>
//         </div>
//     );
// }
import { Navigate } from 'react-router-dom';
export default function TenantDashboard() {
    return <Navigate to="/tenant" replace />;
}