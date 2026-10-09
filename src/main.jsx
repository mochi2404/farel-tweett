import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './social-overrides.css';

class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('Frontend gagal dirender:', error, info.componentStack); }
  render() {
    if (this.state.failed) return <main style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', gap: 12, padding: 24, background: '#f2f2f7', color: '#1c1c1e', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}><h1 style={{ margin: 0, fontSize: 22 }}>Halaman gagal dimuat</h1><p style={{ maxWidth: 340, margin: 0, color: '#636366', lineHeight: 1.5 }}>Terjadi kendala saat menampilkan halaman. Muat ulang, lalu lihat Console browser jika masih terjadi.</p><button onClick={() => location.reload()} style={{ justifySelf: 'center', border: 0, borderRadius: 10, padding: '10px 16px', background: '#007aff', color: 'white', fontWeight: 600 }}>Muat ulang</button></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>);
