


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
| Styling    | CSS               |
| Build      | PostCSS, Autoprefixer      |
| Deployment | Vercel or Firebase Hosting |

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

완료 후 다시 실행:

```bash
npm run dev
```

✅ 이제 React 18 + Vite 환경에서 안정적으로 작동합니다!

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

---

## 👩‍💻 제작자

> **Milestone Team**
> 📧 contact: [milestone@dev.com](mailto:milestone@dev.com)
> 🌐 [https://github.com/milestone](https://github.com/milestone)
