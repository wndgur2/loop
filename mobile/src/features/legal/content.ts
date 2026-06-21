/**
 * In-app legal documents (privacy policy / terms of service), per language.
 * Google Play's User Data policy requires a privacy policy link or text within
 * the app itself; this module is the in-app text. The hosted markdown source
 * for the Play Console URL lives in documents/legal/ at the repo root —
 * keep the two in sync when editing.
 */
import type { Lang } from '@/lib/translations';

export type LegalDocId = 'privacy' | 'terms';

export type LegalSection = { heading: string; body: string };

export type LegalDocContent = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

const CONTACT_EMAIL = 'dkandjsl@gmail.com';

const ko: Record<LegalDocId, LegalDocContent> = {
  privacy: {
    title: '개인정보처리방침',
    updated: '시행일: 2026년 6월 11일',
    sections: [
      {
        heading: '1. 수집하는 정보',
        body: 'Loop는 서비스 제공에 필요한 최소한의 정보만 수집해요.\n\n· 계정 정보: 이메일 주소, 이름(선택)\n· 사용자가 작성한 콘텐츠: 피드백(상황·근본 원인·실천항목), 목표·하위 목표, Loopie와의 대화 내용\n\n광고·분석 SDK를 사용하지 않으며, 위치·연락처·기기 식별자 등은 수집하지 않아요.',
      },
      {
        heading: '2. 정보를 사용하는 목적',
        body: '수집한 정보는 다음 목적에만 사용해요.\n\n· 계정 생성·로그인 등 서비스 제공\n· Loopie(AI)가 피드백을 구조화하고 회고를 돕는 핵심 기능 제공\n· 내재화율 등 나만 보는 통계 제공\n\nLoop는 개인정보를 판매하지 않으며, 광고 목적으로 사용하지 않아요.',
      },
      {
        heading: '3. AI 처리에 대한 안내',
        body: 'Loopie와의 대화 내용은 AI 응답 생성을 위해 AI 모델 제공자(기본: Google Gemini)에 전송돼요. 전송은 암호화된 연결로 Loop의 서버를 경유하며, AI 제공자의 API 약관에 따라 처리돼요. 부적절한 AI 답변은 앱 안에서 길게 눌러 신고할 수 있고, 신고 내용은 품질 개선에 사용돼요.',
      },
      {
        heading: '4. 제3자 제공 및 처리 위탁',
        body: '서비스 운영을 위해 다음 처리자에게 데이터 처리를 위탁해요.\n\n· Supabase: 데이터베이스·인증 호스팅\n· AI 모델 제공자(기본: Google Gemini): AI 응답 생성을 위한 대화 내용 처리\n\n그 외 제3자에게 개인정보를 제공하지 않아요.',
      },
      {
        heading: '5. 보안',
        body: '모든 데이터는 전송 시 암호화(TLS)되고, 데이터베이스는 행 수준 보안(RLS)으로 본인 계정만 자신의 데이터에 접근할 수 있도록 강제돼요. AI API 키 등 비밀값은 서버에만 보관해요.',
      },
      {
        heading: '6. 보관 및 삭제',
        body: '데이터는 계정이 유지되는 동안 보관되고, 계정을 삭제하면 계정·피드백·목표·대화 등 모든 데이터가 즉시 영구 삭제돼요.\n\n· 앱 안에서: 설정 → 계정 → 계정 삭제\n· 앱 밖에서: 아래 연락처로 삭제를 요청하면 확인 후 처리해 드려요.',
      },
      {
        heading: '7. 아동의 개인정보',
        body: 'Loop는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지 않아요.',
      },
      {
        heading: '8. 문의 및 변경 고지',
        body: `개인정보 관련 문의: ${CONTACT_EMAIL}\n\n이 방침이 바뀌면 앱 내 고지로 알려 드리고, 시행일을 갱신해요.`,
      },
    ],
  },
  terms: {
    title: '이용약관',
    updated: '시행일: 2026년 6월 11일',
    sections: [
      {
        heading: '1. 서비스 소개',
        body: 'Loop는 스스로 남긴 피드백을 AI(Loopie)가 구조화해 목표 달성으로 연결하는 자기 회고 서비스예요. 이 약관은 Loop 앱 이용에 적용돼요.',
      },
      {
        heading: '2. 계정',
        body: '계정은 본인만 사용해야 하며, 로그인 정보를 안전하게 관리할 책임은 이용자에게 있어요. 설정에서 언제든지 계정을 삭제할 수 있어요.',
      },
      {
        heading: '3. 허용되지 않는 사용',
        body: '다음 행위는 금지돼요.\n\n· 법령 위반, 타인의 권리 침해\n· 서비스·AI를 악용한 유해 콘텐츠 생성 시도\n· 서비스의 보안을 우회하거나 시스템에 부하를 주는 행위',
      },
      {
        heading: '4. AI 답변의 한계',
        body: 'Loopie의 답변은 AI가 생성하며 부정확하거나 부적절할 수 있어요. Loopie는 의료·심리 상담, 위기 개입, 진단을 제공하지 않아요. 중요한 결정은 답변에만 의존하지 말고 스스로 판단해 주세요. 부적절한 답변은 앱 안에서 신고할 수 있어요.',
      },
      {
        heading: '5. 콘텐츠 권리',
        body: '이용자가 작성한 피드백·목표·대화의 권리는 이용자에게 있어요. Loop는 서비스 제공(저장, AI 처리, 통계 표시)에 필요한 범위에서만 콘텐츠를 처리해요.',
      },
      {
        heading: '6. 서비스 변경과 책임',
        body: '서비스는 사전 고지 후 변경되거나 중단될 수 있어요. 법이 허용하는 범위에서, Loop는 무료 제공 기능에 대해 간접 손해에 책임지지 않아요.',
      },
      {
        heading: '7. 약관 변경 및 문의',
        body: `약관이 바뀌면 앱 내 고지로 알려 드려요. 이 약관은 대한민국 법을 따르며, 문의는 ${CONTACT_EMAIL}로 보내 주세요.`,
      },
    ],
  },
};

