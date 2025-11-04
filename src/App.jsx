import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/Home.jsx'; 
import MyPage from './page/Mypage.jsx'; 
import Login from './page/Login.jsx';
import Signup from './page/Signup.jsx'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* 기본 경로 */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />

        {/* Mypage 경로 */}
        <Route path="/Mypage" element={<MyPage />} />

        {/* 인증 경로 */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />

        {/* 404 Not Found */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;