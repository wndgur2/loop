import type { SessionMode } from '../_shared/types.ts';

/**
 * 모드당 툴 1개 (loopi-spec.md §4 작성 · §9 회고).
 * input_schema는 loopi-spec의 구조화 출력 계약과 1:1.
 */

const createFeedbackTool = {
  name: 'create_feedback',
  description:
    '대화가 무르익어 근본 원인과 Takeaways가 정리되면 호출한다. 피드백 1건(Canonical Template)을 만든다. ' +
    'category는 사용자의 하위 목표 중 하나여야 한다(필수, 새 분류 생성 금지).',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '피드백 제목' },
      situation: { type: 'string', description: '상황 설명 (## Feedback)' },
      root_cause: { type: 'string', description: '대화로 도출된 근본 원인 (사용자 언어로)' },
      category: { type: 'string', description: '사용자의 하위 목표 중 하나의 이름 (필수)' },
      importance: { type: 'string', enum: ['high', 'mid', 'low'] },
      tags: { type: 'array', items: { type: 'string' }, description: '1~5개' },
      takeaways: {
        type: 'array',
        description: '2~3개 권장. 측정/행동 가능해야 함',
        items: {
          type: 'object',
          properties: { text: { type: 'string' } },
          required: ['text'],
        },
      },
    },
    required: ['title', 'situation', 'root_cause', 'category', 'importance', 'tags', 'takeaways'],
  },
} as const;

const retrospectiveTool = {
  name: 'update_feedback',
  description:
    '회고 대화로 기존 피드백의 상태를 갱신할 때 호출한다. 내재화 표시 / takeaway done 토글 / 다짐 텍스트 수정·추가를 ' +
    '파라미터로 처리한다. 새 피드백을 만들지 않는다(새 상황은 작성 모드에서).',
  input_schema: {
    type: 'object',
    properties: {
      feedback_id: { type: 'string', description: '대상 피드백 id' },
      internalized: { type: 'boolean', description: '내재화 완료 표시 변경 (선택)' },
      takeaway_updates: {
        type: 'array',
        description: 'takeaway 변경 목록 (선택)',
        items: {
          type: 'object',
          properties: {
            takeaway_id: { type: 'string', description: '없으면 신규 추가' },
            text: { type: 'string', description: '다짐 텍스트 수정/추가' },
            done: { type: 'boolean', description: '실행 완료 토글' },
          },
        },
      },
    },
    required: ['feedback_id'],
  },
} as const;

export function toolForMode(mode: SessionMode) {
  return mode === 'write' ? createFeedbackTool : retrospectiveTool;
}