const en: Record<LegalDocId, LegalDocContent> = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Effective: June 11, 2026',
    sections: [
      {
        heading: '1. What we collect',
        body: 'Loop collects only what the service needs.\n\n· Account: email address, name (optional)\n· Content you create: feedback (situation, root cause, takeaways), goals and sub-goals, conversations with Loopie\n\nWe use no advertising or analytics SDKs, and we do not collect location, contacts, or device identifiers.',
      },
      {
        heading: '2. How we use it',
        body: 'Your data is used only to:\n\n· Provide the service (account creation, sign-in)\n· Power the core feature — Loopie (AI) structuring your feedback and guiding reflection\n· Show private statistics such as your internalization rate\n\nLoop does not sell personal data and does not use it for advertising.',
      },
      {
        heading: '3. AI processing',
        body: 'Your conversations with Loopie are sent to an AI model provider (default: Google Gemini) to generate replies. They travel over encrypted connections via Loop’s server and are handled under the provider’s API terms. You can report an inappropriate AI reply in the app by long-pressing it; reports are used to improve quality.',
      },
      {
        heading: '4. Sharing and processors',
        body: 'We rely on these processors to run the service:\n\n· Supabase: database and authentication hosting\n· AI model provider (default: Google Gemini): processes conversation content to generate replies\n\nWe share personal data with no other third parties.',
      },
      {
        heading: '5. Security',
        body: 'All data is encrypted in transit (TLS), and row-level security in the database ensures each account can access only its own data. Secrets such as AI API keys are kept server-side only.',
      },
      {
        heading: '6. Retention and deletion',
        body: 'Data is kept while your account exists. Deleting your account immediately and permanently deletes everything — account, feedback, goals, and conversations.\n\n· In the app: Settings → Account → Delete account\n· Outside the app: request deletion at the contact below and we will verify and process it.',
      },
      {
        heading: '7. Children',
        body: 'Loop is not directed at children under 14 and does not knowingly collect their personal data.',
      },
      {
        heading: '8. Contact and changes',
        body: `Privacy inquiries: ${CONTACT_EMAIL}\n\nIf this policy changes, we will notify you in the app and update the effective date.`,
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: 'Effective: June 11, 2026',
    sections: [
      {
        heading: '1. The service',
        body: 'Loop is a self-reflection service where AI (Loopie) structures the feedback you give yourself and connects it to your goals. These terms govern your use of the Loop app.',
      },
      {
        heading: '2. Your account',
        body: 'Your account is for your use only, and you are responsible for keeping your credentials safe. You can delete your account at any time in Settings.',
      },
      {
        heading: '3. Unacceptable use',
        body: 'You must not:\n\n· Break the law or infringe the rights of others\n· Attempt to misuse the service or its AI to generate harmful content\n· Circumvent security or overload the system',
      },
      {
        heading: '4. Limits of AI replies',
        body: 'Loopie’s replies are AI-generated and may be inaccurate or inappropriate. Loopie does not provide medical or psychological counseling, crisis intervention, or diagnosis. Do not rely on replies alone for important decisions. You can report inappropriate replies in the app.',
      },
      {
        heading: '5. Your content',
        body: 'You own the feedback, goals, and conversations you create. Loop processes your content only as needed to provide the service (storage, AI processing, statistics).',
      },
      {
        heading: '6. Changes and liability',
        body: 'The service may change or be discontinued with prior notice. To the extent the law allows, Loop is not liable for indirect damages arising from free features.',
      },
      {
        heading: '7. Updates and contact',
        body: `If these terms change, we will notify you in the app. These terms are governed by the laws of the Republic of Korea. Contact: ${CONTACT_EMAIL}.`,
      },
    ],
  },
};

export const LEGAL_DOCS: Record<Lang, Record<LegalDocId, LegalDocContent>> = { ko, en };
