# StageReady

프레젠테이션 준비를 위한 종합 도구 - PWA 지원

## 기능

- 🎤 **목 풀기**: 발성 워밍업, 호흡 훈련, 발음 연습
- ✅ **체크리스트**: 발표 전 준비사항 관리
- 📝 **발표 노트**: 구조화된 발표 내용 정리
- 🎙️ **음성 녹음**: 실시간 전사 및 말하기 속도 분석
- 💾 **자동 저장**: LocalStorage로 작업 내용 자동 보존
- 📱 **PWA 지원**: 모바일 홈 화면에 추가 가능

## 로컬 실행

**필수 요구사항:** Node.js

1. 의존성 설치:
   ```bash
   npm install
   ```

2. PWA 아이콘 생성:
   ```bash
   npm run generate-icons
   ```
   또는 브라우저에서 `public/generate-icons.html` 열어서 아이콘 다운로드

3. 개발 서버 실행:
   ```bash
   npm run dev
   ```

4. 브라우저에서 `http://localhost:3000` 접속

## 빌드 및 배포

프로덕션 빌드:
```bash
npm run build
```

빌드 미리보기:
```bash
npm run preview
```

## PWA 설치

1. 지원 브라우저(Chrome, Edge, Safari 등)에서 앱 접속
2. 주소창의 설치 아이콘 클릭 또는 메뉴에서 "홈 화면에 추가" 선택
3. 앱이 독립 실행형으로 설치됨

## 기술 스택

- React 19
- TypeScript (strict mode)
- Vite
- Tailwind CSS
- Web Speech API (무료 전사)
- vite-plugin-pwa
