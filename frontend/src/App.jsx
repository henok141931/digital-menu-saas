import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerMenu from './CustomerMenu';
import Login from './Login';
import AdminPanel from './AdminPanel';
import SuperAdminDashboard from './SuperAdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/:slug" element={<CustomerMenu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/super-admin" element={<SuperAdminDashboard />} />
    </Routes>
  );
}

export default App;