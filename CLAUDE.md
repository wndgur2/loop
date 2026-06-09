# CLAUDE.md

이 파일은 이 저장소에서 작업하는 coding agent(Claude Code 등)를 위한 안내서입니다.
사람과 에이전트 모두 작업을 시작하기 전에 이 문서를 먼저 읽습니다.

> 관련 문서: [PRD](documents/PRD.md) · [기능 명세](documents/feature-spec.md) · [브랜딩](documents/branding.md) · [데이터 모델](documents/data-model.md) · [Loopi 스펙](documents/loopi-spec.md) · [평가 기준](documents/eval-rubric.md)
> 이 문서는 "무엇을 만드는가"보다 "어떻게 작업하는가"에 집중합니다.

---

## 1. 제품 한 줄 요약

**Loop** — 스스로 남긴 피드백을 Loopi가 구조화해 "되돌아보기"를 "목표 달성"으로 연결하는 모바일 앱.

핵심 차별점은 **피드백 → 목표 달성, with AI**입니다. 단순 기록 도구가 아니라:
1. AI가 대화로 상황의 근본 원인과 실천항목을 끌어내고,
2. 피드백을 사용자의 커리어 목표에 정렬해 진척을 추적하며,
3. 미내재화 항목을 적시에 리마인드해 행동으로 잇습니다.

이 세 가지가 무너지면 제품의 의미가 없습니다. 기능을 만들 때 항상 이 가치에 닿는지 확인하세요.

---

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 클라이언트 | **Expo (React Native)** + TypeScript | iOS/Android 동시 지원 |
| 상태/데이터 | TanStack Query + (전역은 최소화) | 서버 상태는 Query로, 로컬 UI 상태만 컴포넌트/Zustand |
| 백엔드 | **Supabase** | Postgres + Auth + Storage + Realtime |
| AI | **Gemini (Google)** — 운영 기본 | **반드시 서버(Edge Function) 경유** — 키를 클라이언트에 두지 않음. 어댑터로 anthropic/openai도 교체 가능(`LLM_PROVIDER`) |
| 언어 | TypeScript (strict) | `any` 지양, 타입 우선 |
| i18n | 자체 경량 i18n(`lib/i18n.tsx`) | 한/영 토글, 기본 한국어. 문자열은 `lib/translations.ts`에 집중 |

> 위 스택을 벗어나는 의존성 추가는 임의로 하지 말고, 이유를 먼저 제시하고 합의하세요.
> AI 프로바이더는 어댑터(`supabase/functions/chat/llm/`)로 추상화돼 호출부는 프로바이더를 모릅니다. 운영 기본은 Gemini이며, 키를 가진 프로바이더만 설정합니다(§6).

---

## 3. 디렉토리 구조 (목표)

루트에는 **문서·공유 백엔드**만 두고, **플랫폼별 앱은 각자 디렉토리**로 분리한다. 현재 앱은 `mobile/`(Expo). 이후 다른 플랫폼(예: web)은 같은 `supabase/` 백엔드를 공유하는 형제 디렉토리로 추가한다.

