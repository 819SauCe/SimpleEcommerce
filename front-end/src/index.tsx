import "./styles/global.scss";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { UserProvider } from './config/UserContext';
import { ProtectedRoute } from './config/ProtectedRoute';
import { Footer } from './components/Footer';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Footer />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
