import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', rollNumber: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post(`/auth/${mode}`, f);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/');
    } catch (e2) { setErr(errMsg(e2)); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Login' : 'Student Registration'}</h2>
      {mode === 'register' && <>
        <input placeholder="Full name" value={f.name} onChange={set('name')} required />
        <input placeholder="Roll number" value={f.rollNumber} onChange={set('rollNumber')} />
      </>}
      <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
      <input type="password" placeholder="Password" value={f.password} onChange={set('password')} required />
      {err && <p className="err">{err}</p>}
      <button>{mode === 'login' ? 'Login' : 'Register'}</button>
      <p className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'New student? Register' : 'Have an account? Login'}
      </p>
    </form>
  );
}
