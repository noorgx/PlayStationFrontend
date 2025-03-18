// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import Machines from './components/Machines';
import FoodDrinks from './components/FoodDrinks';
import Quotes from './components/Quotes';
import StorageAndPayments  from './components/StorageAndPayments';
import Register from './components/Register';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Rooms from './components/Rooms';
import ShopDetails from './components/RoomCard/ShopDetails';
import Calc from './components/Calc';
import Payments from './components/Payments';
import Reports from './components/Report/Reports';
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
    if (localStorage.getItem('user')) {
      return element;
    } else {
      return <Navigate to="login" />;
    }
  };

  // Redirect if user is already logged in
  const AuthRoute = ({ element }) => {
    if (localStorage.getItem('user')) {
      return <Navigate to="/PlayStationFrontend/" />;
    } else {
      return element;
    }
  };

  return (
    <Router>
      <CustomNavbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="PlayStationFrontend/"
          element={<ProtectedRoute element={<Rooms />} />}
        />
        <Route
          path="PlayStationFrontend/shop"
          element={<ProtectedRoute element={<ShopDetails />} />}
        />
        <Route
          path="PlayStationFrontend/reports"
          element={<ProtectedRoute element={<Reports />} />}
        />
        <Route
          path="PlayStationFrontend/payments"
          element={<ProtectedRoute element={<Payments />} />}
        />
        <Route
          path="PlayStationFrontend/calc"
          element={<ProtectedRoute element={<Calc />} />}
        />
        <Route
          path="PlayStationFrontend/"
          element={<ProtectedRoute element={<Rooms />} />}
        />
        <Route
          path="PlayStationFrontend/machines"
          element={<ProtectedRoute element={<Machines />} />}
        />
        <Route
          path="PlayStationFrontend/food-drinks"
          element={<ProtectedRoute element={<FoodDrinks />} />}
        />
        <Route
          path="PlayStationFrontend/quotes"
          element={<ProtectedRoute element={<Quotes />} />}
        />
        <Route
          path="PlayStationFrontend/storage"
          element={<ProtectedRoute element={<StorageAndPayments  />} />}
        />
        <Route
          path="PlayStationFrontend/admin"
          element={<ProtectedRoute element={<AdminPanel />} />}
        />
        <Route
          path="PlayStationFrontend/register"
          element={<AuthRoute element={<Register />} />}
        />
        <Route
          path="PlayStationFrontend/login"
          element={<AuthRoute element={<Login onLogin={handleLogin} />} />}
        />
        <Route
          path="PlayStationFrontend/logout"
          element={<Logout onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;