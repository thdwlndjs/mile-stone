import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('로그인 성공! 메인 페이지로 이동합니다.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.name);
        
        setTimeout(() => {
          navigate('/');
          window.dispatchEvent(new Event('storage')); 
        }, 1500);

      } else {
        setErrorMsg(data.message || '로그인 실패');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setErrorMsg('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
      } else {
        setErrorMsg('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="auth-main">
      <div className="auth-form-container">
        <h1 className="auth-h1">로그인</h1>
        <form onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input" 
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input" 
            />
          </div>
          <button type="submit" className="auth-button">
            로그인
          </button>
        </form>

        {errorMsg && <p className="auth-message-error">{errorMsg}</p>}
        {successMsg && <p className="auth-message-success">{successMsg}</p>}

        <div className="auth-link-container">
          <p>계정이 없으신가요? <Link to="/signup" className="auth-link">회원가입</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;