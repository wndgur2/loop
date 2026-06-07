/**
 * Supabase 스키마 타입 — 자동 생성 자리.
 *
 * 마이그레이션으로 테이블을 만든 뒤 아래로 재생성한다:
 *   supabase gen types typescript --local > src/types/database.ts
 *
 * 정본 스키마는 documents/data-model.md (profiles / goals / sub_goals /
 * feedbacks / takeaways / coaching_sessions / coaching_messages).
 * 아래는 생성 전 임시 빈 스키마 — 빌드가 통과하도록 둔 placeholder.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: { [key: string]: never };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
};
