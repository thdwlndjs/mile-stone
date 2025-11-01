import React, { useState, useRef, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './Signin.css';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [open, setOpen] = useState(true);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!open) return null;

  // 솔트 생성
  const generateSalt = () => {
    return CryptoJS.lib.WordArray.random(16).toString(); // 16바이트 랜덤 솔트
  };

  // 해싱 함수 (비밀번호 + 솔트)
  const hashPassword = (password, salt) => {
    return CryptoJS.SHA256(password + salt).toString();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // 비밀번호 해싱
      const salt = generateSalt();
      const hashedPassword = hashPassword(password, salt);

      // 서버에 회원가입 요청
      const response = await fetch('http://localhost:4000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, hashedPassword, salt }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('회원가입에 성공했습니다!');
        console.log('회원가입된 유저:', data);
      } else {
        setErrorMsg(data.message || '회원가입 실패');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      setErrorMsg('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="signin-box" ref={modalRef}>
      <div className="content">
        <h1>회원가입</h1>
        <form onSubmit={handleSignUp}>
          <div>
            <input
              type="text"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">시작하기</button>

          {errorMsg && <p style={{ color: 'red', marginTop: '10px' }}>{errorMsg}</p>}
          {successMsg && <p style={{ color: 'green', marginTop: '10px' }}>{successMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Signin;
