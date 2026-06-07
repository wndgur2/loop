import type { Lang } from './translations';

/** 상대 시간 — "오늘/어제/N일 전/N주 전" · "today/yesterday/Nd ago/Nw ago". */
export function relativeTime(iso: string, lang: Lang = 'ko'): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  const locale = lang === 'en' ? 'en-US' : 'ko-KR';

  if (lang === 'en') {
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 28) return `${Math.floor(days / 7)}w ago`;
    return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  }

  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (days < 28) return `${Math.floor(days / 7)}주 전`;
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** 절대 날짜 — "2026년 5월 29일" · "May 29, 2026". */
export function fullDate(iso: string, lang: Lang = 'ko'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const locale = lang === 'en' ? 'en-US' : 'ko-KR';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}
