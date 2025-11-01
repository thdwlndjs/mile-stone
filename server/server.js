import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

let users = []; // 실제 환경에서는 DB를 사용하세요.

app.post('/api/signup', async (req, res) => {
  const { email, hashedPassword, salt } = req.body;

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
  }

  // 서버에서 추가 해싱 (bcrypt)
  const doubleHashed = await bcrypt.hash(hashedPassword, 10);

  users.push({ email, hash: doubleHashed, salt });
  console.log('가입된 사용자 목록:', users);

  res.json({ message: '회원가입 성공', email });
});

app.listen(4000, () => console.log('✅ 서버 실행 중: http://localhost:4000'));
