/**
 * 회고 추천 카드 — 대화 시작 *전*에 떠야 하므로 서버 쿼리(여기선 클라이언트 계산)로 만든다.
 * 종류(feature-spec F9): 오늘의 되새김 · 또 반복됐어요 · 영역 통째 되짚기.
 * 랭킹 세부 가중치는 추후 튜닝(미결) — 진입·구조만 확정.
 */
import type { FeedbackWithTakeaways, Importance } from '@/types/models';

const IMPORTANCE_WEIGHT: Record<Importance, number> = { high: 3, mid: 2, low: 1 };

export type RetroCard =
  | { kind: 'today'; feedbackId: string; title: string; subGoalId: string; importance: Importance; days: number }
  | { kind: 'repeat'; subGoalId: string; count: number; samples: string[] }
  | { kind: 'area'; subGoalId: string; open: number; total: number; internalized: number };

function daysSince(iso: string): number {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return Number.isFinite(d) ? Math.max(0, d) : 0;
}

export function buildRetroCards(feedbacks: FeedbackWithTakeaways[]): RetroCard[] {
  const open = feedbacks.filter((f) => !f.internalized);
  const cards: RetroCard[] = [];

  // 1) 오늘의 되새김 — 미내재화 중 importance↑·오래됨↑ 단건
  const today = [...open].sort((a, b) => {
    const w = IMPORTANCE_WEIGHT[b.importance] - IMPORTANCE_WEIGHT[a.importance];
    if (w !== 0) return w;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  })[0];
  if (today) {
    cards.push({
      kind: 'today',
      feedbackId: today.id,
      title: today.title,
      subGoalId: today.subGoalId,
      importance: today.importance,
      days: daysSince(today.createdAt),
    });
  }

  // 2) 또 반복됐어요 — 같은 하위목표에서 열린 고리 2개+
  const openBySub = new Map<string, FeedbackWithTakeaways[]>();
  for (const f of open) {
    const arr = openBySub.get(f.subGoalId) ?? [];
    arr.push(f);
    openBySub.set(f.subGoalId, arr);
  }
  const repeat = [...openBySub.entries()]
    .filter(([sub, arr]) => arr.length >= 2 && sub !== today?.subGoalId)
    .sort((a, b) => b[1].length - a[1].length)[0];
  if (repeat) {
    cards.push({
      kind: 'repeat',
      subGoalId: repeat[0],
      count: repeat[1].length,
      samples: repeat[1].slice(0, 2).map((f) => f.title),
    });
  }

  // 3) 영역 통째 되짚기 — 열린 고리가 가장 많은 하위목표
  const allBySub = new Map<string, { total: number; internalized: number; open: number }>();
  for (const f of feedbacks) {
    const b = allBySub.get(f.subGoalId) ?? { total: 0, internalized: 0, open: 0 };
    b.total += 1;
    if (f.internalized) b.internalized += 1;
    else b.open += 1;
    allBySub.set(f.subGoalId, b);
  }
  const usedSubs = new Set(cards.map((c) => c.subGoalId));
  const area = [...allBySub.entries()]
    .filter(([sub, b]) => b.open >= 1 && !usedSubs.has(sub))
    .sort((a, b) => b[1].open - a[1].open)[0];
  if (area) {
    cards.push({ kind: 'area', subGoalId: area[0], open: area[1].open, total: area[1].total, internalized: area[1].internalized });
  }

  return cards;
}
