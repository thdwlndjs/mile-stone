# 📰 React + Tailwind 뉴스 카드 뷰어

> 깔끔한 뉴스 카드 UI와 진보/보수 시각 분석 그래프를 제공하는 React + Tailwind 프로젝트입니다.

---

## 🚀 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 👉 [http://localhost:5173](http://localhost:5173) 접속

---

## 💡 주요 기능

* 🧠 **진보/보수 시각 시각화** — 뉴스 데이터를 3색 막대로 분석 표시
* 🎨 **Tailwind CSS 디자인** — 직관적이고 반응형 UI
* ⚡ **Vite 기반 개발환경** — 빠른 HMR & 빌드
* 🔍 **다른 관점으로 보기 섹션** — 세 가지 시각(진보/중립/보수)을 카드로 표현

---

## 🛠️ 기술 스택

| 분류         | 사용 기술                      |
| ---------- | -------------------------- |
| Frontend   | React 18, Vite             |
| Styling    | Tailwind CSS               |
| Build      | PostCSS, Autoprefixer      |
| Deployment | Vercel or Firebase Hosting |

---

## 📸 실제 화면 구성 (예시 코드)

```jsx
<div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
  <h2 className="text-2xl font-bold mb-2">트럼프, APEC서 한·미 관세 협상 ‘최종 단계에 와 있다’ 밝혀</h2>
  <p className="text-blue-600 text-sm">연합뉴스 · 30분 전</p>
  <div className="w-full h-3 bg-gray-200 rounded-full my-6 overflow-hidden">
    <div className="flex w-full h-full">
      <div className="bg-blue-500" style={{ width: '30%' }}></div>
      <div className="bg-green-500" style={{ width: '20%' }}></div>
      <div className="bg-red-500" style={{ width: '50%' }}></div>
    </div>
  </div>
</div>
```

---

## 🧩 설치 가이드

1. Node.js 18 이상 설치
2. 의존성 설치: `npm install`
3. 개발 서버 실행: `npm run dev`

---

## ⚙️ React 19 → 18 다운그레이드 방법

React 19 환경에서 `Invalid hook call` 등의 오류가 발생하는 경우, 아래 방법으로 안정적인 React 18 환경으로 되돌릴 수 있습니다.

```bash
# 기존 React 제거
npm uninstall react react-dom

# React 18 재설치
npm install react@18.3.1 react-dom@18.3.1

# React Router 호환 버전 설치
npm install react-router-dom@6.30.1
```

Tailwind / Vite와의 호환성을 위해 다음 명령도 실행하세요:

```bash
npm install -D vite@5.2.11 tailwindcss@3.4.3 postcss autoprefixer
```

그 후 `postcss.config.js`를 다음과 같이 수정합니다 👇

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

완료 후 다시 실행:

```bash
npm run dev
```

✅ 이제 React 18 + Tailwind + Vite 환경에서 안정적으로 작동합니다!

---

## ✨ 미리보기 이미지 (README에 실제로 넣기)

> 프로젝트 루트의 `/public/preview.png` 파일을 캡처 이미지로 저장 후 아래 구문 추가:

```md
![UI Preview](public/preview.png)
```

또는 중앙 정렬 버전 👇

```html
<p align="center">
  <img src="public/preview.png" width="600px" />
</p>
```

---

## 🧭 버전 관리

| 항목       | 버전     |
| -------- | ------ |
| React    | 18.3.1 |
| Vite     | 5.2.11 |
| Tailwind | 3.4.3  |

---

## 👩‍💻 제작자

