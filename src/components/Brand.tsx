import { Link } from "react-router-dom";

/** 펼쳐진 책과 함께 걷는 두 사람을 표현한 FinMATE 워드마크. */
export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="FinMATE 홈">
      <svg className="brand-symbol" width="35" height="35" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path d="M5 13c5-2 9 0 13 4v15C14 28 10 27 5 28V13Z" fill="currentColor" />
        <path d="M31 13c-5-2-9 0-13 4v15c4-4 8-5 13-4V13Z" fill="currentColor" opacity=".7" />
        <circle cx="11" cy="7" r="4" fill="currentColor" />
        <circle cx="25" cy="7" r="4" fill="currentColor" opacity=".7" />
      </svg>
      <span className="brand-name">fin<span>mate</span><i>.</i></span>
      {!compact && <span className="brand-caption">나의 첫 금융 메이트</span>}
    </Link>
  );
}
