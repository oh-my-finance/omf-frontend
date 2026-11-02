import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

/** 화면마다 같은 문장을 쓰도록 기본 고지 문구를 한 곳에 둔다(NFR-03, 출시 점검 P1-1). */
export const EDUCATION_NOTICE_TEXT = "교육용 예시이며 투자 권유·자문이 아닙니다.";

type Props = {
  /** 화면별로 덧붙일 가정·한계(예: 합성 데이터, 예시 상품). 기본 문구 뒤에 이어 붙인다. */
  children?: ReactNode;
  className?: string;
};

/**
 * 화면 단위 교육 목적 고지. 결과·상품·복기·탐색처럼 투자 판단 자료로 오해할 수 있는 화면에 붙인다.
 * 약관 제6조(교육 목적 서비스 · 투자 권유 아님)로 이어지는 링크를 함께 둔다.
 */
export default function EducationNotice({ children, className }: Props) {
  return (
    <aside className={`edu-notice${className ? ` ${className}` : ""}`} aria-label="교육 목적 고지">
      <Icon name="book" size={18} />
      <p>
        <strong>학습용 화면</strong>{" "}
        {EDUCATION_NOTICE_TEXT}
        {children ? <> {children}</> : null}{" "}
        <Link to="/terms#education-only">이용약관 제6조</Link>
      </p>
    </aside>
  );
}
