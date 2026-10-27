import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Icon from "../components/Icon";
import HomeLearning from "../components/HomeLearning";
import SiteFooter from "../components/SiteFooter";

/** 포털형 메인: 안내 배너, 통합 검색, 학습 현황판과 실제 학습 콘텐츠. */
export default function HomePage() {
  const notice = (useLocation().state as { notice?: string } | null)?.notice;
  return (
    <div className="app-page home-page">
      <Header />
      {notice && <p className="home-notice" role="status">{notice}</p>}
      <MainVisual />
      <main className="home-main">
        <HomeSearch />
        <HomeLearning />
      </main>
      <SiteFooter />
    </div>
  );
}

// 배너 문구는 실제로 제공하는 기능만 설명한다. 이용자 수·후기·수익률 같은 수치는 넣지 않는다.
const SLIDES = [
  { tag: "입문 과정", title: ["증권업의 구조부터", "파생상품까지 순서대로"], description: "증권과 금융기관에서 시작해 주식·채권·펀드·ETF를 거쳐 선물·옵션까지, 단계별로 나눠 읽어요.", to: "/course", action: "입문 과정 보기" },
  { tag: "용어 사전", title: ["PER부터 공매도까지,", "금융 용어를 한곳에서"], description: "정의·계산식·예시를 출처와 함께 확인해요. 용어 이름을 몰라도 문장으로 물으면 뜻이 가까운 용어를 찾아 줘요.", to: "/glossary", action: "용어 사전 보기" },
  { tag: "모의투자", title: ["금리와 비중을 바꾸면", "결과가 어떻게 달라질까요"], description: "상품 구조와 시장 충격을 직접 바꿔 보며 금리·환율·수수료의 영향을 나눠 봐요. 실제 시세를 예측하지 않습니다.", to: "/practice", action: "모의투자 열기" },
  { tag: "차트 복기", title: ["그 시점의 정보만 보고", "판단을 연습해요"], description: "합성 데이터로 만든 차트를 한 구간씩 열며 판단의 근거를 기록하고 돌아봐요. 실제 종목·매매와 관계없습니다.", to: "/replay", action: "차트 복기 보기" },
];
const SLIDE_INTERVAL_MS = 7000;

/** 안내 배너. 자동으로 넘기되 일시정지할 수 있고, 마우스·키보드가 머무는 동안과 동작 줄이기 설정에서는 멈춘다. */
function MainVisual() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const [holding, setHolding] = useState(false);
  const slide = SLIDES[index];
  const move = (step: number) => setIndex(value => (value + step + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused || holding) return;
    const timer = window.setTimeout(() => setIndex(value => (value + 1) % SLIDES.length), SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, holding]);

  return (
    <section
      className="main-visual"
      aria-roledescription="carousel"
      aria-label="FinMATE 주요 안내"
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
      onFocus={() => setHolding(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHolding(false); }}
    >
      <h1 id="home-title" className="sr-only">FinMATE 금융 학습</h1>
      <div className="main-visual-inner">
        <div className="main-visual-copy" aria-live={paused ? "polite" : "off"}>
          <div key={slide.tag} className="main-visual-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${SLIDES.length}`}>
            <span className="main-visual-tag">{slide.tag}</span>
            <h2>{slide.title[0]}<br />{slide.title[1]}</h2>
            <p>{slide.description}</p>
          </div>
          <div className="main-visual-controls">
            <div className="main-visual-pager">
              <span><strong>{String(index + 1).padStart(2, "0")}</strong><i aria-hidden="true" />{String(SLIDES.length).padStart(2, "0")}</span>
              <button type="button" onClick={() => move(-1)} aria-label="이전 안내"><Icon name="prev" size={16} /></button>
              <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "자동 넘김 시작" : "자동 넘김 멈춤"}><Icon name={paused ? "play" : "pause"} size={15} /></button>
              <button type="button" onClick={() => move(1)} aria-label="다음 안내"><Icon name="next" size={16} /></button>
            </div>
            <Link className="btn btn-primary main-visual-action" to={slide.to}>{slide.action} <Icon name="next" size={15} /></Link>
          </div>
        </div>
        <div className="main-visual-art">
          <img src="/images/finance-campus.webp" width="1536" height="1024" fetchPriority="high" alt="커다란 오렌지색 책과 계단으로 이루어진 금융 캠퍼스에서 함께 공부하는 세 사람" />
        </div>
      </div>
    </section>
  );
}

// 처음 보는 분께 권하는 용어. 인기 순위가 아니므로 '자주 찾는'이라고 쓰지 않는다.
const SUGGESTED_TERMS = [
  { slug: "per", label: "PER" },
  { slug: "etf", label: "ETF" },
  { slug: "compound-interest", label: "복리" },
  { slug: "short-selling", label: "공매도" },
  { slug: "dividend", label: "배당" },
  { slug: "market-cap", label: "시가총액" },
];

/** 용어 사전으로 바로 보내는 통합 검색. 용어 이름이나 궁금한 내용을 문장으로 받는다. */
function HomeSearch() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = value.trim();
    navigate(q ? `/glossary?q=${encodeURIComponent(q)}` : "/glossary");
  };
  return (
    <section className="home-search" aria-label="금융 용어 검색">
      <form role="search" onSubmit={submit}>
        <label className="sr-only" htmlFor="home-search-input">금융 용어나 궁금한 내용</label>
        <input id="home-search-input" type="search" value={value} onChange={event => setValue(event.target.value)} placeholder="어떤 금융 용어가 궁금한가요? 예: 빌린 돈으로 주식을 사는 것" />
        <button type="submit" aria-label="용어 찾기"><Icon name="search" size={24} /></button>
      </form>
      <p className="home-search-suggest">
        <span>추천 용어</span>
        {SUGGESTED_TERMS.map(term => <Link key={term.slug} to={`/glossary/${term.slug}`}>{term.label}</Link>)}
      </p>
    </section>
  );
}
