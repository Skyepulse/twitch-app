import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const Home = () => <h1>My Home</h1>;
const SecondPage = () => <h1>About</h1>;

const AppRoutes = () => (
  <Router>
    < React.Suspense fallback={<div>Loading Page...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<SecondPage />} />
      </Routes>
    </React.Suspense>
  </Router>
);

export default AppRoutes;