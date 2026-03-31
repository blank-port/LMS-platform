import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AppContextProvider } from './context/AppContextProvider.jsx'
import { BrowserRouter } from 'react-router-dom'
import './i18n';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('React Error Boundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#1a1a2e', color: '#e94560', minHeight: '100vh' }}>
          <h1 style={{ color: '#fff', marginBottom: '20px' }}>⚠️ React Crash Detected</h1>
          <pre style={{ background: '#16213e', padding: '20px', borderRadius: '8px', overflow: 'auto', color: '#e94560', fontSize: '14px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <h3 style={{ color: '#fff', marginTop: '20px' }}>Component Stack:</h3>
          <pre style={{ background: '#16213e', padding: '20px', borderRadius: '8px', overflow: 'auto', color: '#0f3460', fontSize: '12px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </ErrorBoundary>,
)
