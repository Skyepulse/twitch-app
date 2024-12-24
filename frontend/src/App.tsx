import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainController from './Components/MainController/MainController';

function App() {
  return (
  <Router>
    <React.Suspense fallback={<div>...Loading...</div>}>
      <Routes>
        <Route path="/" element={<MainController />} />
      </Routes>
    </React.Suspense>
  </Router>
  );
}

export default App;
