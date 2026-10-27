import type { CSSProperties } from "react";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiBarChartLine,
  RiBook2Line,
  RiCheckLine,
  RiCompass3Line,
  RiErrorWarningLine,
  RiHistoryLine,
  RiInboxLine,
  RiListUnordered,
  RiPauseLine,
  RiPlayFill,
  RiSearchLine,
  RiStockLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react";

export type IconName = "arrow" | "book" | "compass" | "chart" | "replay" | "check" | "stock" | "search" | "pause" | "play" | "prev" | "next" | "plus" | "user" | "list" | "time" | "alert" | "inbox";

const icons: Record<IconName, RemixiconComponentType> = {
  arrow: RiArrowRightLine,
  book: RiBook2Line,
  compass: RiCompass3Line,
  chart: RiBarChartLine,
  replay: RiHistoryLine,
  check: RiCheckLine,
  stock: RiStockLine,
  search: RiSearchLine,
  pause: RiPauseLine,
  play: RiPlayFill,
  prev: RiArrowLeftSLine,
  next: RiArrowRightSLine,
  plus: RiAddLine,
  user: RiUserLine,
  list: RiListUnordered,
  time: RiTimeLine,
  alert: RiErrorWarningLine,
  inbox: RiInboxLine,
};

/** Remix Icon 기반 공통 아이콘. 색은 글자색(currentColor)을 따른다. */
export default function Icon({ name, size = 22, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  const Glyph = icons[name];
  return <Glyph size={size} style={style} aria-hidden="true" />;
}
