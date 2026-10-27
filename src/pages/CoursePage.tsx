import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../api/client";
import type { CourseConceptStep, CourseStatus, CourseView } from "../api/types";
import { useAuth } from "../context/AuthContext";

const COURSE_ID = "securities-intro";

const STATUS_LABEL: Record<CourseStatus, string> = {
  NOT_STARTED: "시작 전",
  IN_PROGRESS: "복습 필요",
  PASSED: "통과",
};

/**
 * 증권업 입문 과정(FR-27·29). 단계 순서대로 개념을 읽고 확인 문제로 통과 여부를 확인한다.
 * 로그인하면 확인 문제 기록으로 진척·다음 개념·다시 볼 개념을 보여 준다.
 */
export default function CoursePage() {
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = user ? api.getCourseProgress(COURSE_ID) : api.getCourse(COURSE_ID);
    load.then(setCourse).catch(() => setError("학습 과정을 불러오지 못했습니다."));
  }, [user]);

  return (
    <div className="app-page">
      <Header />
      <main className="practice-main course-main">
        <div className="practice-head">
          <div>
            <span className="eyebrow">입문 과정 · 순서대로</span>
            <h1>{course?.title ?? "증권업 입문 과정"}</h1>
            <p className="intro-copy">{course?.summary}</p>
          </div>
          <Link className="btn btn-secondary" to="/learn">개념 전체 보기</Link>
        </div>

        {error && <p className="error-text" role="alert">{error}</p>}
        {!course && !error && <p className="subtle" role="status">불러오는 중…</p>}

        {course && (
          <>
            {course.progress ? (
              <section className="card course-progress" aria-label="진척">
                <div className="course-progress-head">
                  <strong>{course.progress.passed} / {course.progress.total} 개념 통과</strong>
                  <span className="subtle">통과 기준: 확인 문제 최고 점수 {course.passScorePercent}% 이상</span>
                </div>
                <div className="bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.progress.percent} aria-label="과정 진척">
                  <i style={{ width: `${course.progress.percent}%` }} />
                </div>
                {course.progress.next ? (
                  <p>
                    다음 개념: <Link to={`/learn?concept=${encodeURIComponent(course.progress.next.slug)}`}>{course.progress.next.title}</Link>
                    <span className="subtle"> · {course.progress.next.stageTitle}</span>
                  </p>
                ) : (
                  <p>모든 개념을 통과했습니다. 차트 복기로 판단을 연습해 보세요. <Link to="/replay">차트 복기 →</Link></p>
                )}
                {course.progress.revisit.length > 0 && (
                  <div className="course-revisit">
                    <h2>먼저 다시 볼 개념</h2>
                    <ul>
                      {course.progress.revisit.map(item => (
                        <li key={item.slug}>
                          <Link to={`/learn?concept=${encodeURIComponent(item.slug)}`}>{item.title}</Link>
                          <span className="subtle"> — {item.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ) : (
              <p className="replay-notice" role="note">
                로그인하면 확인 문제 기록으로 진척과 다음 개념을 보여 드립니다. <Link to="/login" state={{ from: "/course" }}>로그인</Link>
              </p>
            )}

            <ol className="course-stages">
              {course.stages.map((stage, index) => (
                <li key={stage.id} className={`card course-stage${stage.completed ? " is-done" : ""}`}>
                  <div className="course-stage-head">
                    <span className="course-stage-index">{index + 1}단계</span>
                    <h2>{stage.title}</h2>
                    {course.progress && <span className="subtle">{stage.passed}/{stage.concepts.length} 통과</span>}
                  </div>
                  <p className="course-goal">목표: {stage.goal}</p>
                  <ul className="course-concepts">
                    {stage.concepts.map(step => <ConceptRow key={step.slug} step={step} />)}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="subtle">{course.notice} 과정 {course.version}</p>
          </>
        )}
      </main>
    </div>
  );
}

function ConceptRow({ step }: { step: CourseConceptStep }) {
  return (
    <li className={`course-concept${step.status ? ` status-${step.status.toLowerCase()}` : ""}`}>
      <Link to={`/learn?concept=${encodeURIComponent(step.slug)}`}>
        <strong>{step.title}</strong>
        <span className="subtle">{step.summary}</span>
      </Link>
      <span className="course-concept-meta">
        {step.status && <span className="course-chip">{STATUS_LABEL[step.status]}</span>}
        {step.bestScore !== null && <span className="subtle">최고 {step.bestScore}점</span>}
        <span className="subtle">문제 {step.quizCount}</span>
      </span>
    </li>
  );
}
