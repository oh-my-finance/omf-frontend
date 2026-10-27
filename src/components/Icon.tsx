import type { CSSProperties, ReactNode } from "react";

export type IconName = "arrow" | "book" | "compass" | "chart" | "replay" | "check" | "spark";

/** 작은 화면에서도 선 굵기가 일정한 공통 아이콘. */
export default function Icon({ name, size = 22, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    book: <><path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2V4Z" /><path d="m6 8 3 1m6 0 3-1M6 12l3 1m6 0 3-1" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6 6-2Z" /></>,
    chart: <><path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4" /><path d="m6 7 5-4" /></>,
    replay: <><path d="M3 10a9 9 0 1 1 1.5 7M3 4v6h6" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
