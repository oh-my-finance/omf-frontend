import { useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";

/** 경로별 탭 제목. 스크린리더와 브라우저 기록에서 화면을 구분할 수 있게 한다. 먼저 맞는 항목을 쓴다. */
const TITLES: [string, string][] = [
  ["/", "증권업과 금융상품 학습"],
  ["/login", "로그인"],
  ["/course", "증권업 입문 과정"],
  ["/roadmap", "성향별 학습 로드맵"],
  ["/market", "금리·환율·주식 차트"],
  ["/learn", "개념 학습"],
  ["/glossary/:slug", "용어 상세"],
  ["/glossary", "주식 용어 사전"],
  ["/practice", "모의투자"],
  ["/replay/:sessionId", "차트 복기 진행"],
  ["/replay", "차트 복기"],
  ["/models", "모델 실험실"],
  ["/start", "성향 진단 시작"],
  ["/diagnosis", "성향 진단"],
  ["/result/:assessmentId", "진단 결과"],
  ["/explore/:assessmentId", "탐색 카테고리"],
  ["/product/:productId", "상품 상세"],
  ["/history", "진단 이력"],
  ["/me", "내 학습"],
  ["/settings", "계정 설정"],
  ["/admin/*", "콘텐츠 관리"],
];

export default function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const found = TITLES.find(([pattern]) => matchPath({ path: pattern, end: true }, pathname));
    document.title = `${found ? found[1] : "페이지를 찾을 수 없습니다"} · FinMATE`;
  }, [pathname]);
  return null;
}
