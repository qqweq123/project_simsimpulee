---
title: "🎨 Mallow Wave 이미지 생성 가이드"
author: "AI Architect & General Engineer"
created_date: "2026-02-18"
last_updated: "2026-02-27"
status: "Active"
---

# 🎨 Mallow Wave 이미지 생성 가이드

이 프로젝트는 Google의 **Imagen 4 (Vertex AI / Gemini)** API를 사용하여 에셋을 생성합니다.

## 1. 사전 준비 (Prerequisites)

### A. Google API 키 발급
1. [Google AI Studio](https://aistudio.google.com/apikey) 접속.
2. `Create API key` 클릭.
3. 키 복사 후 안전한 곳에 보관.

### B. 환경 설정
프로젝트 루트에서 패키지 설치:
```bash
npm install @google/genai
```

## 2. 이미지 생성 절차 (Procedure)

### 단계 1: 스크립트 작성/수정
`scripts/generate_island_art.js` (또는 해당 기능의 스크립트)를 엽니다.
원하는 프롬프트와 모델을 설정합니다.

```javascript
const response = await ai.models.generateImages({
  model: 'imagen-4.0-fast-generate-001', // 'fast' (저렴) 또는 'generate-001' (고품질)
  prompt: '여기에_영어_프롬프트_입력',
  config: { numberOfImages: 1, aspectRatio: '1:1' }
});
```

### 단계 2: 실행 (Powershell)
보안을 위해 API 키는 **절대 코드에 저장하지 않고** 환경변수로 주입합니다.

```powershell
# 1. API 키 환경변수 설정 (일회성)
$env:GOOGLE_API_KEY="AIzaSy..."

# 2. 스크립트 실행
node scripts/generate_island_art.js
```

### 단계 3: 결과 확인
`src/assets/images/island/` (지정된 경로)에서 생성된 이미지를 확인합니다.

---

## 💡 팁 (Tips)
- **비용 절약**: 테스트 단계에서는 `imagen-4.0-fast-generate-001` ($0.02)을 사용하세요.
- **최종 품질**: 실서비스용은 `imagen-4.0-generate-001` ($0.04) 또는 `ultra` ($0.06)를 고려하세요.
- **보안**: `.env` 파일에 키를 저장할 수도 있지만, `.gitignore`에 포함되어 있는지 반드시 확인하세요.