> **Milestone Team**
> 📧 contact: [milestone@dev.com](mailto:milestone@dev.com)
> 🌐 [https://github.com/milestone](https://github.com/milestone)

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
 **“GitHub에서 mile-stone 프로젝트를 클론한 후 로컬에서 실행하기 위한 완전 설치 가이드”**

````markdown
# 🚀 Mile-Stone 프로젝트 로컬 실행 가이드

이 문서는 **GitHub에서 클론한 후 처음 환경 설정할 때 필요한 모든 단계**를 설명합니다.  
프론트엔드(React + Vite)와 백엔드(Node.js + Express + MSSQL) 모두 포함되어 있습니다.

---

## 📦 1. 프로젝트 클론

```bash
git clone https://github.com/thdwlndjs/mile-stone.git
cd mile-stone
````

---

## ⚙️ 2. 필수 설치 프로그램

| 항목          | 최소 버전   | 확인 명령           |
| ----------- | ------- | --------------- |
| **Node.js** | 18.x 이상 | `node -v`       |
| **npm**     | 9.x 이상  | `npm -v`        |
| **Git**     | 2.x 이상  | `git --version` |

> ⚠️ Node.js v24.x도 호환됩니다.
> Windows 사용자라면 OneDrive가 아닌 일반 폴더(`C:\dev\mile-stone`)에 두는 걸 권장합니다.

---

## 🌐 3. 서버 설정 (백엔드)

### 이동

```bash
cd server
```

### 패키지 설치

```bash
npm install express cors dotenv mssql bcryptjs jsonwebtoken @postlight/parser node-fetch axios body-parser
```

### 환경 변수 설정

`.env` 파일을 `server` 폴더 안에 생성하고 다음 형식으로 작성합니다:

```env
PORT=3000
DB_USER=your_username
DB_PASSWORD=your_password
DB_SERVER=your_server.database.windows.net
DB_NAME=milestone
JWT_SECRET=your_secret_key
```

> ⚠️ `.env` 파일은 **절대 GitHub에 올리지 않습니다.**

### 실행

```bash
node server.js
```

정상 실행 시 콘솔에 👇 메시지가 뜹니다:

```
Server running on port 3000
Database connected successfully
```

---

## 💻 4. 클라이언트 설정 (프론트엔드)

### 이동

```bash
cd ..
```

또는 폴더 구조가 다음처럼 되어 있다면:

```
mile-stone/
 ┣ client/
 ┗ server/
```

```bash
cd client
```

### 패키지 설치

```bash
npm install vite @vitejs/plugin-react react react-dom
```

### 실행

```bash
npm run dev
```

정상 실행 시 콘솔에 👇 메시지가 표시됩니다:

```
VITE v5.x  ready in 300ms
Local:   http://localhost:5173/
```

---

## 🧩 5. 폴더 구조 예시

```
mile-stone/
 ┣ client/               # React + Vite 프론트엔드
 ┣ server/               # Node.js + Express 백엔드
 ┣ .gitignore
 ┣ package.json
 ┗ README.md
```

---

## 🧠 6. 자주 하는 질문 (FAQ)

**Q1. 왜 GitHub에서 받아도 npm install을 해야 하나요?**
A. `node_modules` 폴더는 `.gitignore`로 제외되어 GitHub에 올라가지 않습니다.
대신 `package.json`에 설치 정보가 기록되어 있습니다.
→ 따라서 **클론 후 반드시 `npm install`을 실행해야 합니다.**

**Q2. bcrypt 설치 에러가 납니다.**
A. Windows 환경에서는 `bcrypt` 대신 `bcryptjs`를 사용하세요.
(`server.js`의 import 문도 `bcryptjs`로 수정)

**Q3. “vite” 명령을 찾을 수 없다고 뜹니다.**
A. `npm install vite` 후 다시 `npm run dev`를 실행하세요.

---

## ✅ 7. 전체 설치 스크립트 (원클릭 버전)

아래 명령으로 프론트/백엔드 모두 한 번에 설치 가능합니다 👇

```bash
cd mile-stone
npm install -g vite
cd server && npm install express cors dotenv mssql bcryptjs jsonwebtoken @postlight/parser node-fetch axios body-parser && cd ..
cd client && npm install vite @vitejs/plugin-react react react-dom && cd ..
```

---

## 📖 8. 라이선스

MIT License
© 2025 Mile-Stone Project

```

---

이 README는 그대로 루트(`mile-stone/`) 폴더에 `README.md`로 추가하면 됩니다.  
원하시면 제가 이 내용을 **한국어 + 영어 병기 버전**으로도 만들어드릴까요?  
(예: 팀 협업용 공개 GitHub 리포지토리에 적합한 형태로)
```

