

## 📄 **README.md**

````markdown
# 📰 RSS Collector Server

자동으로 RSS 주소를 기반으로 뉴스를 수집하고, 새 기사를 감지하여 기록·백업하는 Node.js 기반 뉴스 수집 서버입니다.  
(현재 버전: 2025-11-09 Stable)

---

## 🚀 주요 기능

| 기능 | 설명 |
|------|------|
| ⏰ **자동 수집 스케줄링** | 매 정시(1시간 간격)마다 모든 RSS를 점검 |
| ⚡ **중복 감지 방지** | `seen_urls.csv`에 기록된 URL은 재수집하지 않음 |
| 🧾 **새 기사 감지 및 저장** | 새 기사가 감지되면 `articles_queue.csv`에 즉시 저장 |
| 💾 **자동 백업** | 매일 자정 `seen_urls.csv`를 `/backups/seen_YYYY-MM-DD.csv`로 백업 후 초기화 |
| 🔁 **수집 진행률 표시** | `[n/전체] 언론사명 처리 완료` 형태로 진행 상황 표시 |
| ⏳ **지연 자동 스킵** | 2분 이상 응답 없는 RSS는 자동 스킵 (`⏰ [언론사] 응답 지연 → 스킵`) |
| 🔒 **중복 실행 방지** | 수집 중에는 중복 실행 차단 (`⏳ 현재 수집 중입니다.`) |

---

## 🧱 시스템 구조

```bash
rss_collector/
├── rss_server.js          # 메인 서버
├── rss_list.csv           # RSS 주소 목록
├── package.json           # 의존성 정의
├── articles_queue.csv     # 새로 감지된 기사 목록
├── seen_urls.csv          # 이미 수집된 기사 URL
├── backups/               # seen_urls 자동 백업 디렉토리
└── .gitignore             # 불필요한 파일 제외 설정
````

---

## ⚙️ 실행 방법

### 1️⃣ 의존성 설치

```bash
npm install
```

### 2️⃣ 서버 실행

```bash
npm start
```

> 실행 후 콘솔에
> `✅ RSS 감시 서버 실행 중: http://localhost:4100`
> 가 표시되면 정상적으로 실행된 것입니다.

---

## 🗓️ 스케줄 구조

| 주기                | 작업 내용                       |
| ----------------- | --------------------------- |
| **매 정시 (1시간 간격)** | RSS 피드 전체 점검 및 새 기사 감지      |
| **매일 자정 (00:00)** | `seen_urls.csv` 자동 백업 및 초기화 |

---

## 📡 API 엔드포인트

| 경로                   | 설명                      |
| -------------------- | ----------------------- |
| `GET /api/rss-check` | 즉시 RSS 수집 실행            |
| `GET /api/rss-queue` | 현재 감지된 새 기사 목록(JSON) 조회 |

---

## 🧠 작동 원리

1️⃣ `rss_list.csv`의 RSS 주소 목록을 불러옵니다.
2️⃣ 각 RSS를 순회하며 기사를 파싱합니다.
3️⃣ 이미 `seen_urls.csv`에 기록된 URL은 스킵합니다.
4️⃣ 새로운 기사가 감지되면 즉시 `articles_queue.csv`에 추가하고,
그 후 `seen_urls.csv`에도 추가하여 중복 방지합니다.
5️⃣ 모든 RSS를 처리하면 `"✅ RSS 수집 완료"` 로그가 표시됩니다.

---

## 🧾 RSS 목록 예시 (`rss_list.csv`)

```csv
title,url,category,country,last_checked,status
한겨레,https://www.hani.co.kr/rss/,전체뉴스,대한민국,,active
연합뉴스,https://www.yna.co.kr/rss/news.xml,전체뉴스,대한민국,,active
BBC News,https://feeds.bbci.co.uk/news/rss.xml,전체뉴스,영국,,active
NYT,https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml,전체뉴스,미국,,active
```

---

## 🧩 주의사항

* RSS 주소에 따라 일부 피드는 XML 형식이 다르거나 깨진 경우가 있을 수 있습니다.
  (`Unexpected close tag`, `Invalid character` 등의 경고는 정상적인 파싱 시도 중 출력됩니다.)
* `rss_list.csv`의 주석(`"#"`)으로 시작하는 행은 자동으로 무시됩니다.
* `central_list.csv`는 비어 있어도 상관없습니다. (현재 미사용)

---

## 🧠 확장 계획

* [ ] `articles_queue.csv` → 외부 요약/태그/임베딩 API 자동 전송
* [ ] 결과를 데이터베이스(Azure SQL / MySQL)에 저장
* [ ] 수집 로그 대시보드 구현 (웹 UI)
* [ ] 병렬 처리 속도 최적화

---

## 👨‍💻 개발 환경

* **Node.js**: v22.x 이상
* **Dependencies**:

  * `express`
  * `rss-parser`
  * `node-schedule`
  * `node-fetch`
  * `iconv-lite`
  * `xml2js`
  * `date-fns`

---

## 📜 License

MIT License © 2025 milestone
이 프로젝트는 개인/연구용으로 자유롭게 수정 및 사용 가능합니다.

````
