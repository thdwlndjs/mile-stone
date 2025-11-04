import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import sql from 'mssql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Parser from '@postlight/parser';

// .env 파일 로드
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Azure SQL DB 연결 설정
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Azure SQL에 필요
    trustServerCertificate: false,
  },
};

// DB 풀(Pool) 생성
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ SQL DB에 연결되었습니다.');
    return pool;
  })
  .catch(err => console.error('❌ DB 연결 실패:', err));

// --- Gemini API 호출 헬퍼 함수 ---
/**
 * @param {string} apiKey - .env에서 가져온 API 키
 * @param {string} prompt - Gemini에게 보낼 프롬프트
 * @returns {Promise<string>} Gemini의 텍스트 응답
 */
const fetchGeminiResponse = async (apiKey, prompt) => {
  // 사용 모델: gemini-2.5-flash-preview-09-2025
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    // (선택사항) 안전 설정
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API Error (HTTP ${response.status}):`, errorBody);
      throw new Error(`Gemini API 요청 실패 (HTTP ${response.status})`);
    }

    const result = await response.json();
    
    // 응답 구조 확인 및 텍스트 추출
    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini API의 응답 형식이 예상과 다릅니다:', JSON.stringify(result, null, 2));
      throw new Error('Gemini API로부터 유효한 텍스트 응답을 받지 못했습니다.');
    }
  } catch (err) {
    console.error('Gemini API 호출 중 에러:', err);
    throw err; // 오류를 상위로 전파
  }
};


// --- 회원가입 API ---
//  email, password, name을 받음
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: '이메일, 비밀번호, 이름을 모두 입력하세요.' });
  }

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    // KST 저장을 위해 DATEADD(hour, 9, GETUTCDATE()) 사용
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, hashedPassword)
      .input('name', sql.NVarChar, name)
      .query(`
        INSERT INTO users (email, password_hash, name, created_at, updated_at) 
        VALUES (@email, @password_hash, @name, DATEADD(hour, 9, GETUTCDATE()), DATEADD(hour, 9, GETUTCDATE()))
      `);

    res.status(201).json({ message: '회원가입 성공!' });

  } catch (err) {
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    console.error('Signup Error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// --- 로그인 API ---
//  email과 password로 로그인
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    // KST 저장을 위해 DATEADD(hour, 9, GETUTCDATE()) 사용
    await pool.request()
      .input('user_id', sql.Int, user.user_id) 
      .query('UPDATE users SET updated_at = DATEADD(hour, 9, GETUTCDATE()) WHERE user_id = @user_id');

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: '로그인 성공', token, name: user.name });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// --- 이메일 중복 확인 API ---
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: '이메일을 입력하세요.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT 1 FROM users WHERE email = @email');

    if (result.recordset.length > 0) {
      // 이메일이 이미 존재함
      res.status(200).json({ isAvailable: false, message: '이미 사용 중인 이메일입니다.' });
    } else {
      // 이메일 사용 가능
      res.status(200).json({ isAvailable: true, message: '사용 가능한 이메일입니다.' });
    }
  } catch (err) {
    console.error('Check Email Error:', err);
    res.status(500).json({ message: '이메일 확인 중 서버 오류가 발생했습니다.' });
  }
});


// --- 기사 파싱 및 AI 요약 API ---
app.post('/api/parse', async (req, res) => {
  const { urlToParse } = req.body;
  const apiKey = process.env.API_KEY1; // .env에서 API 키 로드

  if (!urlToParse) {
    return res.status(400).json({ message: '파싱할 URL이 필요합니다.' });
  }
  if (!apiKey) {
    console.error('API_KEY1이 .env 파일에 설정되지 않았습니다.');
    return res.status(500).json({ message: '서버 설정 오류: API 키가 없습니다.' });
  }

  try {
    // 1. @postlight/parser로 기사 스크랩
    const parsedData = await Parser.parse(urlToParse);
    
    if (!parsedData.content) {
      return res.status(500).json({ message: '기사 본문을 스크랩하지 못했습니다.' });
    }
    
    // 2. 스크랩한 '본문(content)'을 Gemini API로 전송하여 요약
    const summaryPrompt = `다음은 뉴스 기사의 본문입니다. 이 기사의 핵심 내용을 한국어로 상세하게 요약해 주세요. 원본 기사의 스타일과 어조를 반영하되, 명확하고 간결하게 정리해 주세요:\n\n${parsedData.content}`;
    
    const geminiSummary = await fetchGeminiResponse(apiKey, summaryPrompt);

    // 3. 스크랩한 원본 데이터 + Gemini 요약본을 React로 전송
    res.json({
      title: parsedData.title,
      author: parsedData.author,
      date_published: parsedData.date_published,
      domain: parsedData.domain,
      excerpt: parsedData.excerpt, // Parser가 생성한 짧은 요약
      geminiSummary: geminiSummary // Gemini가 생성한 AI 요약
    });

  } catch (err) {
    console.error('파싱 또는 요약 오류:', err);
    res.status(500).json({ message: '기사를 처리하는 중 오류가 발생했습니다.' });
  }
});

// --- [신규] Gemini 채팅 API ---
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body; // 사용자의 질문(message), AI 요약본(context)
  const apiKey = process.env.API_KEY1; // .env에서 API 키 로드

  if (!message || !context) {
    return res.status(400).json({ message: '질문과 기사 요약본이 필요합니다.' });
  }
  if (!apiKey) {
    console.error('API_KEY1이 .env 파일에 설정되지 않았습니다.');
    return res.status(500).json({ message: '서버 설정 오류: API 키가 없습니다.' });
  }

  try {
    // 1. Gemini에게 보낼 프롬프트 구성
    const chatPrompt = `
      당신은 뉴스 기사 전문 챗봇입니다.
      다음은 사용자가 읽고 있는 기사의 '핵심 요약본'입니다:
      ---
      ${context}
      ---
      
      이 요약본의 내용을 바탕으로 사용자의 다음 질문에 대해 친절하고 명확하게 한국어로 답변해주세요.
      요약본에 없는 내용은 추측하지 말고, 요약본을 근거로만 답변해야 합니다.

      사용자 질문: "${message}"
    `;

    // 2. Gemini API 호출
    const geminiReply = await fetchGeminiResponse(apiKey, chatPrompt);

    // 3. Gemini의 답변을 React로 전송
    res.json({ reply: geminiReply });

  } catch (err) {
    console.error('채팅 API 오류:', err);
    res.status(500).json({ message: 'AI와 대화하는 중 오류가 발생했습니다.' });
  }
});


app.listen(4000, () => console.log('✅ 서버 실행 중: http://localhost:4000'));