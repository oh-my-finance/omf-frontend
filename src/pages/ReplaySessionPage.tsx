import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import ReplayChart, { ReplayTable } from "../components/ReplayChart";
import { ApiError, api } from "../api/client";
import type { ReplayDecisionResult, ReplayReview, ReplayReviewDecision, ReplaySessionView } from "../api/types";

/**
 * 차트 복기 진행·회고 화면(FR-31~34).
 *
 * 화면은 서버가 보낸 공개 구간만 가진다. 다음 구간은 판단을 확정한 응답으로만 받으므로 새로고침·개발자 도구로도
 * 미리 볼 수 없다. 모든 과업(판단·다음 구간·회고)은 차트 없이 표와 기본 폼 컨트롤만으로 키보드로 끝낼 수 있다.
 */
export default function ReplaySessionPage() {
  const { sessionId = "" } = useParams();
  const [view, setView] = useState<ReplaySessionView | null>(null);
  const [review, setReview] = useState<ReplayReview | null>(null);
  const [mode, setMode] = useState<"chart" | "table">("chart");
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const load = useCallback(async () => {
    try {
      const next = await api.getReplaySession(sessionId);
      setView(next);
      setReview(next.status === "COMPLETED" ? await api.getReplayReview(sessionId) : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "세션을 불러오지 못했습니다.");
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const onDecided = async (next: ReplaySessionView) => {
    setView(next);
    const result = next.decisions[next.decisions.length - 1];
    setAnnouncement(
      `${result.revealedUntilDay}거래일까지 공개되었습니다. 이 구간 주가 ${signed(result.stockReturnPct)}, 내 평가액 ${signed(result.portfolioReturnPct)}.`,
    );
    if (next.status === "COMPLETED") setReview(await api.getReplayReview(next.id));
  };

  if (error && !view) {
    return (
      <div className="app-page">
        <Header />
        <main className="practice-main">
          <p className="error-text" role="alert">{error}</p>
          <Link className="btn btn-secondary" to="/replay">목록으로</Link>
        </main>
      </div>
    );
  }
  if (!view) {
    return (
      <div className="app-page">
        <Header />
        <main className="practice-main"><p className="subtle" role="status">불러오는 중…</p></main>
      </div>
    );
  }

  const completed = view.status === "COMPLETED";
  return (
    <div className="app-page">
      <Header />
      <main className="practice-main replay-main">
        <div className="practice-head">
          <div>
            <span className="eyebrow">
              차트 복기 · 합성 데이터 · {view.scenario.instrument}
              {view.practice ? " · 연습(평가에 넣지 않음)" : ""}
            </span>
            <h1>{view.scenario.title}</h1>
            <p className="intro-copy">{view.scenario.summary}</p>
          </div>
          <Link className="btn btn-secondary" to="/replay">목록으로</Link>
        </div>
        <p className="replay-notice" role="note">{view.notice} {view.scenario.dataNotice}</p>

        <div className="replay-status" aria-live="polite">
          <strong>
            {completed ? "모든 판단을 마쳤습니다" : `판단 ${view.step + 1} / ${view.totalSteps}`}
          </strong>
          <span>
            지금 {view.visibleUntilDay}거래일 · 전체 {view.scenario.totalDays}거래일
          </span>
          <span className="sr-only">{announcement}</span>
        </div>

        <section className="replay-grid">
          <div className="replay-data">
            <div className="card">
              <div className="replay-toggle" role="group" aria-label="시세 보기 방식">
                <button type="button" className="btn btn-secondary btn-small" aria-pressed={mode === "chart"} onClick={() => setMode("chart")}>
                  차트
                </button>
                <button type="button" className="btn btn-secondary btn-small" aria-pressed={mode === "table"} onClick={() => setMode("table")}>
                  표
                </button>
              </div>
              {mode === "chart" ? (
                <ReplayChart bars={view.bars} events={view.events} decisions={view.decisions} totalDays={view.scenario.totalDays} />
              ) : (
                <ReplayTable bars={view.bars} decisions={view.decisions} />
              )}
            </div>

            <div className="card">
              <h2>지금까지 공개된 공시</h2>
              {view.events.length === 0 ? (
                <p className="subtle">아직 공개된 공시가 없습니다.</p>
              ) : (
                <ul className="replay-events">
                  {[...view.events].reverse().map(event => (
                    <li key={event.id}>
                      <strong>{event.title}</strong>
                      <span className="subtle">
                        공개 {event.publishedDay}거래일(장 마감 뒤){event.occurredDay !== event.publishedDay ? ` · 발생 ${event.occurredDay}거래일` : ""}
                      </span>
                      <p>{event.detail}</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="subtle">발생했어도 공개되지 않은 사건은 여기에 나오지 않습니다.</p>
            </div>
          </div>

          <aside className="replay-side">
            <Portfolio view={view} />
            {view.decisions.length > 0 && <DecisionHistory decisions={view.decisions} />}
            {!completed && <DecisionForm view={view} onDecided={onDecided} onStale={load} />}
          </aside>
        </section>

        {review && <ReviewSection review={review} onChange={setReview} />}
      </main>
    </div>
  );
}

function Portfolio({ view }: { view: ReplaySessionView }) {
  const p = view.portfolio;
  return (
    <div className="card replay-portfolio">
      <h2>내 평가액</h2>
      <dl>
        <div><dt>평가액</dt><dd>{p.value.toLocaleString("ko-KR")}원</dd></div>
        <div><dt>수익률(비용 포함)</dt><dd>{signed(p.totalReturnPct)}</dd></div>
        <div><dt>낸 비용</dt><dd>{p.totalCost.toLocaleString("ko-KR")}원</dd></div>
        <div><dt>지금 보유 비중</dt><dd>{p.stockWeightPct}%</dd></div>
        {view.decisions.length > 0 && (
          <div><dt>기준선: 첫 판단 때 전부 사서 보유</dt><dd>{signed(p.buyAndHoldReturnPct)}</dd></div>
        )}
      </dl>
      <p className="subtle">
        시작 {view.costModel.initialCapital.toLocaleString("ko-KR")}원 · 비용 가정 {view.costModel.version}
      </p>
    </div>
  );
}

function DecisionHistory({ decisions }: { decisions: ReplayDecisionResult[] }) {
  return (
    <div className="card">
      <h2>판단과 공개된 결과</h2>
      <ol className="replay-decisions">
        {decisions.map(decision => (
          <li key={decision.step}>
            <strong>{decision.decisionDay}거래일 · {decision.positionLabel}</strong>
            <span className="subtle">
              {decision.revealedUntilDay}거래일까지: 주가 {signed(decision.stockReturnPct)} · 내 평가액 {signed(decision.portfolioReturnPct)}
              {decision.cost > 0 ? ` · 비용 ${decision.cost.toLocaleString("ko-KR")}원` : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DecisionForm({
  view,
  onDecided,
  onStale,
}: {
  view: ReplaySessionView;
  onDecided: (next: ReplaySessionView) => void;
  onStale: () => void;
}) {
  const [position, setPosition] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [rationale, setRationale] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = position !== "" && tags.length > 0 && rationale.trim().length >= 10;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) {
      setError("보유 비중, 근거 종류, 근거(10자 이상)를 모두 정해 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await api.decideReplay(view.id, { step: view.step, position, rationale: rationale.trim(), tags, confidence });
      setPosition("");
      setTags([]);
      setRationale("");
      setConfidence(3);
      onDecided(next);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError(e.message);
        onStale();
      } else {
        setError(e instanceof Error ? e.message : "판단을 저장하지 못했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card replay-form" onSubmit={submit} noValidate>
      <h2>{view.visibleUntilDay}거래일 종가 기준 판단</h2>
      <fieldset>
        <legend>보유 비중</legend>
        {view.positions.map(option => (
          <label key={option.value} className="replay-choice">
            <input type="radio" name="position" value={option.value} checked={position === option.value} onChange={() => setPosition(option.value)} />
            {option.label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>근거 종류(여러 개 선택)</legend>
        <div className="replay-tags">
          {view.tags.map(option => (
            <label key={option.value} className="replay-choice">
              <input
                type="checkbox"
                value={option.value}
                checked={tags.includes(option.value)}
                onChange={e => setTags(prev => (e.target.checked ? [...prev, option.value] : prev.filter(tag => tag !== option.value)))}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field-label">
        근거(10자 이상)
        <textarea
          className="field-input"
          rows={4}
          maxLength={1000}
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="지금 보이는 가격·공시 중 무엇을 근거로, 어떤 위험을 감수하는지 적어 보세요."
        />
      </label>
      <label className="field-label">
        확신 정도
        <select className="field-input" value={confidence} onChange={e => setConfidence(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map(value => (
            <option key={value} value={value}>{value} {value === 1 ? "(거의 모름)" : value === 5 ? "(매우 확신)" : ""}</option>
          ))}
        </select>
      </label>
      <p className="subtle">확정하면 고칠 수 없고, 다음 구간이 공개됩니다.</p>
      {error && <p className="error-text" role="alert">{error}</p>}
      <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
        {saving ? "확정 중…" : view.step + 1 === view.totalSteps ? "판단 확정하고 끝까지 보기" : "판단 확정하고 다음 구간 보기"}
      </button>
    </form>
  );
}

function ReviewSection({ review, onChange }: { review: ReplayReview; onChange: (next: ReplayReview) => void }) {
  const p = review.portfolio;
  return (
    <section className="replay-review" aria-labelledby="replay-review-title">
      <h2 id="replay-review-title">회고: 수익과 판단 근거를 나눠 봅니다</h2>
      <div className="card replay-compare">
        <div><span>내 판단(비용 포함)</span><strong>{signed(p.totalReturnPct)}</strong></div>
        <div><span>기준선: 전부 보유</span><strong>{signed(p.buyAndHoldReturnPct)}</strong></div>
        <div><span>기준선: 현금 유지</span><strong>{signed(review.cashReturnPct)}</strong></div>
        <div><span>낸 비용</span><strong>{p.totalCost.toLocaleString("ko-KR")}원</strong></div>
      </div>
      <p className="replay-lesson">{review.lesson}</p>
      <p className="subtle">
        결과가 좋았는지와 근거가 맞았는지는 다른 질문입니다. 각 판단의 근거가 결과를 보고 나서도 유효했는지 스스로 평가해 보세요.
      </p>
      {review.decisions.map(item => (
        <ReflectionCard key={item.decision.step} sessionId={review.sessionId} item={item} options={review.reflections} onChange={onChange} />
      ))}
      <details className="card replay-reproduction">
        <summary>재현 정보</summary>
        <p>
          데이터 {review.reproduction.dataVersion} · 생성기 {review.reproduction.generatorVersion} · seed {review.reproduction.seed} · 비용{" "}
          {review.reproduction.costModelVersion} · 판단 거래일 {review.reproduction.decisionDays.join(", ")}
        </p>
        <p className="subtle">같은 값과 같은 판단이면 같은 공개 순서와 결과가 다시 나옵니다.</p>
      </details>
    </section>
  );
}

function ReflectionCard({
  sessionId,
  item,
  options,
  onChange,
}: {
  sessionId: string;
  item: ReplayReviewDecision;
  options: { value: string; label: string }[];
  onChange: (next: ReplayReview) => void;
}) {
  const d = item.decision;
  const [reflection, setReflection] = useState(item.reflection ?? "");
  const [note, setNote] = useState(item.reflectionNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = `reflection-${d.step}`;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!reflection) {
      setError("평가를 하나 골라 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      onChange(await api.reflectReplay(sessionId, d.step, reflection, note));
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`card replay-reflection quadrant-${item.quadrant.toLowerCase()}`} onSubmit={save}>
      <h3>
        판단 {d.step + 1} · {d.decisionDay}거래일 · {d.positionLabel}
      </h3>
      <p className="replay-rationale">“{d.rationale}”</p>
      <p className="subtle">
        근거: {d.tags.map(tag => tag.label).join(", ")} · 확신 {d.confidence}/5
      </p>
      <p>
        {d.revealedUntilDay}거래일까지 주가 {signed(d.stockReturnPct)}, 내 평가액 {signed(d.portfolioReturnPct)} ·{" "}
        {d.favorable ? "결과는 유리했습니다" : "결과는 불리했습니다"}
      </p>
      <fieldset>
        <legend>결과를 본 뒤, 이 근거는</legend>
        {options.map(option => (
          <label key={option.value} className="replay-choice">
            <input type="radio" name={name} value={option.value} checked={reflection === option.value} onChange={() => setReflection(option.value)} />
            {option.label}
          </label>
        ))}
      </fieldset>
      <label className="field-label">
        메모(선택)
        <textarea className="field-input" rows={2} maxLength={500} value={note} onChange={e => setNote(e.target.value)} />
      </label>
      <p className="replay-quadrant" aria-live="polite"><strong>{item.quadrantLabel}</strong></p>
      {item.concepts.length > 0 && (
        <p className="replay-concepts">
          이어서 볼 개념:{" "}
          {item.concepts.map(concept => (
            <Link key={concept.slug} className="btn btn-secondary btn-small" to={`/learn?concept=${encodeURIComponent(concept.slug)}`}>
              {concept.title}
            </Link>
          ))}
        </p>
      )}
      {error && <p className="error-text" role="alert">{error}</p>}
      <button className="btn btn-secondary btn-small" type="submit" disabled={saving}>{saving ? "저장 중…" : "회고 저장"}</button>
    </form>
  );
}

function signed(pct: number) {
  return `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;
}
