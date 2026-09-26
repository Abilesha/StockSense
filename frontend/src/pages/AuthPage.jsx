import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { KeyRound, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthPage({ setToast }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@stocksense.app');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setToast({ type: 'success', message: 'Logged in successfully! Welcome to StockSense.' });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      setToast({ type: 'success', message: 'Account created! Welcome to StockSense.' });
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setOtp(res.data.otp); // Pre-fill generated OTP for seamless demo testing!
      setMode('reset');
      setToast({
        type: 'info',
        title: 'OTP Generated',
        message: `A 6-digit OTP code has been issued for ${email}. (Demo Code: ${res.data.otp})`,
      });
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.resetPassword(email, otp, newPassword);
      setToast({ type: 'success', message: 'Password reset successful! Please log in with your new password.' });
      setPassword(newPassword);
      setMode('login');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, var(--panel2) 0%, var(--bg) 80%)',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border2)',
          padding: '32px 28px',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '20px',
            }}
          >
            S
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>StockSense</h1>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Enterprise Inventory Management</p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '13px',
              color: 'var(--red)',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => { setError(''); setMode('forgot'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer' }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setMode('signup'); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="input"
                placeholder="Jordan Lee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="jordan@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password (Min. 6 chars)</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Creating...' : 'Register'}
              <ArrowRight size={16} />
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setMode('login'); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter your registered email address. We will generate a secure one-time password (OTP) code.
            </p>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Generating OTP...' : 'Send OTP Code'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setError(''); setMode('login'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD WITH OTP */}
        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: 'var(--accent)',
                marginBottom: '16px',
              }}
            >
              Enter the 6-digit OTP code sent for <strong>{email}</strong>.
            </div>

            <div className="form-group">
              <label>6-Digit OTP Code</label>
              <input
                className="input mono"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Updating Password...' : 'Verify OTP & Reset'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setError(''); setMode('login'); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
