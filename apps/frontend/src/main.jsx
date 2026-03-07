import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminRoute from './AdminRoute.jsx'
import Methodology from './components/Methodology.jsx'
import './index.css'

// Simple client-side routing
function Router() {
  const path = window.location.pathname;

  if (path === '/admin') {
    return <AdminRoute />;
  }
  if (path === '/methodology') {
    return <Methodology />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)
