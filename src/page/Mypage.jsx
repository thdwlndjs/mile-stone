import React from 'react';
import './Mypage.css';

const MyPage = () => {
  // 예시 데이터 (백엔드 분석 결과)
  const liberalRatio = 35;
  const neutralRatio = 20;
  const conservativeRatio = 45;

  // 내 위치 (전체 비율 기반 평균값)
  const mySpectrumPosition = liberalRatio + neutralRatio / 2;

  // 🔹 달력형 성향 데이터 생성 (10주 × 7일)
  const weeks = 28;
  const days = 4;
  const totalCells = weeks * days;

  const dotData = Array.from({ length: totalCells }).map((_, i) => {
    const dddd = Math.floor(i / days);
    const day = i % days;
    const rand = Math.random();

    let color = '#ffffffff'; // 기본 회색 (데이터 없는 날)
    if (rand < 0.3) color = '#3b82f6'; // 진보
    else if (rand < 0.6) color = '#22c55e'; // 중립
    else if (rand < 0.9) color = '#ef4444'; // 보수

    return { id: i, dddd, day, color };
  });

  return (
    <div className="mypage-container">
      {/* 프로필 */}
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <h2>사용자 프로필 요약</h2>
          <p>정치적 성향 진단 결과</p>
        </div>
      </div>

      {/* 뉴스 스펙트럼 */}
      <div className="spectrum">
        <h3>내 뉴스 스펙트럼</h3>

        {/* 막대 + 내 위치 */}
        <div className="spectrum-wrapper">
          <div
            className="spectrum-indicator"
            style={{ left: `${mySpectrumPosition}%` }}
            title="내 위치"
          />
          <div className="spectrum-bar">
            <div style={{ width: `${liberalRatio}%`, backgroundColor: '#3b82f6' }}></div>
            <div style={{ width: `${neutralRatio}%`, backgroundColor: '#22c55e' }}></div>
            <div style={{ width: `${conservativeRatio}%`, backgroundColor: '#ef4444' }}></div>
          </div>

          <div className="spectrum-labels">
            <span>Liberal</span>
            <span>Neutral</span>
            <span>Conservative</span>
          </div>
        </div>

        {/* 🗓️ 달력형 성향 점 시각화 */}
        <div className="calendar-heatmap">
          {dotData.map((dot) => (
            <div
              key={dot.id}
              className="calendar-cell"
              style={{
                gridColumn: dot.dddd + 1,
                gridRow: dot.day + 1,
                backgroundColor: dot.color,
                marginTop: `${Math.random() * 4 - 2}px`, // 약간만 불규칙성
              }}
            />
          ))}
        </div>
      </div>

      {/* 추천 뉴스 */}
      <div className="news-section">
        <h3>추천 뉴스</h3>
        <div className="filter-buttons">
          <button className="active">내 성향과 동일한 관점</button>
          <button className="inactive">내 성향과 다른 관점</button>
          <button className="inactive">중립 관점</button>
        </div>

        <div className="news-grid">
          <div className="news-card">
            <h4>또 하나의 '지슈라지' 당</h4>
            <p>뉴스 1</p>
            <span className="news-tag blue">진보</span>
          </div>

          <div className="news-card">
            <h4>경제 정책 무엇이 문제인가</h4>
            <p>뉴스 2</p>
            <span className="news-tag green">중립</span>
          </div>

          <div className="news-card">
            <h4>대통령, 의료 개혁 강조</h4>
            <p>뉴스 3</p>
            <span className="news-tag red">보수</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
