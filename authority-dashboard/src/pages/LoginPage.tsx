import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, Info } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('officer@kumbh.gov.in');
  const [password, setPassword] = useState('officer123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid authority credentials. Check email and password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#071A2D',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #0E2E4B 0%, #071A2D 80%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            backgroundColor: '#123B5D',
            padding: '36px 30px 28px',
            textAlign: 'center',
            color: '#FFFFFF',
            borderBottom: '3px solid #F47C20',
          }}
        >
          {/* Attractive Emblem with warm golden/saffron glow */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 30px rgba(244, 124, 32, 0.4), 0 8px 16px rgba(0,0,0,0.3)',
              border: '3px solid #F47C20',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
            }}
          >
            <img
              src="/assets/kumbh_logo_transparent.png"
              alt="Kumbh Sarthi Official App Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                lineHeight: 1.1,
              }}
            >
              Kumbh
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F47C20',
                lineHeight: 1.1,
              }}
            >
              Sarthi
            </span>
          </div>

          <p
            style={{
              fontSize: '12.5px',
              color: '#F4B942',
              fontWeight: 700,
              marginTop: '6px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Authority Control Center
          </p>
          <p
            style={{
              fontSize: '12px',
              color: '#94A3B8',
              marginTop: '4px',
              fontWeight: 500,
            }}
          >
            Smart Intelligence for a Safer Kumbh
          </p>
        </div>

        {/* Login Form */}
        <div style={{ padding: '30px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '13px',
                marginBottom: '18px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Authority ID / Email
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Mail size={16} color="#64748B" />
                <input
                  type="email"
                  required
                  placeholder="officer@kumbh.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    width: '100%',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Lock size={16} color="#64748B" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    width: '100%',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('For password resets or authority credential provisioning, contact the Nashik Kumbh Security Command Division (Room 102).');
                }}
                style={{ color: '#F47C20', textDecoration: 'none', fontWeight: 600 }}
              >
                Forgot password?
              </a>
            </div>

            <Button
              variant="saffron"
              size="lg"
              type="submit"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: '6px', borderRadius: '10px' }}
            >
              Access Authority Control Center
            </Button>
          </form>

          {/* Development / Evaluation Credentials Notice */}
          <div
            style={{
              marginTop: '24px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              fontSize: '12px',
              color: '#0369A1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
              <Info size={14} />
              <span>Demonstration / Officer Accounts:</span>
            </div>
            <div>
              • Commander: <code>officer@kumbh.gov.in</code> / <code>officer123</code>
            </div>
            <div>
              • Operations: <code>admin@kumbh.gov.in</code> / <code>admin123</code>
            </div>
            <div>
              • Database User: Any registered user in MySQL (e.g., <code>saurabh@gmail.com</code>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