```
loop/
├── CLAUDE.md            # 이 문서
├── documents/           # 제품·브랜드 문서 (PRD, 브랜딩, 데이터 모델, Loopi 스펙, 평가 기준)
├── adrs/                # 설계 결정 기록(ADR) — 0001 스캐폴딩 · 0002 백엔드 · 0003 MVP 클라 · 0004 스트리밍
├── demo/                # 디자인 정본(hi-fi 목업, React+CSS 웹) — 색/타입/컴포넌트 톤의 출처
├── .claude/skills/      # 프로젝트 전용 스킬 (supabase-migration, eval-loopi, react-native-expert)
├── evals/               # Loopi 품질 평가 루프 (시나리오 + 러너) — 플랫폼 공유
├── supabase/            # 공유 백엔드 (모든 플랫폼이 사용)
│   ├── migrations/      #   DB 스키마 (SQL) — RLS 필수 (init + grant_api_roles)
│   ├── functions/       #   Edge Functions — Loopi 대화 엔진
│   │   ├── _shared/     #     cors · 사용자 스코프 클라이언트(RLS) · 요청/응답 계약
│   │   └── chat/        #     핸들러 + llm/ 어댑터 + prompts/(버전관리) + tools/context
│   └── .env.example     #   서버 비밀값 템플릿 (LLM_PROVIDER, *_API_KEY 등 — 클라이언트 금지)
└── mobile/              # Expo 앱 (이 플랫폼)
    ├── app.json         #   앱 정체성 (Loop, com.loop.app)
    ├── eas.json         #   EAS 빌드 프로필 (development/preview/production)
    ├── .env.example     #   클라이언트 공개 값 템플릿 (EXPO_PUBLIC_*)
    ├── assets/          #   아이콘·스플래시·탭 아이콘 등 정적 자산 (app.json이 참조)
    └── src/
        ├── app/         #   Expo Router 화면 — (tabs)/ · chat/[mode] · feedback/[id]·new · onboarding · sign-in
        ├── components/  #   재사용 UI — themed-text/view, loop-mark, ui/(button·card·chip·ring·composer…)
        ├── features/    #   도메인별 묶음 (auth, feedback, goals, dashboard, reflect, chat)
        ├── lib/         #   supabase·query-client·query-keys, loopi(Edge 래퍼), i18n·translations, date
        ├── hooks/       #   공용 훅 (use-theme, use-color-scheme)
        ├── constants/   #   loop-theme(브랜드 토큰)·theme
        └── types/       #   database.ts(Supabase 생성) · models.ts(camelCase 도메인 + Row 매퍼)
```

> 앱 코드는 모두 `mobile/` 안에서 작업한다(npm 프로젝트 루트 = `mobile/`). 라우터 루트는 `mobile/src/app/`, 경로 alias `@/*` → `mobile/src/*`.
> `supabase/`·`evals/`·`documents/`·`demo/`는 플랫폼 공유라 루트에 둔다. 새 폴더/패턴을 만들기 전에 기존 컨벤션을 먼저 따르고, 큰 구조 변경은 `adrs/`에 짧게 근거를 남기세요.
> **하단 탭은 4개**: 피드백(홈, `index`) · 회고(`reflect`) · 인사이트(`insights`) · 설정(`settings`). UI 톤은 `demo/`를 기준으로 맞춘다.
> **DB↔앱 경계는 `types/models.ts`**: DB는 snake_case Row, 앱은 camelCase 모델. 매핑은 여기로 일원화하고 화면에서 raw Row를 다루지 마세요.

---

## 4. 개발 명령어

> Expo SDK 56 / React 19 / RN 0.85 / TypeScript 6 기준으로 스캐폴딩 완료.

```bash
# --- 앱(Expo): mobile/ 에서 실행 ---
cd mobile
npm install

# 개발 서버 — Android / iOS / web
npm run start          # 또는 npm run android / npm run ios / npm run web

# 타입 체크 / 린트 / 포맷
npm run typecheck      # tsc --noEmit
npm run lint           # expo lint (eslint-config-expo, flat config)
npm run format         # prettier --write . (.prettierignore로 *.md 제외)
npm run format:check   # prettier --check . (CI/검증용)

# 빌드 — EAS (eas.json: development / preview / production)
eas build --profile preview --platform android   # 예: 내부 배포 APK

# 테스트 — 아직 미설정 (jest-expo 도입 예정)

# --- 백엔드(Supabase): 저장소 루트에서 실행 (Supabase 연결 후) ---
supabase start
supabase functions serve --env-file supabase/functions/.env
deno check supabase/functions/chat/index.ts        # Edge Function 타입 체크
```

**작업을 마치기 전 반드시 `mobile/`에서 `typecheck`와 `lint`를 통과시키세요.** Edge Function을 건드렸다면 `deno check`도 통과시키세요. 실패하면 그 사실을 그대로 보고하고, 임의로 무시하거나 타입을 우회하지 마세요.

