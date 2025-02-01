// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import Machines from './components/Machines';
import FoodDrinks from './components/FoodDrinks';
import Quotes from './components/Quotes';
import StorageAndQuotes from './components/StorageAndQuotes';
import Register from './components/Register';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Rooms from './components/Rooms';
import Calc from './components/Calc';
import Logout from './components/Logout';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Function to handle login
  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Protected route for authenticated users
  const ProtectedRoute = ({ element }) => {
    if (user) {
      return element;
    } else {
      return <Navigate to="/login" />;
    }
  };

  // Redirect if user is already logged in
  const AuthRoute = ({ element }) => {
    if (user) {
      return <Navigate to="/rooms" />;
    } else {
      return element;
    }
  };

  return (
    <Router>
      <CustomNavbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={<ProtectedRoute element={<Rooms />} />}
        />
        <Route
          path="/calc"
          element={<ProtectedRoute element={<Calc />} />}
        />
        <Route
          path="/rooms"
          element={<ProtectedRoute element={<Rooms />} />}
        />
        <Route
          path="/machines"
          element={<ProtectedRoute element={<Machines />} />}
        />
        <Route
          path="/food-drinks"
          element={<ProtectedRoute element={<FoodDrinks />} />}
        />
        <Route
          path="/quotes"
          element={<ProtectedRoute element={<Quotes />} />}
        />
        <Route
          path="/storage"
          element={<ProtectedRoute element={<StorageAndQuotes />} />}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminPanel />} />}
        />
        <Route
          path="/register"
          element={<AuthRoute element={<Register />} />}
        />
        <Route
          path="/login"
          element={<AuthRoute element={<Login onLogin={handleLogin} />} />}
        />
        <Route
          path="/logout"
          element={<Logout onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;