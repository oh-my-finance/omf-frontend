import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client";
import type { CourseView, GlossaryTerm } from "../api/types";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const TERM_CHOICES = [
  { slug: "per", label: "PER" },
  { slug: "etf", label: "ETF" },
  { slug: "compound-interest", label: "복리" },
];

/** 본문에는 과정·실습을, 보조 열에는 용어와 내 학습 진입을 모은다. */
export default function HomeLearning() {
  const { user } = useAuth();
  const { hash } = useLocation();
  const [selectedTerm, setSelectedTerm] = useState(TERM_CHOICES[0].slug);

  // SPA를 처음 열어도 학습 영역의 직접 링크가 헤더 아래에 맞춰진다.
  useEffect(() => {
    if (hash === "#home-reading-title") {
      document.getElementById("home-reading-title")?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [hash]);

  return (
    <section className="home-reading" aria-labelledby="home-reading-title">
      <div className="home-reading-head">
        <div className="home-reading-title"><span className="home-eyebrow">학습 포털</span><h2 id="home-reading-title">금융 학습 한눈에 보기</h2><p>입문부터 실습까지, 궁금한 곳에서 시작하세요.</p></div>
        <Link to="/learn">개념 전체 보기 <Icon name="arrow" size={16} /></Link>
      </div>
      <div className="home-board">
        <div className="home-board-main">
          <CourseOverview />
          <section className="home-panel home-tools" aria-labelledby="home-tools-title">
            <div className="home-panel-head"><h3 id="home-tools-title">실습·복습 도구</h3><span>학습한 내용 직접 확인하기</span></div>
            <nav className="home-tool-list" aria-label="학습 도구">
              <Link to="/learn"><span className="home-tool-symbol is-map"><Icon name="compass" size={25} /></span><div><h4>개념 지도</h4><p>주식·채권·ETF의 구조를 연결해서 보기</p></div><span className="home-tool-arrow"><Icon name="arrow" size={17} /></span></Link>
              <Link to="/practice"><span className="home-tool-symbol is-lab"><Icon name="chart" size={25} /></span><div><h4>모의 실험</h4><p>금리와 비중을 바꾸고 포트폴리오 결과 비교하기</p></div><span className="home-tool-arrow"><Icon name="arrow" size={17} /></span></Link>
              <Link to="/replay"><span className="home-tool-symbol is-replay"><Icon name="replay" size={25} /></span><div><h4>차트 복기</h4><p>합성 차트를 한 구간씩 열고 판단의 근거 기록하기</p></div><span className="home-tool-arrow"><Icon name="arrow" size={17} /></span></Link>
            </nav>
          </section>
        </div>

        <aside className="home-sidebar" aria-label="금융 용어와 학습 바로가기">
          <section className="home-dictionary" aria-labelledby="home-dictionary-title">
            <div className="home-dictionary-head">
              <h3 id="home-dictionary-title"><Icon name="book" size={17} />금융 용어 노트</h3>
              <Link to="/glossary">전체 보기 <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-term-choices" role="group" aria-label="미리 볼 금융 용어">
              {TERM_CHOICES.map(choice => (
                <button key={choice.slug} type="button" aria-pressed={selectedTerm === choice.slug} onClick={() => setSelectedTerm(choice.slug)}>
                  {choice.label}
                </button>
              ))}
            </div>
            <div className="home-term-content" aria-live="polite">
              <TermExcerpt key={selectedTerm} slug={selectedTerm} />
            </div>
          </section>

          <section className="home-sidebar-links" aria-labelledby="home-shortcuts-title">
            <h3 id="home-shortcuts-title">학습 바로가기</h3>
            <nav aria-label="진단과 모델 안내">
              <Link to="/start"><span>투자 성향 진단</span><Icon name="arrow" size={16} /></Link>
              <Link to="/history"><span>나의 진단 이력</span><Icon name="arrow" size={16} /></Link>
              <Link to="/models"><span>모델 설명과 평가 기준</span><Icon name="arrow" size={16} /></Link>
            </nav>
          </section>

          <section className="home-sidebar-account" aria-labelledby="home-records-title">
            <div className="home-account-heading"><span><Icon name="check" size={17} /></span><h3 id="home-records-title">내 학습 기록</h3></div>
            <p>{user ? `${user.name} 님의 과정 진척과 다시 볼 개념을 확인하세요.` : "로그인하면 과정 진척과 확인 문제 기록을 모아 볼 수 있습니다."}</p>
            <Link className="btn btn-secondary" to={user ? "/me" : "/login"} state={user ? undefined : { from: "/me" }}>
              {user ? "학습 기록 보기" : "로그인하고 기록 남기기"}
            </Link>
          </section>
        </aside>
      </div>
    </section>
  );
}

function CourseOverview() {
  const [course, setCourse] = useState<CourseView | null>(null);
  const [error, setError] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    api.getCourse("securities-intro")
      .then(data => { if (current) setCourse(data); })
      .catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, []);

  const stage = course?.stages.find(item => item.id === selectedStageId) ?? course?.stages[0];
  const conceptCount = course?.stages.reduce((sum, item) => sum + item.concepts.length, 0);
  const stageIndex = course?.stages.findIndex(item => item.id === stage?.id) ?? 0;

  return (
    <section className="home-panel home-course-overview" aria-labelledby="home-course-title">
      <div className="home-course-heading">
        <span className="home-course-symbol"><Icon name="book" size={27} /></span>
        <div className="home-course-intro">
          <div className="home-panel-head"><h3 id="home-course-title">{course?.title ?? "증권업 입문 과정"}</h3><Link to="/course">전체 과정 <span aria-hidden="true">↗</span></Link></div>
          <p className="home-panel-description">{course?.summary ?? "증권과 금융기관부터 주식·채권·파생상품까지 순서대로 배우는 과정입니다."}</p>
          {course && <p className="home-course-meta"><span><strong>{course.stages.length}</strong>단계</span><span><strong>{conceptCount}</strong>개 개념</span><span>기초부터 차근차근</span></p>}
        </div>
      </div>

      {error ? <p className="home-excerpt-state" role="status">지금은 목차를 불러올 수 없습니다. <Link to="/course">전체 과정에서 다시 확인하기 →</Link></p> : !course ? <p className="home-excerpt-state" role="status">과정 목차를 불러오는 중…</p> : stage ? (
        <>
          <div className="home-stage-choices" role="group" aria-label="입문 과정 단계">
            {course.stages.map((item, index) => <button key={item.id} type="button" aria-pressed={stage.id === item.id} onClick={() => setSelectedStageId(item.id)}>
              <span className="home-stage-marker">{String(index + 1).padStart(2, "0")}</span><span className="home-stage-label">{item.title}<small>{item.concepts.length}개 개념</small></span>
            </button>)}
          </div>
          <div className="home-stage-caption"><h4><span>{String(stageIndex + 1).padStart(2, "0")}</span>{stage.title}</h4><span>{stage.concepts.length}개 학습 주제</span></div>
          <table className="home-curriculum-table">
            <caption className="sr-only">{stage.title} 학습 목차</caption>
            <thead><tr><th scope="col">순서</th><th scope="col">학습 주제</th><th scope="col" className="home-table-number">확인 문제</th></tr></thead>
            <tbody>
              {stage.concepts.map((concept, index) => <tr key={concept.slug}>
                <td className="home-table-order"><span>{String(index + 1).padStart(2, "0")}</span></td>
                <th scope="row"><Link to={`/learn?concept=${encodeURIComponent(concept.slug)}`}><strong>{concept.title}</strong><span>{concept.summary}</span></Link></th>
                <td className="home-table-number">{concept.quizCount}<span>개</span></td>
              </tr>)}
              {stage.concepts.length === 0 && <tr><td colSpan={3} className="home-table-empty">이 단계에는 현재 공개된 개념이 없습니다.</td></tr>}
            </tbody>
          </table>
          <p className="home-stage-goal"><Icon name="check" size={17} /><strong>학습 목표</strong><span>{stage.goal}</span></p>
        </>
      ) : <p className="home-excerpt-state" role="status">현재 공개된 단원이 없습니다.</p>}
    </section>
  );
}

function TermExcerpt({ slug }: { slug: string }) {
  const [term, setTerm] = useState<GlossaryTerm | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let current = true;
    api.getGlossaryTerm(slug)
      .then(data => { if (current) setTerm(data); })
      .catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, [slug]);

  if (error) return <div className="home-excerpt-state"><p>지금은 용어 설명을 불러올 수 없습니다.</p><Link to={`/glossary/${slug}`}>용어 페이지에서 다시 확인하기 →</Link></div>;
  if (!term) return <p className="home-excerpt-state" role="status">용어 설명을 불러오는 중…</p>;

  return (
    <>
      <div className="home-term-name"><h4>{term.term}</h4>{term.fullName && term.fullName !== term.term && <span>{term.fullName}</span>}</div>
      <p className="home-term-definition">{term.definition}</p>
      {term.formula && <p className="home-term-formula">{term.formula}</p>}
      {term.example && <div className="home-term-example"><h5>예시</h5><p>{term.example}</p></div>}
      <div className="home-term-foot"><span>출처 · {term.sourceName}</span><Link to={`/glossary/${term.slug}`}>설명과 주의점 <Icon name="arrow" size={15} /></Link></div>
    </>
  );
}