> 앱 실행 전 `mobile/.env.example`을 복사해 `mobile/.env`를 만들고 `EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY`를 채우세요(없으면 Supabase 사용 지점에서 에러). 서버 비밀값은 `supabase/.env.example` 참고. 키 관리는 §6.

---

## 5. 핵심 도메인 모델 (개념)

코드를 쓸 때 용어를 일관되게 사용하세요. 정본은 [데이터 모델](documents/data-model.md)·[기능 명세](documents/feature-spec.md).

- **Goal (최종 목표)** — 사용자의 커리어 최종 목표(MVP는 1개).
- **Sub-goal (하위 목표)** — 최종 목표를 구성하는 영역. **AI 추천 + 직접 추가**. 피드백의 `category` 역할을 한다.
- **Feedback** — 회고 1건(Canonical Template). `title`, `situation`, `rootCause`, `category`(=하위목표, 필수), `importance`, `tags[]`, `internalized`, `takeaways[]` 보유.
- **Takeaway** — 피드백에서 도출된 미래 행동/마음가짐. 항목별 `done` 추적.
- **Chat Session** — AI 대화. **작성(write)** = 새 피드백 도출 · **회고(retrospective)** = 하위목표 단위로 기존 피드백 되새김.
- **내재화율** = 내재화 피드백/전체 · **Takeaway 실행률** = done 항목/전체. 핵심 가치 지표이자 대시보드의 중심.

**category = 하위 목표**(고정 enum 없음, 사용자별 동적). 모든 피드백은 반드시 하나의 하위목표에 속한다. `importance`: `high | mid | low`.

---

## 6. 보안 · 프라이버시 (최우선)

자기 성찰 데이터는 **매우 민감**합니다. PRD의 신뢰 전제("내 데이터는 나만 본다")를 코드 수준에서 지킵니다.

- **LLM API 키(Anthropic/OpenAI/Gemini)·Supabase service role 키는 절대 클라이언트에 넣지 않습니다.** 모든 AI 호출은 Supabase Edge Function(`chat`)을 경유합니다. 프로바이더는 `LLM_PROVIDER` secret으로 고르고, 고른 프로바이더의 키만 설정합니다.
- **Loopi는 DB를 직접 바꾸지 않습니다.** Edge Function은 `proposal`만 반환하고, 클라이언트가 사용자 확인을 받아 RLS mutation으로 반영합니다(조용한 변경 금지).
- 비밀값은 `.env`/Edge Function secret으로 관리하고 **커밋하지 않습니다.** (`.env`는 `.gitignore`에 포함)
- Supabase는 **Row Level Security(RLS)를 모든 사용자 데이터 테이블에 활성화**합니다. 사용자는 자기 데이터만 읽고 씁니다.
- 로그·에러 메시지에 피드백 본문이나 개인정보를 남기지 않습니다.
- 외부로 데이터를 보내는 코드(분석, 서드파티)는 반드시 사전 합의 후 추가합니다.

---

## 7. 코딩 규약

- **TypeScript strict.** `any` 대신 정확한 타입. 외부 데이터는 경계에서 검증(zod 권장).
- **함수형·작은 컴포넌트.** 화면은 얇게, 로직은 `hooks`/`lib`로.
- **서버 상태는 TanStack Query**로 캐싱·동기화. 전역 상태 남발 금지.
- 주변 코드의 네이밍·주석 밀도·관용구를 따르세요. 새 스타일을 도입하지 마세요.
- 사용자 대면 텍스트는 1차 타깃이 국내라 한국어가 기본이지만, **하드코딩하지 말고 `lib/translations.ts`에 키를 추가**하고 `useT()`로 렌더하세요(한/영 토글 지원).
- DB Row(snake)와 앱 모델(camel) 변환은 `types/models.ts` 매퍼를 통해서만. 화면에서 raw Row를 직접 다루지 마세요.
- 커밋 메시지는 명확한 한 줄 요약 + 필요 시 본문. 의미 단위로 커밋.

