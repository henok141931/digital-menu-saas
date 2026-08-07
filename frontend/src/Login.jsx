import { BASE_URL } from './config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Just reuse some existing styles

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store JWT and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('restaurantId', data.restaurantId);
      localStorage.setItem('role', data.role);

      // Only allow ADMIN and SUPER_ADMIN
      if (data.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        throw new Error('Access denied: Admins only');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="menu-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingBottom: '0' }}>
      
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)' }}>
            Admin Login
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Sign in to manage your menu</p>
        </header>

        {error && <div className="status error" style={{ width: '100%', marginBottom: '24px' }}>{error}</div>}

        <form className="admin-form" onSubmit={handleLogin}>
          <input
            type="text"
            className="admin-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="admin-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="add-btn primary" 
            disabled={isLoading}
            style={{ padding: '14px', fontSize: '16px', marginTop: '8px', width: '100%' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
      
    </div>
  );
}

export default Login;
