import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // 랜덤 솔트 생성
  const generateSalt = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
  };

  // 솔팅 + 해싱
  const hashPassword = (password, salt) => {
    return CryptoJS.SHA256(password + salt).toString();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const salt = generateSalt();
      const hashedPassword = hashPassword(password, salt);

      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, hashedPassword, salt }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('로그인 성공!');
        localStorage.setItem('token', data.token); // JWT 저장
        navigate('/Home');
      } else {
        setErrorMsg(data.message || '로그인 실패');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      setErrorMsg('서버 오류');
    }
  };

  return (
    <div className="login-box">
      <div className="content">
        <h1>로그인</h1>
        <form onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              placeholder="ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="PW"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      </div>
    </div>
  );
};

export default Login;
