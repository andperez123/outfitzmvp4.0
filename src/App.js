import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StyleGrid from './components/StyleGrid';
import Profile from './components/Profile';
import OutfitDetail from './components/OutfitDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<StyleGrid />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/outfit/:outfitId" element={<OutfitDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
