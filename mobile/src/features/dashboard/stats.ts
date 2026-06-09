/** Dashboard/home derived metrics — computed from all feedbacks (data-model §5). */
import type { FeedbackWithTakeaways, Importance } from '@/types/models';

export interface FeedbackStats {
  total: number;
  internalized: number;
  /** 0..1 */
  internalizationRate: number;
  takeawayTotal: number;
  takeawayDone: number;
  /** 0..1 */
  takeawayRate: number;
  byImportance: Record<Importance, number>;
  /** subGoalId → count/internalized */
  bySubGoal: Record<string, { count: number; internalized: number }>;
  /** Tag frequency (descending) */
  tagFrequency: { tag: string; count: number }[];
}

export function computeStats(feedbacks: FeedbackWithTakeaways[]): FeedbackStats {
  const total = feedbacks.length;
  let internalized = 0;
  let takeawayTotal = 0;
  let takeawayDone = 0;
  const byImportance: Record<Importance, number> = { high: 0, mid: 0, low: 0 };
  const bySubGoal: Record<string, { count: number; internalized: number }> = {};
  const tagCounts: Record<string, number> = {};

  for (const f of feedbacks) {
    if (f.internalized) internalized += 1;
    byImportance[f.importance] += 1;

    const bucket = (bySubGoal[f.subGoalId] ??= { count: 0, internalized: 0 });
    bucket.count += 1;
    if (f.internalized) bucket.internalized += 1;

    for (const t of f.takeaways) {
      takeawayTotal += 1;
      if (t.done) takeawayDone += 1;
    }
    for (const tag of f.tags) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  }

  const tagFrequency = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    internalized,
    internalizationRate: total ? internalized / total : 0,
    takeawayTotal,
    takeawayDone,
    takeawayRate: takeawayTotal ? takeawayDone / takeawayTotal : 0,
    byImportance,
    bySubGoal,
    tagFrequency,
  };
}
