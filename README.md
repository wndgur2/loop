# Loop

스스로 남긴 피드백을 AI가 구조화·코칭해 **"되돌아보기"를 "목표 달성"으로 연결**하는 모바일 앱.

## 스택

- **클라이언트**: Expo (React Native) + TypeScript
- **백엔드**: Supabase (Postgres + Auth + Storage) — 별도 상시 서버 없음
- **서버 코드**: Supabase Edge Functions (서버리스) — Claude API 호출 담당
- **AI**: Claude API (Anthropic)

## 문서

- [documents/PRD-draft.md](documents/PRD-draft.md) — 제품 요구사항
- [documents/feature-spec.md](documents/feature-spec.md) — 기능 명세 (MVP 범위 · 시나리오 · 피드백 템플릿)
- [documents/data-model.md](documents/data-model.md) — 데이터 모델 (엔티티 · RLS)
- [documents/ai-coaching-spec.md](documents/ai-coaching-spec.md) — AI 코칭 스펙 (대화 흐름 · 출력 계약 · 회고)
- [documents/eval-rubric.md](documents/eval-rubric.md) — 코칭 품질 평가 기준
- [documents/branding.md](documents/branding.md) — 브랜딩 가이드 (정체성 · 보이스 · 비주얼)
- [CLAUDE.md](CLAUDE.md) — 개발 규약 · 아키텍처 · 에이전트 작업 가이드

## 시작하기

> 프로젝트 스캐폴딩 후 갱신 예정.

```bash
cp .env.example .env   # 값 채우기
npm install
npx expo start
```
