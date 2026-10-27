import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
import HomeLearning from "../components/HomeLearning";
import { useAuth } from "../context/AuthContext";

/** 브랜드 소개 뒤에 실제 학습 콘텐츠를 바로 보여 준다. */
export default function HomePage() {
  const { user } = useAuth();
  const notice = (useLocation().state as { notice?: string } | null)?.notice;
  return (
    <div className="app-page home-page">
      <Header />
      <main className="home-main">
        {notice && <p className="home-notice" role="status">{notice}</p>}
        <section className="home-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <span className="hero-label"><Icon name="book" size={16} /> FinMATE · 금융 공부방</span>
            <h1 id="home-title">나의 첫 금융 공부</h1>
            <p className="hero-description">주식과 채권의 기초부터 하나씩 알아봐요.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/course">입문 과정 시작하기 <Icon name="arrow" size={18} /></Link>
              <Link className="hero-secondary" to={user ? "/start" : "/login"} state={user ? undefined : { from: "/start" }}>내 투자 성향 알아보기 <span aria-hidden="true">↗</span></Link>
            </div>
            <p className="hero-note">입문 과정과 용어 사전은 로그인 없이 읽을 수 있습니다.</p>
            <FirstQuestion />
          </div>
          <div className="hero-art">
            <div className="hero-art-orbit" aria-hidden="true" />
            <span className="hero-art-note"><Icon name="spark" size={16} />작은 이해가 만드는 큰 변화</span>
            <img src="/images/finance-campus.webp" width="1536" height="1024" fetchPriority="high" alt="커다란 오렌지색 책과 계단으로 이루어진 금융 캠퍼스에서 함께 공부하는 세 사람" />
            <span className="hero-art-caption">YOUR FIRST FINANCE MATE</span>
          </div>
        </section>

        <HomeLearning />
      </main>
      <footer className="site-footer"><div className="site-footer-inner"><div className="footer-top"><Brand compact /><p>금융을 이해하는 나만의 속도, FinMATE와 함께.</p><Link to="/models" className="footer-model-link">콘텐츠·모델 안내</Link><a href="#home-title">맨 위로 ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} FinMATE. Learn at your own pace.</span><p>FinMATE는 금융 교육 서비스입니다. 실제 매매·종목 추천·투자 자문을 제공하지 않습니다.</p></div></div></footer>
    </div>
  );
}

const FIRST_QUESTIONS = [
  { slug: "stocks", label: "주식", question: "주식을 사면 무엇을 갖게 될까요?", description: "회사의 일부를 소유한다는 뜻부터 살펴봐요." },
  { slug: "bonds", label: "채권", question: "채권은 주식과 무엇이 다를까요?", description: "돈을 빌려주고 돌려받는 약속을 알아봐요." },
  { slug: "etf", label: "ETF", question: "ETF에는 무엇이 담겨 있을까요?", description: "여러 자산을 담은 펀드가 거래되는 구조를 알아봐요." },
];

/** 작은 질문을 고르고 바로 해당 개념을 읽을 수 있는 시작점. */
function FirstQuestion() {
  const [selectedSlug, setSelectedSlug] = useState(FIRST_QUESTIONS[0].slug);
  const selected = FIRST_QUESTIONS.find(item => item.slug === selectedSlug) ?? FIRST_QUESTIONS[0];
  return (
    <section className="hero-question" aria-labelledby="hero-question-title">
      <div className="hero-question-head">
        <h2 id="hero-question-title">먼저, 궁금한 것부터</h2>
        <div className="hero-question-choices" role="group" aria-label="먼저 읽어 볼 주제">
          {FIRST_QUESTIONS.map(item => <button type="button" key={item.slug} aria-pressed={selectedSlug === item.slug} onClick={() => setSelectedSlug(item.slug)}>{item.label}</button>)}
        </div>
      </div>
      <div className="hero-question-content" aria-live="polite">
        <Link to={`/learn?concept=${selected.slug}`}><strong>{selected.question}</strong><Icon name="arrow" size={18} /></Link>
        <p>{selected.description}</p>
      </div>
    </section>
  );
}
