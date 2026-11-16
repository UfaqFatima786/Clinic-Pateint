import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth, homePath } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import MyAppointments from './pages/MyAppointments.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AppointmentRequests from './pages/AppointmentRequests.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import AllAppointments from './pages/AllAppointments.jsx';

export default function App() {
  const { user } = useAuth();

  const guard = (roles, el) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={user ? homePath(user.role) : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to={homePath(user.role)} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={homePath(user.role)} replace /> : <Register />} />

          <Route path="/patient" element={guard(['patient'], <PatientDashboard />)} />
          <Route path="/patient/book" element={guard(['patient'], <BookAppointment />)} />
          <Route path="/patient/appointments" element={guard(['patient'], <MyAppointments />)} />

          <Route path="/doctor" element={guard(['doctor'], <DoctorDashboard />)} />
          <Route path="/doctor/requests" element={guard(['doctor'], <AppointmentRequests />)} />

          <Route path="/admin" element={guard(['admin'], <AdminDashboard />)} />
          <Route path="/admin/users" element={guard(['admin'], <ManageUsers />)} />
          <Route path="/admin/appointments" element={guard(['admin'], <AllAppointments />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
