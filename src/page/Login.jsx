import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  // 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 더미 로그인 검증
  const handleLogin = (e) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    // 예시용 간단한 조건 (이메일/비번 직접 설정)
    if (email === 'test@example.com' && password === '1234') {
      setSuccessMsg('로그인 성공!');
    } else if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
    } else {
      setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  // 구글 로그인 버튼 클릭 시 (실제 로그인 대신 안내)
  const handleGoogleLogin = () => {
    alert('Google 로그인 기능은 현재 비활성화되어 있습니다.');
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
          <div>
            <button type="submit" className="login-button">로그인</button>
          </div>
        </form>

        <div>
          <button onClick={handleGoogleLogin} className="G-login-button">
            <img
              className="google-Icon"
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
            />
            구글 로그인
          </button>
        </div>

        {errorMsg && <p style={{ color: 'red', marginTop: '10px' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green', marginTop: '10px' }}>{successMsg}</p>}
      </div>
    </div>
  );
};

export default Login;
