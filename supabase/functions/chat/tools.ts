import type { SessionMode } from '../_shared/types.ts';

/**
 * One tool per mode (loopie-spec.md §4 write · §9 retrospective).
 * input_schema maps 1:1 to loopie-spec's structured-output contract.
 */

const createFeedbackTool = {
  name: 'create_feedback',
  description:
    'Call this once the conversation has matured and the root cause and Takeaways are settled. Creates one feedback entry (Canonical Template). ' +
    "category must be one of the user's sub-goals (required, do not create new categories).",
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Feedback title' },
      situation: { type: 'string', description: 'Situation description (## Feedback)' },
      root_cause: { type: 'string', description: "Root cause derived from the conversation (in the user's words)" },
      category: { type: 'string', description: "Name of one of the user's sub-goals (required)" },
      importance: { type: 'string', enum: ['high', 'mid', 'low'] },
      tags: { type: 'array', items: { type: 'string' }, description: '1–5 items' },
      takeaways: {
        type: 'array',
        description: '2–3 recommended. Must be measurable/actionable',
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
    'Call this to update the state of existing feedback from a retrospective conversation. Handles marking internalized / toggling takeaway done / editing or adding resolution text ' +
    'via parameters. Does not create new feedback (new situations go through write mode).',
  input_schema: {
    type: 'object',
    properties: {
      feedback_id: { type: 'string', description: 'Target feedback id' },
      internalized: { type: 'boolean', description: 'Change the internalized-complete mark (optional)' },
      takeaway_updates: {
        type: 'array',
        description: 'List of takeaway changes (optional)',
        items: {
          type: 'object',
          properties: {
            takeaway_id: { type: 'string', description: 'If absent, add as new' },
            text: { type: 'string', description: 'Edit/add resolution text' },
            done: { type: 'boolean', description: 'Toggle action complete' },
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
