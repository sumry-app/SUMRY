import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ComponentShowcase from './ComponentShowcase.jsx'
import './index.css'

// Toggle between regular app and feature showcase
const SHOW_FEATURE_DEMO = true; // Set to false to return to normal app

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {SHOW_FEATURE_DEMO ? <ComponentShowcase /> : <App />}
  </React.StrictMode>,
)
