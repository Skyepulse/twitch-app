import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './Components/Chat/Chat';

const Home: React.FC = () => (<h1>Home</h1>);
const SecondPage: React.FC = () => (<h1>Second Page</h1>);

function App() {
  return (
    <Router>
    <React.Suspense fallback={<div>...Loading...</div>}>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/SecondPage" element={<SecondPage />} />
      </Routes>
    </React.Suspense>
  </Router>
  );
}

export default App;