---

## 8. 에이전트 작업 방식

- **PRD의 핵심 가치(2번)에 닿는지** 항상 점검하세요. 단순 CRUD로 끝나면 차별점이 사라집니다.
- 큰 작업은 먼저 계획을 제시하고, 불명확한 요구사항은 추측하지 말고 질문하세요.
- 변경 후에는 `typecheck`/`lint`/관련 테스트로 **실제 검증**하고, 결과를 솔직히 보고하세요. 실패는 실패로 보고합니다.
- Loopi 품질이 차별점이므로, **프롬프트는 `supabase/functions` 내에 모아 버전 관리**하고 임의로 흩뜨리지 마세요.
- 되돌리기 어려운 작업(배포, 데이터 삭제, 외부 전송)은 진행 전 확인을 받으세요.
- 설계상 중요한 결정은 `adrs/`에 짧게 ADR로 남기세요.

---

## 9. 미결 사항 (작업 시 인지)

PRD 11번 기준으로 아직 확정되지 않음 — 코드에서 하드코딩하지 말고 설정/추상화로 열어두세요.

- 가격대(월 구독 금액), 구독 상품 구성
- 온보딩에서 목표 설정 강제 여부
- 초기 타깃 직군을 PM/PO로 좁힐지

---

## 10. 다음 단계

기반 스캐폴딩은 완료(아래 ✅). 이어서 할 일:

- ✅ `git init` · `.gitignore`
- ✅ 플랫폼 분리 — 앱 코드는 `mobile/`, 루트는 문서·공유 백엔드(`supabase/`·`evals/`)
- ✅ Expo + TypeScript 스캐폴딩 (SDK 56, Expo Router, `mobile/src/app`)
- ✅ ESLint(flat)/Prettier/typecheck 스크립트 + 게이트 통과
- ✅ Supabase 클라이언트(`mobile/src/lib/supabase.ts`) · TanStack Query provider 배선 · 앱 정체성(Loop / `com.loop.app`)
- ✅ **로컬 Supabase 기동** + 초기 마이그레이션(profiles/goals/sub_goals/feedbacks/takeaways/chat_*) 적용 — 정본은 [데이터 모델](documents/data-model.md)
- ✅ 마이그레이션 후 `supabase gen types` → `mobile/src/types/database.ts` 재생성(실제 스키마 타입)
- ✅ Loopi Edge Function 골격 + 프롬프트 디렉토리([supabase/functions/README.md](supabase/functions/README.md)) — adr-0002
- ✅ **MVP 클라이언트**: 인증(F1)·온보딩·4탭(피드백/회고/인사이트/설정)·피드백 작성(직접·Loopi)·조회 — [adr-0003](adrs/adr-0003-mvp-client.md), web 프리뷰 실측 검증
- ✅ **LLM 프로바이더 어댑터** — gemini(기본)/anthropic/openai, `LLM_PROVIDER`로 교체 ([functions/README](supabase/functions/README.md))
- ✅ **Loopi 응답 SSE 스트리밍** — Edge Function·클라(`expo/fetch`) 토큰 단위, JSON 폴백 — [adr-0004](adrs/adr-0004-streaming.md)
- ✅ 이메일 확인 딥링크 인증 + Android EAS 빌드 설정(`eas.json`)
- ✅ 경량 i18n(한/영) · `grant_api_roles` 마이그레이션(anon/authenticated 테이블 권한)
- ☐ 운영 Supabase 프로젝트 연결(현재는 로컬) + 운영 LLM 키 secret 설정 + `chat` 함수 배포
- ☐ 다크 모드 토큰 · 음성 입력 · 목록 검색/필터 · 회고 랭킹 튜닝(feature-spec 남은 결정)
- ☐ 테스트 러너(jest-expo) 도입 → `npm test`
