import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'hospital'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.login({ email, password });

      // Guard check to ensure logging in as correct role
      if (role === 'hospital' && data.role !== 'hospital') {
        api.auth.logout();
        toast.error('This account is not registered as a hospital.');
        setLoading(false);
        return;
      }
      if (role === 'user' && data.role === 'hospital') {
        api.auth.logout();
        toast.error('This account is a hospital account. Please switch to "Hospital Portal".');
        setLoading(false);
        return;
      }

      toast.success('Successfully logged in!');
      
      // Route based on role
      setTimeout(() => {
        if (data.role === 'hospital') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCredentials = () => {
    if (role === 'user') {
      setEmail('demo@lifelink.local');
      setPassword('password123');
      toast.success('Prefilled patient demo credentials!');
    } else {
      setEmail('admin@citygeneral.local');
      setPassword('password123');
      toast.success('Prefilled hospital admin demo credentials!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="LifeLink"
            className="w-20 h-20 mx-auto mb-4"
            onError={(e) => { e.target.src = 'https://img.icons8.com/?size=100&id=6OOnASO9fxuG&format=png&color=000000' }}
          />

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome Back
          </h1>

          <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
            {role === 'user'
              ? 'Sign in to access healthcare dispatches and donor cards.'
              : 'Access your clinical control command center to manage status.'
            }
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-2xl p-8">
          
          {/* Role selector tab */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('user');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                role === 'user'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-805'
              }`}
            >
              Patient Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('hospital');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                role === 'hospital'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-805'
              }`}
            >
              Hospital Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">
                {role === 'user' ? 'Email Address' : 'Hospital Email'}
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'user' ? "demo@lifelink.local" : "admin@citygeneral.local"}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider">
                  Password
                </label>
                <span
                  onClick={() => toast('Please contact support or register a new account if forgotten.')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Forgot?
                </span>
              </div>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm transition-all"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Authenticating...' : (role === 'user' ? 'Sign In as Patient' : 'Sign In as Hospital')}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">DEMO</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {/* Demo Helper Button */}
            <button
              type="button"
              onClick={handleDemoCredentials}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-2.5 font-bold text-xs text-slate-700 transition"
            >
              🔑 Auto-fill Demo Credentials
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {role === 'user' ? (
              <>
                Don't have an account?{" "}
                <span
                  onClick={() => navigate('/newlogin')}
                  className="text-blue-600 font-bold cursor-pointer hover:underline"
                >
                  Create Account
                </span>
              </>
            ) : (
              <>
                Need to register your hospital?{" "}
                <span
                  onClick={() => navigate('/hospital/register')}
                  className="text-blue-600 font-bold cursor-pointer hover:underline"
                >
                  Register Hospital
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
