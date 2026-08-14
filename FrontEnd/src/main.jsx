import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set the base URL for all Axios requests.
// In production (Vercel), this will point to your backend URL.
// In development, if not set, it will use relative paths which Vite will proxy.
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || '';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
