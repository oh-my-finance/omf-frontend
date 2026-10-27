import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";

/** 없는 주소. 조용히 홈으로 보내면 링크가 깨졌는지 알 수 없으므로 안내하고 갈 곳을 보여 준다. */
export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="app-page">
      <Header />
      <main className="practice-main not-found">
        <span className="eyebrow">404</span>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="intro-copy">
          <code>{pathname}</code> 주소에 해당하는 화면이 없습니다. 주소가 바뀌었거나 잘못 입력되었을 수 있습니다.
        </p>
        <div className="action-row">
          <Link className="btn btn-primary" to="/">홈으로</Link>
          <Link className="btn btn-secondary" to="/course">입문 과정</Link>
          <Link className="btn btn-secondary" to="/learn">개념 학습</Link>
        </div>
      </main>
    </div>
  );
}
