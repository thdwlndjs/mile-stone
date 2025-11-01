import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faHistory } from '@fortawesome/free-solid-svg-icons';
import './Home.css'; 

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
 * LLM 채팅 사이드바
 */
const ChatSidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h3 className="sidebar-title">LLM 채팅</h3>
        <p className="sidebar-subtitle">기사에 대해 질문해보세요.</p>
      </div>
      <div className="sidebar-content-scrollable chat-content">
        <div className="chat-bubble-wrapper-user">
          <div className="chat-bubble chat-bubble-user">
            이 기사의 핵심 주장은 무엇인가요?
          </div>
        </div>
        <div className="chat-bubble-wrapper-bot">
          <div className="chat-bubble chat-bubble-bot">
            이 기사는 한·미 관세 협상이 최종 단계에 있다는...
          </div>
        </div>
        {/* ... (스크롤 테스트용 채팅 내용 추가) ... */}
        <div className="chat-bubble-wrapper-user">
          <div className="chat-bubble chat-bubble-user">
            스크롤 테스트용 메시지입니다.
          </div>
        </div>
        <div className="chat-bubble-wrapper-bot">
          <div className="chat-bubble chat-bubble-bot">
            네, 스크롤이 잘 되고 있습니다.
          </div>
        </div>
      </div>
      <div className="sidebar-footer">
        <input 
          type="text"
          placeholder="메시지 입력..."
          className="chat-input"
        />
      </div>
    </div>
  );
};

/**
 * 뉴스 요약 결과 뷰
 */
const NewsResultView = ({ isLoggedIn, isHistoryOpen }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isAnyPanelOpen = isChatOpen || isHistoryOpen;
  const mainContentClasses = isAnyPanelOpen
    ? "result-content-box result-content-box-open"
    : "result-content-box";

  return (
    <>
      {/* LLM 채팅 버튼 */}
      <button
        onClick={() => setIsChatOpen(prev => !prev)}
        className="floating-button chat-button"
        aria-label="채팅 열기"
      >
        <FontAwesomeIcon icon={faCommentDots} />
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
              <span className="result-logo">로고</span>
            </div>
            <div className={mainContentClasses}>
              <div>
                <div className="news-header">
                  <h2>트럼프, APEC서 한·미 협상...</h2>
                  <p className="news-meta">연합뉴스 · 30분 전</p>
                </div>
                <div className="bar-graph">
                    <div className="bar bar-blue" style={{ width: '30%' }}></div>
                    <div className="bar bar-green" style={{ width: '20%' }}></div>
                    <div className="bar bar-red" style={{ width: '50%' }}></div>
                </div>
                <p className="news-summary-text">
                  트럼프 대통령은 28일 APEC 정상회담을...
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
                <h3 className="full-summary-title">전체 뉴스 요약 (임의 텍스트)</h3>
                <div className="prose-styles">
                  <p>로렘 입숨 돌로르 싯 아멧...</p>
                  <p>Fusce nec tellus sed augue semper porta...</p>
                  <p>Sed dignissim lacinia nunc...</p>
                  <p>Mauris ipsum. Nulla metus metus...</p>
                  <p>Donec porta diam eu massa...</p>
                  <p>Vivamus vestibulum, ipsum in aliquet ultricies...</p>
                  <p>Nullam varius, nibh sit amet commodo lacinia...</p>
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
                <ChatSidebar />
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
const InputView = ({ onSubmit, url, setUrl }) => {
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
            placeholder="httpsd://"
            className="input-view-input"
          />
          <button
            type="submit"
            className="input-view-submit"
          >
            요약하기
          </button>
        </div>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResult(true);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserName("***");
  };

  return (
    <div className="home-container">
      
      <div className="login-button-absolute">
        {!isLoggedIn ? (
          <button 
            onClick={handleLogin}
            className="login-button"
          >
            로그인
          </button>
        ) : (
          <button className="mypage-button">
            {userName} 페이지
          </button>
        )}
      </div>
      
      {isLoggedIn && (
        <button
          onClick={() => setIsHistoryOpen(prev => !prev)}
          className="floating-button history-button"
          aria-label="기록 열기"
        >
          <FontAwesomeIcon icon={faHistory} />
        </button>
      )}

      {!showResult ? (
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
            />
          </Panel>
        </PanelGroup>
      ) : (
        <NewsResultView 
          isLoggedIn={isLoggedIn} 
          isHistoryOpen={isHistoryOpen} 
        />
      )}
    </div>
  );
};

export default Home;