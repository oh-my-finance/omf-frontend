import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import LoadError from "../components/LoadError";
import { api } from "../api/client";
import type { ReplayScenarioList, ReplaySessionSummary } from "../api/types";
import { useAuth } from "../context/AuthContext";

/**
 * 차트 복기 시작 화면. 시나리오 설명은 누구나 보고, 세션 시작과 기록은 로그인 후에 한다.
 * 목록 응답에는 시세가 없으므로 판단 전에 결과를 엿볼 수 없다.
 */
export default function ReplayListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<ReplayScenarioList | null>(null);
  const [sessions, setSessions] = useState<ReplaySessionSummary[]>([]);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.getReplayScenarios().then(setCatalog).catch(() => setError("시나리오를 불러오지 못했습니다."));
  }, [reload]);

  useEffect(() => {
    if (!user) return;
    api.getReplaySessions().then(setSessions).catch(() => setSessions([]));
  }, [user]);

  const start = async (scenarioId: string) => {
    setStarting(scenarioId);
    setError(null);
    try {
      const session = await api.startReplay(scenarioId);
      navigate(`/replay/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "세션을 시작하지 못했습니다.");
      setStarting(null);
    }
  };

  const seen = new Set(sessions.filter(session => session.step > 0).map(session => session.scenarioId));

  return (
    <div className="app-page">
      <Header />
      <main className="practice-main">
        <div className="practice-head">
          <div>
            <span className="eyebrow">차트 복기 · 합성 데이터</span>
            <h1>그 시점에서 판단하고,<br />다음 구간을 보고 돌아봅니다.</h1>
            <p className="intro-copy">
              판단 시점까지의 가격과 공시만 보고 보유 비중과 근거를 확정합니다. 확정해야 다음 구간이 열리고, 끝나면 수익과 근거를 나눠
              회고합니다. 되돌릴 수 없고, 이미 본 시나리오를 다시 하면 연습으로 표시됩니다.
            </p>
          </div>
          <Link className="btn btn-secondary" to="/learn">개념 학습으로 가기</Link>
        </div>

        {catalog && <p className="replay-notice" role="note">{catalog.notice}</p>}
        {error && !catalog && <LoadError message={error} onRetry={() => { setError(null); setReload(value => value + 1); }} />}
        {error && catalog && <p className="error-text" role="alert">{error}</p>}
        {!catalog && !error && <p className="subtle" role="status">시나리오를 불러오는 중…</p>}

        <section className="replay-scenarios" aria-label="시나리오">
          {catalog?.scenarios.map(scenario => (
            <article key={scenario.id} className="card replay-scenario">
              <span className="replay-badge">합성 데이터 · {scenario.instrument}</span>
              <h2>{scenario.title}</h2>
              <p>{scenario.summary}</p>
              <p className="subtle">
                {scenario.totalDays}거래일 · 판단 {scenario.decisionCount}번 · 데이터 {scenario.dataVersion}
              </p>
              {user ? (
                <button className="btn btn-primary" disabled={starting !== null} onClick={() => start(scenario.id)}>
                  {starting === scenario.id ? "준비 중…" : seen.has(scenario.id) ? "연습으로 다시 하기" : "시작하기"}
                </button>
              ) : (
                <Link className="btn btn-primary" to="/login" state={{ from: "/replay" }}>로그인하고 시작하기</Link>
              )}
            </article>
          ))}
        </section>

        {catalog && (
          <details className="card replay-costs">
            <summary>비용 가정 ({catalog.costModel.version})</summary>
            <p>
              시작 금액 {catalog.costModel.initialCapital.toLocaleString("ko-KR")}원 · 수수료 {catalog.costModel.commissionPct}% · 체결
              미끄러짐 {catalog.costModel.slippagePct}% · 매도 세금 {catalog.costModel.sellTaxPct}%
            </p>
            <p className="subtle">{catalog.costModel.note}</p>
          </details>
        )}

        {sessions.length > 0 && (
          <section className="card replay-history">
            <h2>내 기록</h2>
            <ul>
              {sessions.map(session => (
                <li key={session.id}>
                  <Link to={`/replay/${session.id}`}>{session.scenarioTitle}</Link>
                  <span className="subtle">
                    {session.status === "COMPLETED" ? "회고 가능" : `판단 ${session.step}/${session.totalSteps}`}
                    {session.practice ? " · 연습" : ""} · {new Date(session.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
