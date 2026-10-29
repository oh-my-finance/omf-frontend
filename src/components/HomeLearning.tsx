import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { CourseView, GlossaryCategory, GlossaryTerm } from "../api/types";
import { useAuth } from "../context/AuthContext";
import Icon, { type IconName } from "./Icon";

const COURSE_ID = "securities-intro";

const TERM_CHOICES = [
  { slug: "per", label: "PER" },
  { slug: "etf", label: "ETF" },
  { slug: "compound-interest", label: "복리" },
];

const QUICK_LINKS: { to: string; icon: IconName; label: string; description: string; login?: { description: string } }[] = [
  { to: "/course", icon: "book", label: "입문 과정", description: "단계별 기초" },
  { to: "/learn", icon: "compass", label: "개념 학습", description: "구조와 확인 문제" },
  { to: "/glossary", icon: "list", label: "용어 사전", description: "정의·계산식·예시" },
  { to: "/practice", icon: "chart", label: "모의투자", description: "금리·비중 실험" },
  { to: "/replay", icon: "replay", label: "차트 복기", description: "판단 연습" },
  { to: "/start", icon: "user", label: "성향 진단", description: "로그인 후 이용", login: { description: "투자 성향 확인" } },
];

/** 메인 현황판(내 학습·바로가기·용어 노트)과 실제 과정 목차·분야별 용어. */
export default function HomeLearning() {
  return (
    <>
      <section className="home-domain-links" aria-label="로드맵과 시장 관찰">
        <Link to="/roadmap"><strong>내 성향에 맞는 교과서</strong><span>공통 기초부터 성향별 집중 학습·확인 문제까지</span><span aria-hidden="true">→</span></Link>
        <Link to="/market"><strong>금리·환율·주식 차트</strong><span>실제 시장 자료의 출처와 기준일을 함께 확인</span><span aria-hidden="true">→</span></Link>
      </section>
      <section className="home-dashboard" aria-label="학습 현황과 바로가기">
        <AccountBox />
        <QuickMenu />
        <TermNote />
      </section>
      <CourseSection />
      <CategorySection />
    </>
  );
}

/** 로그인 전에는 로그인 안내, 로그인 후에는 실제 입문 과정 진척을 보여 준다. */
function AccountBox() {
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseView | null>(null);

  useEffect(() => {
    if (!user) return;
    let current = true;
    api.getCourseProgress(COURSE_ID).then(data => { if (current) setCourse(data); }).catch(() => { /* 진척은 보조 정보라 실패해도 안내만 보인다. */ });
    return () => { current = false; };
  }, [user]);

  if (!user) {
    return (
      <section className="home-box home-account" aria-labelledby="home-account-title">
        <h2 id="home-account-title" className="home-box-title">내 학습</h2>
        <div className="home-account-intro">
          <span className="home-account-icon"><Icon name="user" size={26} /></span>
          <p>로그인하면 <strong>입문 과정 진척</strong>과 <strong>확인 문제 기록</strong>을 이어서 볼 수 있어요.</p>
        </div>
        <Link className="btn btn-primary btn-block home-account-login" to="/login" state={{ from: "/me" }}>로그인</Link>
        <p className="home-account-links">
          <Link to="/login" state={{ tab: "signup" }}>회원가입</Link>
          <Link to="/course">입문 과정 미리 보기</Link>
        </p>
      </section>
    );
  }

  const progress = course?.progress;
  return (
    <section className="home-box home-account" aria-labelledby="home-account-title">
      <h2 id="home-account-title" className="home-box-title">{user.name} 님의 학습</h2>
      {progress ? (
        <div className="home-account-progress">
          <p><strong>{progress.passed}</strong> / {progress.total} 개념 통과</p>
          <div className="bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-label="입문 과정 진척"><i style={{ width: `${progress.percent}%` }} /></div>
          {progress.next
            ? <Link to={`/learn?concept=${encodeURIComponent(progress.next.slug)}`}>다음 개념 · {progress.next.title} <Icon name="next" size={14} /></Link>
            : <span>입문 과정의 모든 개념을 통과했어요.</span>}
        </div>
      ) : <p className="home-account-empty">입문 과정 진척을 불러오는 중…</p>}
      <div className="home-account-actions">
        <Link className="btn btn-primary" to="/me">내 학습 기록</Link>
        <Link className="btn btn-secondary" to="/history">진단 이력</Link>
      </div>
    </section>
  );
}

