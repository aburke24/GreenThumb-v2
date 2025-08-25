import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserProvider';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import GardenPage from './pages/GardenPage';
import EditBedPage from './pages/EditBedPage'; // Import the new GardenPage

/**
 * The main application component.
 * It sets up the routing and the user context provider for the entire app.
 */
const App = () => {
  return (
    // UserProvider must wrap the entire router to make context available
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/garden/:gardenId" element={<GardenPage />} />
           <Route path="/garden/:gardenId/bed/:bedId" element={<EditBedPage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
