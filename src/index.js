import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes,Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import './index.css';
import { AuthProvider } from "./AuthContext";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <React.StrictMode>
    <AuthProvider>

      <BrowserRouter>
            <Routes>
              <Route path="*" element={<Home />} />
              <Route path="/login" element={<Login />} />
            </Routes>
      </BrowserRouter>
    </AuthProvider>
   </React.StrictMode>
);