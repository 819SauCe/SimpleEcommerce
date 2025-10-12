import "./styles/global.scss";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { UserProvider } from './config/UserContext';
import { ProtectedRoute } from './config/ProtectedRoute';
import { Footer } from './components/Footer';
import { NotFound } from './pages/not-found';
import { Pricing } from './pages/pricing';
import { Status } from './pages/status';
import { Store } from './pages/store';
import { Profile } from './pages/profile';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <BrowserRouter>
      <UserProvider>
        <Header />
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/status" element={<Status />} />
          <Route path="/store" element={<Store />} />
          <Route path="/:slug/user" element={<Profile />} />
        </Routes>
        <Footer />
      </UserProvider>
    </BrowserRouter>
);
