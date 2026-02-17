import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Polyfills for simple-peer
import { Buffer } from 'buffer';
import process from 'process';

window.global = window;
window.process = process;
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
