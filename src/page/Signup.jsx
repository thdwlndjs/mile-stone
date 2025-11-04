import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

/**
 * 회원가입 페이지
 * server.js의 /api/signup 엔드포인트와 연동
 */
const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || !name) {
      setErrorMsg('이메일, 이름, 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('회원가입 성공! 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          navigate('/login'); 
        }, 2000);
      } else {
        setErrorMsg(data.message || '회원가입 실패');
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
        <h1 className="auth-h1">회원가입</h1>
        <form onSubmit={handleSignup}>
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
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            회원가입
          </button>
        </form>

        {errorMsg && <p className="auth-message-error">{errorMsg}</p>}
        {successMsg && <p className="auth-message-success">{successMsg}</p>}

        <div className="auth-link-container">
          <p>이미 계정이 있으신가요? <Link to="/login" className="auth-link">로그인</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;