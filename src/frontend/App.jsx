import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HistoryPage from './pages/HistoryPage';
import DroneList from './pages/DroneList';
import OperatorList from './pages/OperatorList';
import DroneVisu from './pages/DroneVisu';
import Assignments from './pages/Assignments';
import DroneSelection from './pages/DroneSelection';
import Login from './pages/login';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/drones" element={<DroneList />} />
          <Route path="/drones-selection" element={<DroneSelection />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/operators" element={<OperatorList />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/drone-visu" element={<DroneVisu />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
