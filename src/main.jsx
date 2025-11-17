import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerServiceWorker } from './lib/pwaHelper.js'

// Error Boundary Component for Safari compatibility
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#dc2626', fontSize: '24px', marginBottom: '16px' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              The app encountered an error. This might be due to browser compatibility issues.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#f97316',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Reload Page
            </button>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '16px' }}>
              Try using Chrome or Safari's latest version for the best experience.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap app rendering in try-catch for Safari
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Register service worker for PWA functionality
  if (import.meta.env.PROD) {
    registerServiceWorker().then(registration => {
      if (registration) {
        console.log('PWA: App is ready for offline use');
      }
    });
  }
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px;">
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; text-align: center;">
        <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">Unable to Start App</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Your browser may not be compatible. Please try:</p>
        <ul style="color: #64748b; font-size: 14px; text-align: left; margin-bottom: 24px;">
          <li>Updating Safari to the latest version</li>
          <li>Using Chrome or Firefox instead</li>
          <li>Disabling Safari's "Prevent Cross-Site Tracking"</li>
        </ul>
        <button onclick="location.reload()" style="background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">
          Try Again
        </button>
      </div>
    </div>
  `;
}
