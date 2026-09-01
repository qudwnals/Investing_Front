# Investing Front

개인 투자 관리 서비스의 React/Vite 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev
```

기본 접속 주소는 `http://localhost:5173`입니다. 백엔드 주소를 변경할 때는 `.env.example`을 참고해 로컬 `.env`를 만들고 `VITE_API_BASE_URL`을 설정합니다.

## 보안

- `.env`와 실제 API 키를 커밋하지 않습니다.
- Toss Client Secret과 OpenAI API 키는 프론트엔드 코드나 `VITE_` 환경변수에 넣지 않습니다.
- 커밋 전 `git diff --cached`로 민감정보를 확인합니다.
