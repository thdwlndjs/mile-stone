import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/Home';

const AuthRoute = ({ requireAuth, children }) => {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!checked) return null; // or 로딩 UI

  if (requireAuth && !user) {
    // 로그인 필요, 근데 로그인 안 된 경우
    return <Navigate to="/" replace />;
  }

  if (!requireAuth && user) {
    // 비로그인 필요, 근데 로그인 된 경우
    return <Navigate to="/Home" replace />;
  }

  return children;
};
function App() {
  return (
    <Router>
      <Routes>
        {/* 기본 경로: Home 페이지로 이동 */}
        <Route path="/" element={<Home />} />

        {/* 직접 /Home 으로 접근해도 동일하게 */}
        <Route path="/Home" element={<Home />} />

        {/* 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
