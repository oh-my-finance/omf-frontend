import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { CourseStatus, RoadmapResponse } from "../api/types";
import Header from "../components/Header";
import LoadError from "../components/LoadError";
import SiteFooter from "../components/SiteFooter";
import SubPageHeader from "../components/SubPageHeader";
import { useAuth } from "../context/AuthContext";

const STATUS_LABEL: Record<CourseStatus, string> = {
  NOT_STARTED: "시작 전",
  IN_PROGRESS: "복습 필요",
  PASSED: "통과",
};

/** 진단은 학습 순서를 정하고, 이해 여부는 실제 확인 문제 기록으로 표시한다. */
export default function RoadmapPage() {
  const { user, checkingSession } = useAuth();
  const [result, setResult] = useState<{ key: string; data: RoadmapResponse | null; error: string | null } | null>(null);
  const [reload, setReload] = useState(0);
  const requestKey = `${user?.id ?? "public"}:${checkingSession}:${reload}`;

  useEffect(() => {
    let current = true;
    if (checkingSession) return;
    const load = user ? api.getMyRoadmap() : api.getRoadmap();
    load.then(value => { if (current) setResult({ key: requestKey, data: value, error: null }); })
      .catch(() => { if (current) setResult({ key: requestKey, data: null, error: "학습 로드맵을 불러오지 못했습니다." }); });
    return () => { current = false; };
  }, [user, checkingSession, requestKey]);

  const data = result?.key === requestKey ? result.data : null;
  const error = result?.key === requestKey ? result.error : null;
  const course = data?.course;
  const progress = course?.progress;

  return (
    <div className="app-page">
      <Header />
      <SubPageHeader
        section="learning"
        current="/roadmap"
        title="성향별 학습 로드맵"
        description="공통 기초를 읽고, 내 성향에서 먼저 살필 주제로 이어갑니다. 개념마다 설명·출처·확인 문제를 함께 제공합니다."
        actions={<Link className="btn btn-secondary" to="/learn">개념 전체 보기</Link>}
      />
      <main className="practice-main course-main roadmap-main">
        {error && <LoadError message={error} onRetry={() => setReload(value => value + 1)} />}
        {!data && !error && <p className="subtle" role="status">학습 로드맵을 불러오는 중…</p>}
        {data && course && <>
          <section className="card roadmap-basis" aria-label="로드맵 기준">
            <span className="eyebrow">{data.basis ? `${data.basis.profileLabel} · 집중 학습` : "처음 시작 · 공통 기초"}</span>
            <h2>{course.title}</h2>
            <p>{data.reason}</p>
            <p className="subtle">{course.summary}</p>
            {data.basis ? <p className="subtle">기준 진단: <time dateTime={data.basis.assessedAt}>{new Date(data.basis.assessedAt).toLocaleDateString("ko-KR")}</time> · <Link to={`/result/${data.basis.assessmentId}`}>진단 결과 보기</Link></p>
              : user ? <Link className="btn btn-secondary" to="/start">성향 진단하고 집중 학습 받기</Link>
                : <Link className="btn btn-secondary" to="/login" state={{ from: "/roadmap" }}>로그인하고 내 로드맵 이어가기</Link>}
          </section>

          {progress ? <section className="card course-progress" aria-label="내 로드맵 진척">
            <div className="course-progress-head"><strong>{progress.passed} / {progress.total} 개념 통과</strong><span className="subtle">확인 문제 최고 점수 {course.passScorePercent}% 이상이면 통과</span></div>
            <div className="bar-track" role="progressbar" aria-label="로드맵 진척" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}><i style={{ width: `${progress.percent}%` }} /></div>
            {progress.next ? <p>다음 학습: <Link to={`/learn?concept=${encodeURIComponent(progress.next.slug)}`}>{progress.next.title}</Link> · {progress.next.stageTitle}</p>
              : <p>모든 개념을 통과했습니다. <Link to="/market">실제 시장 자료 관찰하기</Link> · <Link to="/replay">합성 차트로 판단 복기하기</Link></p>}
            {progress.revisit.length > 0 && <div className="course-revisit"><h2>먼저 다시 볼 개념</h2><ul>{progress.revisit.map(item => <li key={item.slug}><Link to={`/learn?concept=${encodeURIComponent(item.slug)}`}>{item.title}</Link> <span className="subtle">{item.reason}</span></li>)}</ul></div>}
          </section> : <p className="replay-notice">확인 문제는 로그인 없이도 풀 수 있습니다. 로그인하면 점수·오답·복습 일정이 내 학습에 저장됩니다.</p>}

          <ol className="course-stages" aria-label="교과서 목차">
            {course.stages.map((stage, index) => <li className={`card course-stage${stage.completed ? " is-done" : ""}`} key={stage.id}>
              <div className="course-stage-head"><span className="course-stage-index">{index + 1}단계</span><h2>{stage.title}</h2>{progress && <span className="subtle">{stage.passed}/{stage.concepts.length} 통과</span>}</div>
              <p className="course-goal">목표: {stage.goal}</p>
              <ul className="course-concepts">{stage.concepts.map(step => <li className={`course-concept${step.status ? ` status-${step.status.toLowerCase()}` : ""}`} key={step.slug}>
                <Link to={`/learn?concept=${encodeURIComponent(step.slug)}`} aria-label={`${step.title} 학습·확인 문제`}><strong>{step.title}</strong><span className="subtle">{step.summary}</span></Link>
                <span className="course-concept-meta">{step.status && <span className="course-chip">{STATUS_LABEL[step.status]}</span>}{step.bestScore !== null && <span className="subtle">최고 {step.bestScore}점</span>}<span className="subtle">확인 문제 {step.quizCount}개</span></span>
              </li>)}</ul>
            </li>)}
          </ol>
          <p className="subtle">{data.notice}</p>
          <p className="subtle">{course.notice} · 학습 규칙 {data.rulesVersion} · 목차 {course.version}</p>
          <nav className="domain-next-links" aria-label="다음 학습"><Link to="/me">내 학습·오답 복습 →</Link><Link to="/market">금리·환율·주식 차트 →</Link><Link to="/course">전체 증권업 입문 과정 →</Link></nav>
        </>}
      </main>
      <SiteFooter />
    </div>
  );
}
