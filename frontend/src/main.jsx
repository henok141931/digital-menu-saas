import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ReactGA from 'react-ga4';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (measurementId) {
  ReactGA.initialize(measurementId);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
