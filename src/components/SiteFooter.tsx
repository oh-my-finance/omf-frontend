import { Link } from "react-router-dom";
import Brand from "./Brand";

const FOOTER_LINKS = [
  { to: "/course", label: "입문 과정" },
  { to: "/learn", label: "개념 학습" },
  { to: "/glossary", label: "용어 사전" },
  { to: "/practice", label: "모의투자" },
  { to: "/replay", label: "차트 복기" },
  { to: "/models", label: "콘텐츠·모델 안내" },
];

/** 공통 푸터: 바로가기 줄, 서비스 소개, 교육 서비스 고지. */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="footer-links" aria-label="하단 바로가기">
        <div className="site-footer-inner">
          {FOOTER_LINKS.map(link => <Link key={link.to} to={link.to}>{link.label}</Link>)}
        </div>
      </nav>
      <div className="site-footer-inner footer-body">
        <Brand compact />
        <div className="footer-info">
          <p><strong>FinMATE</strong> 증권업의 구조와 금융상품을 순서대로 배우는 교육용 학습 서비스</p>
          <p>FinMATE는 금융 교육 서비스입니다. 실제 매매·종목 추천·투자 자문을 제공하지 않습니다. 용어 설명의 출처는 각 항목에 표시합니다.</p>
          <p className="footer-copy">© {new Date().getFullYear()} FinMATE. Learn at your own pace.</p>
        </div>
        <button type="button" className="footer-top-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          맨 위로 <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