function QuickMenu() {
  const { user } = useAuth();
  return (
    <section className="home-box home-quick" aria-labelledby="home-quick-title">
      <h2 id="home-quick-title" className="home-box-title">바로가기</h2>
      <nav className="home-quick-grid" aria-label="학습 바로가기">
        {QUICK_LINKS.map(link => (
          <Link key={link.to} to={link.login && !user ? "/login" : link.to} state={link.login && !user ? { from: link.to } : undefined}>
            <Icon name={link.icon} size={26} />
            <strong>{link.label}</strong>
            <span>{link.login && user ? link.login.description : link.description}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}

/** 처음 보는 분께 권하는 용어 세 개를 한 장씩 넘겨 본다. */
function TermNote() {
  const [index, setIndex] = useState(0);
  const choice = TERM_CHOICES[index];
  const move = (step: number) => setIndex(value => (value + step + TERM_CHOICES.length) % TERM_CHOICES.length);
  return (
    <section className="home-box home-term" aria-labelledby="home-term-title">
      <div className="home-box-head">
        <h2 id="home-term-title" className="home-box-title">추천 용어 노트</h2>
        <div className="home-term-pager">
          <button type="button" onClick={() => move(-1)} aria-label="이전 용어"><Icon name="prev" size={14} /></button>
          <span aria-live="polite">{index + 1} / {TERM_CHOICES.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="다음 용어"><Icon name="next" size={14} /></button>
        </div>
      </div>
      <TermExcerpt key={choice.slug} slug={choice.slug} />
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

  if (error) return <p className="home-excerpt-state">지금은 용어 설명을 불러올 수 없습니다. <Link to={`/glossary/${slug}`}>용어 페이지에서 확인하기</Link></p>;
  if (!term) return <p className="home-excerpt-state" role="status">용어 설명을 불러오는 중…</p>;

  return (
    <div className="home-term-body">
      <h3>{term.term}{term.fullName && term.fullName !== term.term && <small>{term.fullName}</small>}</h3>
      <p>{term.definition}</p>
      {term.formula && <p className="home-term-formula">{term.formula}</p>}
      <div className="home-term-foot"><span>출처 · {term.sourceName}</span><Link to={`/glossary/${term.slug}`}>자세히 보기 <Icon name="plus" size={13} /></Link></div>
    </div>
  );
}

/** 공개 입문 과정의 실제 단계·개념 목차. 단계 선택은 진척률이 아니라 과정의 순서다. */
function CourseSection() {
  const [course, setCourse] = useState<CourseView | null>(null);
  const [error, setError] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    api.getCourse(COURSE_ID)
      .then(data => { if (current) setCourse(data); })
      .catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, []);

  const stage = course?.stages.find(item => item.id === selectedStageId) ?? course?.stages[0];
  const conceptCount = course?.stages.reduce((sum, item) => sum + item.concepts.length, 0);

  return (
    <section className="home-section" aria-labelledby="home-course-title">
      <div className="home-section-head">
        <div>
          <h2 id="home-course-title"><em>입문 과정</em> 단계별 목차</h2>
          <p>{course ? `${course.title} · ${course.stages.length}단계 ${conceptCount}개 개념` : "증권업 입문 과정"}</p>
        </div>
        <Link to="/course">전체 과정 <Icon name="plus" size={14} /></Link>
      </div>

      <div className="home-course">
        {error ? <p className="home-excerpt-state" role="status">지금은 목차를 불러올 수 없습니다. <Link to="/course">전체 과정에서 다시 확인하기</Link></p>
          : !course ? <p className="home-excerpt-state" role="status">과정 목차를 불러오는 중…</p>
            : stage ? (
              <>
                <div className="home-stage-tabs" role="group" aria-label="입문 과정 단계">
                  {course.stages.map((item, index) => (
                    <button key={item.id} type="button" aria-pressed={stage.id === item.id} onClick={() => setSelectedStageId(item.id)}>
                      <span>{index + 1}단계</span>{item.title}
                    </button>
                  ))}
                </div>
                <div className="home-stage-body">
                  <p className="home-stage-goal"><strong>학습 목표</strong>{stage.goal}</p>
                  <table className="home-curriculum-table">
                    <caption className="sr-only">{stage.title} 학습 목차</caption>
                    <thead><tr><th scope="col">순서</th><th scope="col">학습 주제</th><th scope="col">확인 문제</th><th scope="col"><span className="sr-only">바로가기</span></th></tr></thead>
                    <tbody>
                      {stage.concepts.map((concept, index) => (
                        <tr key={concept.slug}>
                          <td className="home-table-order">{index + 1}</td>
                          <th scope="row"><Link to={`/learn?concept=${encodeURIComponent(concept.slug)}`}><strong>{concept.title}</strong><span>{concept.summary}</span></Link></th>
                          <td className="home-table-number">{concept.quizCount}문항</td>
                          <td className="home-table-go"><Link to={`/learn?concept=${encodeURIComponent(concept.slug)}`} aria-label={`${concept.title} 학습하기`}>학습하기</Link></td>
                        </tr>
                      ))}
                      {stage.concepts.length === 0 && <tr><td colSpan={4} className="home-table-empty">이 단계에는 현재 공개된 개념이 없습니다.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <p className="home-excerpt-state" role="status">현재 공개된 단원이 없습니다.</p>}
      </div>
    </section>
  );
}

/** 용어 사전의 실제 분야와 분야별 용어 수. */
function CategorySection() {
  const [categories, setCategories] = useState<GlossaryCategory[] | null>(null);

  useEffect(() => {
    let current = true;
    api.getGlossaryCategories()
      .then(data => { if (current) setCategories([...data.categories].sort((a, b) => a.order - b.order)); })
      .catch(() => { if (current) setCategories([]); });
    return () => { current = false; };
  }, []);

  if (categories && categories.length === 0) return null;
  const total = categories?.reduce((sum, item) => sum + item.termCount, 0);

  return (
    <section className="home-section" aria-labelledby="home-category-title">
      <div className="home-section-head">
        <div>
          <h2 id="home-category-title"><em>분야별</em> 금융 용어</h2>
          <p>{categories ? `${categories.length}개 분야 · ${total}개 용어` : "용어 분야를 불러오는 중…"}</p>
        </div>
        <Link to="/glossary">용어 사전 <Icon name="plus" size={14} /></Link>
      </div>
      {categories && (
        <ul className="home-category-grid">
          {categories.map(item => (
            <li key={item.id}>
              <Link to={`/glossary?category=${encodeURIComponent(item.id)}`} title={item.description}>
                <strong>{item.name}</strong>
                <span>{item.termCount}개 용어</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
