// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App


// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// // import { AuthProvider, useAuth } from './context/AuthContext';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import LoginPage from './pages/LoginPage';
// import LandlordDashboard from './pages/LandlordDashboard';
// import TenantDashboard from './pages/TenantDashboard';
// import AdminDashboard from './pages/AdminDashboard';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>;
//   if (!user) return <Navigate to="/login" />;
//   if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
//   return children;
// };

// function AppRoutes() {
//   const { user } = useAuth();
//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/landlord" element={
//         <ProtectedRoute allowedRoles={['landlord']}>
//           <LandlordDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="/tenant" element={
//         <ProtectedRoute allowedRoles={['tenant']}>
//           <TenantDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="/admin" element={
//         <ProtectedRoute allowedRoles={['admin']}>
//           <AdminDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="*" element={<Navigate to="/login" />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <AppRoutes />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import LoginPage from './pages/LoginPage';
// import LandlordDashboard from './pages/LandlordDashboard';
// import PropertiesPage from './pages/landlord/PropertiesPage';
// import TenantDashboard from './pages/TenantDashboard';
// import AdminDashboard from './pages/AdminDashboard';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user, loading } = useAuth();
//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
//       Loading...
//     </div>
//   );
//   if (!user) return <Navigate to="/login" />;
//   if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
//   return children;
// };

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />

//       {/* Landlord routes */}
//       <Route path="/landlord" element={
//         <ProtectedRoute allowedRoles={['landlord']}>
//           <LandlordDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="/landlord/*" element={
//         <ProtectedRoute allowedRoles={['landlord']}>
//           <LandlordDashboard />
//         </ProtectedRoute>
//       } />

//       {/* Tenant routes */}
//       <Route path="/tenant" element={
//         <ProtectedRoute allowedRoles={['tenant']}>
//           <TenantDashboard />
//         </ProtectedRoute>
//       } />

//       {/* Admin routes */}
//       <Route path="/admin" element={
//         <ProtectedRoute allowedRoles={['admin']}>
//           <AdminDashboard />
//         </ProtectedRoute>
//       } />

//       <Route path="*" element={<Navigate to="/login" />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <AppRoutes />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandlordDashboard from './pages/LandlordDashboard';
import PropertiesPage from './pages/landlord/PropertiesPage';
import BookingsPage from './pages/landlord/BookingsPage';
import RentPage from './pages/landlord/RentPage';
import NoticesPage from './pages/landlord/NoticesPage';

import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantPropertiesPage from './pages/tenant/TenantPropertiesPage';
import TenantBookingsPage from './pages/tenant/TenantBookingsPage';
import TenantRentPage from './pages/tenant/TenantRentPage';
import TenantNoticesPage from './pages/tenant/TenantNoticesPage';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Landlord routes */}
      <Route path="/landlord" element={
        <ProtectedRoute allowedRoles={['landlord']}>
          <LandlordDashboard />
        </ProtectedRoute>
      } />
      <Route path="/landlord/properties" element={
        <ProtectedRoute allowedRoles={['landlord']}>
          <PropertiesPage />
        </ProtectedRoute>
      } />

      <Route path="/landlord/bookings" element={
        <ProtectedRoute allowedRoles={['landlord']}>
          <BookingsPage />
        </ProtectedRoute>
      } />

      <Route path="/landlord/rent" element={
        <ProtectedRoute allowedRoles={['landlord']}>
          <RentPage />
        </ProtectedRoute>
      } />

      <Route path="/landlord/notices" element={
        <ProtectedRoute allowedRoles={['landlord']}>
          <NoticesPage />
        </ProtectedRoute>
      } />

      {/* Tenant routes */}
      <Route path="/tenant" element={
        <ProtectedRoute allowedRoles={['tenant']}>
          <TenantDashboard />
        </ProtectedRoute>
      } />

      <Route path="/tenant/properties" element={<ProtectedRoute allowedRoles={['tenant']}><TenantPropertiesPage /></ProtectedRoute>} />
      <Route path="/tenant/bookings" element={<ProtectedRoute allowedRoles={['tenant']}><TenantBookingsPage /></ProtectedRoute>} />
      <Route path="/tenant/rent" element={<ProtectedRoute allowedRoles={['tenant']}><TenantRentPage /></ProtectedRoute>} />
      <Route path="/tenant/notices" element={<ProtectedRoute allowedRoles={['tenant']}><TenantNoticesPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}