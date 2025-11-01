import React from 'react';
import './Home.css'; 

const Home = () => {
  return (
    <div className="home-container">
      {/* 뉴스 헤더 */}
      <div className="news-header">
        <h2>트럼프, APEC서 한·미 관세 협상 ‘최종 단계에 와 있다’ 밝혀</h2>
        <p className="news-meta">연합뉴스 · 30분 전</p>
      </div>

      {/* 진보-보수 막대 그래프 */}
      <div className="bar-graph">
        <div className="bar bar-left"></div>
        <div className="bar bar-center"></div>
        <div className="bar bar-right"></div>
      </div>

      {/* 기사 본문 */}
      <p className="article">
        트럼프 미 대통령은 28일 APEC 정상회의 참석을 위해 방한하는 자리에서 한·미 관세 협상이 ‘최종 단계에 와 있다’고 밝혔다.
      </p>

      {/* 관점 카드 섹션 */}
      <h3 className="section-title">다른 관점으로 보기</h3>
      <div className="perspective-cards">
        <div className="card progressive">
          <h4>진보 관점</h4>
          <p>협상이 진행된 점은 긍정적이지만, 관세 인하가 대기업 중심으로 적용될 가능성이 있다.</p>
        </div>
        <div className="card neutral">
          <h4>중립 관점</h4>
          <p>한·미 양국이 관세·안보 이슈에서 진전을 보이고 있다는 신호이다.</p>
        </div>
        <div className="card conservative">
          <h4>보수 관점</h4>
          <p>미국과의 관세 협상 및 안보 협력이 사실상 마무리 단계에 있다.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
