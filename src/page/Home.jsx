import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // [오류 수정] npm install 필요
// import { faCommentDots, faHistory } from '@fortawesome/free-solid-svg-icons'; // [오류 수정] npm install 필요
import { Link, useNavigate } from 'react-router-dom';
import './Home.css'; // [오류 수정] CSS 파일 생성 필요
// import logoImage from '../assets/temp_logo2.png'; // 로고 이미지 경로 확인 필요

/**
 * 사용자 기록 사이드바
 */
const HistorySidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h3 className="sidebar-title">사용자 기록</h3>
        <p className="sidebar-subtitle">최근에 본 뉴스 목록입니다.</p>
      </div>
      <div className="sidebar-content-scrollable">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="history-item">
            <p className="history-item-title">
              스크롤 테스트용 기록 {i + 1}
            </p>
            <p className="history-item-time">{i * 5 + 2}분 전</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * [수정] LLM 채팅 사이드바
 * (채팅 state와 API 로직을 이 컴포넌트 내부로 이동)
 */
const ChatSidebar = ({ geminiSummary, isChatOpen }) => {
  // [이동] 채팅 관련 state를 ChatSidebar가 직접 관리
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: '안녕하세요! 요약된 기사에 대해 궁금한 점을 질문해주세요.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // [신규] 기사 요약본(geminiSummary)이 변경되면(새 기사를 요약하면) 채팅 내역 초기화
  useEffect(() => {
    // 요약본이 바뀔 때만 채팅 내역을 초기화합니다.
    if (geminiSummary) {
      setChatHistory([
        { role: 'bot', text: '안녕하세요! 요약된 기사에 대해 궁금한 점을 질문해주세요.' }
      ]);
      setChatInput('');
    }
  }, [geminiSummary]); // geminiSummary가 바뀔 때마다 실행

  /**
   * [이동] 채팅 메시지 전송 함수
   */
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !geminiSummary) return;

    const userMessage = { role: 'user', text: chatInput };
    setIsChatLoading(true);
    setChatInput(''); // 입력창 비우기
    setChatHistory(prevHistory => [...prevHistory, userMessage]); // 사용자 메시지 먼저 표시

    try {
      // server.js의 /api/chat 호출
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput, // 사용자의 질문
          context: geminiSummary // props로 받은 AI 요약본
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = { role: 'bot', text: data.reply };
        setChatHistory(prevHistory => [...prevHistory, botMessage]);
      } else {
        const errorMessage = { role: 'bot', text: `오류: ${data.message || '답변을 가져오지 못했습니다.'}` };
        setChatHistory(prevHistory => [...prevHistory, errorMessage]);
      }
    } catch (err) {
      const errorMessage = { role: 'bot', text: '오류: 서버에 연결할 수 없습니다.' };
      setChatHistory(prevHistory => [...prevHistory, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Enter 키로 메시지를 전송하는 함수
  const onFormSubmit = (e) => {
    e.preventDefault();
    // 패널이 열려있을 때만 전송
    if (chatInput.trim() && !isChatLoading && isChatOpen) {
      handleSendMessage();
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h3 className="sidebar-title">채팅봇</h3>
        <p className="sidebar-subtitle">기사에 대해 질문해보세요.</p>
      </div>
      <div className="sidebar-content-scrollable chat-content">
        
        {/* 채팅 내역을 동적으로 렌더링 */}
        {chatHistory.map((message, index) => (
          <div 
            key={index}
            // [수정] 사용자(user)를 'bot' 스타일(오른쪽/파랑)로, 봇(bot)을 'user' 스타일(왼쪽/회색)로 변경
            className={message.role === 'user' ? 'chat-bubble-wrapper-bot' : 'chat-bubble-wrapper-user'}
          >
            <div 
              // [수정] 사용자(user)를 'bot' 스타일(오른쪽/파랑)로, 봇(bot)을 'user' 스타일(왼쪽/회색)로 변경
              className={message.role === 'user' ? 'chat-bubble chat-bubble-bot' : 'chat-bubble chat-bubble-user'}
            >
              {message.text}
            </div>
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {isChatLoading && (
          
          <div className="chat-bubble-wrapper-user">
            <div className="chat-bubble chat-bubble-user">
              답변을 생성 중입니다...
            </div>
          </div>
        )}

      </div>
      <form onSubmit={onFormSubmit} className="sidebar-footer">
        <input 
          type="text"
          placeholder="메시지 입력..."
          className="chat-input"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={isChatLoading} // 로딩 중 비활성화
        />
        <button 
          type="submit" 
          disabled={isChatLoading} // 로딩 중 비활성화
          style={{display: 'none'}} // Enter 키로 전송하므로 버튼은 숨김
        >
          전송
        </button>
      </form>
    </div>
  );
};

/*
  [수정] 뉴스 요약 결과 뷰
  (채팅 로직 제거)
 */
const NewsResultView = ({ isLoggedIn, isHistoryOpen, newsData }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // [제거] 채팅 관련 state와 로직을 ChatSidebar로 이동

  const isAnyPanelOpen = isChatOpen || isHistoryOpen;
  const mainContentClasses = isAnyPanelOpen
    ? "result-content-box result-content-box-open"
    : "result-content-box";

  // [수정] AI 요약본의 줄바꿈(\n)을 <br> 태그로 변환하는 함수
  // (흰 화면 오류 방지를 위해 기본값 = '' 설정)
  const formatSummary = (summaryText = '') => {
    return summaryText.replace(/\n/g, '<br />');
  };

  return (
    <>
      <button
        onClick={() => setIsChatOpen(prev => !prev)}
        className="floating-button chat-button"
        aria-label="채팅 열기"
      >
        {/* [오류 수정] 임시 SVG 아이콘 */}
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" fill="white"><path d="M512 240c0 114.9-93.1 208-208 208c-37.1 0-72.3-9.7-103.4-26.5c-31.9 19.3-70.1 31.1-111.4 36.5c-9.2 .8-17.9-7.4-17.3-16.7c.8-10.9 4.9-21.3 10.8-30.9c-23.3-25-40.3-54.7-48.2-87.8C10.7 319.4 0 281.6 0 240C0 125.1 93.1 32 208 32s208 93.1 208 208zM208 384c106 0 192-86 192-192S314 0 208 0S16 86 16 192c0 33.4 8.7 64.9 24.1 92.2c-4.4 7.2-9.4 13.7-14.8 19.5c-8.5 9-16.2 17.5-23 25.1c16.8-2.6 33-6.6 48.7-11.7c31.1 14.8 65.2 23 100.9 24.1c.2 0 .4 0 .6 0z"/></svg>
      </button>
      <PanelGroup direction="horizontal" className="panel-group">
        {isHistoryOpen && isLoggedIn && (
          <>
            <Panel defaultSize={25} minSize={20} order={1}>
              <div className="panel-content-wrapper">
                <HistorySidebar />
              </div>
            </Panel>
            <PanelResizeHandle className="panel-resize-handle" />
          </>
        )}
        <Panel defaultSize={50} minSize={30} order={2}>
          <main className="result-view-main">
            <div className="result-logo-container">
              {/* <img src={logoImage} alt="로고 이미지" className='logo-image'></img> */}
              <span className="result-logo">로고</span>
            </div>
            <div className={mainContentClasses}>
              <div>
                <div className="news-header">
                  <h2>{newsData?.title || '기사 제목을 불러오는 중...'}</h2>
                  <p className="news-meta">
                    {newsData?.domain || '출처 미상'}
                    {newsData?.date_published ? ` · ${new Date(newsData.date_published).toLocaleDateString()}` : ''}
                  </p> {/* [오류 수정] </g>를 </p>로 변경 */}
                </div>
                <div className="bar-graph">
                    <div className="bar bar-blue" style={{ width: '30%' }}></div>
                    <div className="bar bar-green" style={{ width: '20%' }}></div>
                    <div className="bar bar-red" style={{ width: '50%' }}></div>
                </div>
                {/* 파서가 추출한 원본 요약(excerpt) 표시 */}
                <p className="news-summary-text">
                  {newsData?.excerpt || '요약본을 불러오는 중...'}
                </p>
                <h3 className="other-views-title">다른 방식으로 보기</h3>
                <div className="other-views-grid">
                    <div className="view-card view-card-blue">...</div>
                    <div className="view-card view-card-green">...</div>
                    <div className="view-card view-card-red">...</div>
                </div>
              </div>
              <hr className="divider-line" />
              <div>
                <h3 className="full-summary-title">AI가 요약한 핵심 내용</h3>
                
                {/* [수정] AI 요약본(geminiSummary) 렌더링
                  흰 화면 오류를 방지하기 위해 formatSummary 함수 사용
                */}
                <div 
                  className="prose-styles" 
                  dangerouslySetInnerHTML={{ 
                    __html: formatSummary(newsData?.geminiSummary) || '<p>AI 요약본을 불러오는 중입니다...</p>' 
                  }}
                >
              </div>
            </div>
          </div>
          </main>
        </Panel>
        {isChatOpen && (
          <>
            <PanelResizeHandle className="panel-resize-handle" />
            <Panel defaultSize={25} minSize={20} order={3}>
              <div className="panel-content-wrapper">
                {/* [수정] ChatSidebar에 요약본(context)과 패널 상태 전달 */}
                <ChatSidebar 
                  geminiSummary={newsData?.geminiSummary}
                  isChatOpen={isChatOpen}
                />
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </>
  );
};

/**
 * '입력창' 뷰
 */
const InputView = ({ onSubmit, url, setUrl, isLoading, errorMsg }) => {
  return (
    <main className="input-view-main">
      <form onSubmit={onSubmit} className="input-view-form">
        <h1 className="input-view-h1">
          뉴스 기사 링크를 입력하세요
        </h1>
        <div className="input-view-flex-container">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="input-view-input"
            disabled={isLoading} // 로딩 중 비활성화
          />
          <button
            type="submit"
            className="input-view-submit"
            disabled={isLoading} // 로딩 중 비활성화
          >
            {isLoading ? '요약 중...' : '요약하기'}
          </button>
        </div>
        {errorMsg && (
          <p style={{ textAlign: 'center', color: '#ef4444', marginTop: '1rem' }}>
            {errorMsg}
          </p>
        )}
      </form>
    </main>
  );
};


/**
 * 메인 Home 컴포넌트
 */
const Home = () => {
  const [url, setUrl] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // API 응답, 로딩, 에러를 위한 State
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  // 로그인 상태 관리 (localStorage 기반)
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('name'); // 로그인 시 저장된 이름
      if (token && name) {
        setIsLoggedIn(true);
        setUserName(name);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkLoginStatus(); // 컴포넌트 마운트 시 확인
    
    // 다른 탭에서 로그인/로그아웃 시 상태 동기화를 위한 이벤트 리스너
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // '요약하기' 버튼 클릭 시 실행될 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 상태 초기화
    setIsLoading(true);
    setErrorMsg('');
    setNewsData(null);
    // [수정] setShowResult(false) 제거 (결과 뷰로 바로 넘어가지 않도록)
    
    try {
      // server.js의 /api/parse 엔드포인트 호출
      const response = await fetch('http://localhost:4000/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlToParse: url }), // 입력된 URL 전송
      });

      const data = await response.json();

      if (response.ok) {
        setNewsData(data); // 성공 시, 결과 데이터(AI 요약본 포함)를 state에 저장
        setShowResult(true);  // 결과 뷰로 전환
      } else {
        // 백엔드에서 보낸 에러 메시지 표시 (예: '파싱 오류')
        setErrorMsg(data.message || '기사 요약에 실패했습니다.');
        setShowResult(false);
      }
    } catch (err) {
      // 네트워크 에러 등
      setErrorMsg('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
      setShowResult(false);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="home-container">
      
      <div className="login-button-absolute">
        {!isLoggedIn ? (
          // <Link>를 사용하여 /login 페이지로 이동
          <Link to="/login" className="login-button">
            로그인
          </Link>
        ) : (
          // 로그아웃 버튼
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('name');
              setIsLoggedIn(false); // 상태 업데이트
              setUserName('');
              navigate('/'); // 홈으로
              // [신규] 로그아웃 시 입력 뷰로 돌아가도록
              setShowResult(false);
              setUrl('');
            }} 
            className="mypage-button"
          >
            {userName}님 로그아웃
          </button>
        )}
      </div>
      
      {isLoggedIn && (
        <button
          onClick={() => setIsHistoryOpen(prev => !prev)}
          className="floating-button history-button"
          aria-label="기록 열기"
        >
          {/* [오류 수정] 임시 SVG 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" fill="white"><path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
        </button>
      )}

      {!showResult ? (
        // [입력 뷰]
        <PanelGroup direction="horizontal" className="panel-group">
          {isHistoryOpen && isLoggedIn && (
            <>
              <Panel defaultSize={25} minSize={20} order={1}>
                <div className="panel-content-wrapper">
                  <HistorySidebar />
                </div>
              </Panel>
              <PanelResizeHandle className="panel-resize-handle" />
            </>
          )}
          <Panel defaultSize={75} minSize={30} order={2} className="panel-scrollable">
            <InputView 
              onSubmit={handleSubmit} 
              url={url} 
              setUrl={setUrl} 
              isLoading={isLoading}
              errorMsg={errorMsg}
            />
          </Panel>
        </PanelGroup>
      ) : (
        // [결과 뷰]
        <NewsResultView 
          isLoggedIn={isLoggedIn} 
          isHistoryOpen={isHistoryOpen} 
          newsData={newsData} // 파싱된 데이터(AI 요약본 포함) 전달
        />
      )}
    </div>
  );
};

export default Home;