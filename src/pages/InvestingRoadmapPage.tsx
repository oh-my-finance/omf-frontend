import { forwardRef, useEffect, useRef, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Icon, { type IconName } from "../components/Icon";
import SiteFooter from "../components/SiteFooter";
import SubPageHeader from "../components/SubPageHeader";
import { INVESTING_TECHNIQUES, ROADMAP_DISCLAIMER, ROADMAP_STAGES, type RoadmapStage } from "../content/investingRoadmap";

const LAST = ROADMAP_STAGES.length - 1;

/** 주소의 ?stage= 값을 0~마지막 단계로 맞춘다. 잘못된 값은 0단계로 본다. */
function readStage(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= LAST ? parsed : 0;
}

const stageLabel = (stages: number[]) => `${stages.join("·")}단계`;

/**
 * 투자 로드맵: 금융 기초부터 파생·헤지까지 공부 순서와 단계별 점검 기준을 보여 주는 정적 교육 화면.
 * 단계 탭은 WAI-ARIA 탭 패턴(화살표·Home·End)을 따르고, 선택한 단계는 주소(?stage=)에 남겨 공유·새로고침해도 유지한다.
 */
export default function InvestingRoadmapPage() {
  const [params, setParams] = useSearchParams();
  const active = readStage(params.get("stage"));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const stage = ROADMAP_STAGES[active];
  /**
   * 단계를 바꾼 뒤 옮겨 갈 곳. 새 패널이 그려진 뒤에 스크롤해야 내용 높이 변화(스크롤 고정)로 스크롤이 끊기지 않는다.
   * tab: 기법 비교의 단계 버튼 → 그 단계 탭, panel: 패널 아래 이전·다음 버튼 → 새 패널의 처음.
   */
  const pendingMove = useRef<{ index: number; target: "tab" | "panel" } | null>(null);

  const select = (index: number, focus = false) => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if (index === 0) next.delete("stage"); else next.set("stage", String(index));
      return next;
    }, { replace: true, preventScrollReset: true });
    if (focus) tabRefs.current[index]?.focus();
  };

  /** 키 이동은 초점이 있는 탭을 기준으로 계산한다(빠르게 연속 입력해도 아직 반영되지 않은 선택값을 쓰지 않도록). */
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const count = ROADMAP_STAGES.length;
    const moves: Record<string, number> = {
      ArrowRight: (from + 1) % count,
      ArrowDown: (from + 1) % count,
      ArrowLeft: (from - 1 + count) % count,
      ArrowUp: (from - 1 + count) % count,
      Home: 0,
      End: LAST,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key], true);
  };

  const moveFocus = (index: number, target: "tab" | "panel") => {
    pendingMove.current = null;
    const node = target === "tab" ? tabRefs.current[index] : panelRef.current;
    if (!node) return;
    if (target === "tab") node.scrollIntoView({ block: "center" });
    else if (node.getBoundingClientRect().top < 0) node.scrollIntoView({ block: "start" });
    node.focus({ preventScroll: true });
  };

  const goTo = (index: number, target: "tab" | "panel") => {
    pendingMove.current = { index, target };
    if (index === active) moveFocus(index, target); else select(index);
  };

  useEffect(() => {
    const move = pendingMove.current;
    if (move && move.index === active) moveFocus(move.index, move.target);
  });

  return (
    <div className="app-page">
      <Header />
      <SubPageHeader
        section="learning"
        current="/investing-roadmap"
        title="투자 로드맵"
        description="금융 기초에서 파생상품까지 여섯 단계로 나눴습니다. 단계마다 배울 내용, 직접 해 볼 과업, 자주 하는 실수, 다음으로 넘어가는 기준을 확인하세요."
        actions={<Link className="btn btn-secondary" to="/roadmap">성향별 학습 로드맵</Link>}
      />
      <main className="practice-main course-main ir-main">
        <aside className="ir-disclaimer" role="note" aria-label="교육 목적 안내">
          <Icon name="alert" size={20} />
          <p><strong>교육 목적의 자료입니다.</strong> {ROADMAP_DISCLAIMER}</p>
        </aside>

        <section className="ir-section" aria-labelledby="ir-stages-title">
          <div className="ir-section-head">
            <h2 id="ir-stages-title">단계별 로드맵</h2>
            <p>단계는 앞 단계 위에 쌓입니다. 순서를 건너뛰기보다 각 단계의 기준을 채운 뒤 넘어가세요.</p>
          </div>

          <div className="ir-tabs" role="tablist" aria-label="투자 로드맵 단계" aria-orientation="horizontal">
            {ROADMAP_STAGES.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.level}
                  ref={node => { tabRefs.current[index] = node; }}
                  type="button"
                  role="tab"
                  id={`ir-tab-${item.level}`}
                  aria-selected={selected}
                  aria-controls="ir-stage-panel"
                  tabIndex={selected ? 0 : -1}
                  className={`ir-tab${selected ? " is-selected" : ""}`}
                  onClick={() => select(index)}
                  onKeyDown={event => onTabKey(event, index)}
                >
                  <span className="ir-tab-level">{item.level}단계</span>
                  <span className="ir-tab-name">{item.short}</span>
                </button>
              );
            })}
          </div>

          <StagePanel ref={panelRef} stage={stage} onSelect={index => goTo(index, "panel")} />
        </section>

        <section className="ir-section" aria-labelledby="ir-techniques-title">
          <div className="ir-section-head">
            <h2 id="ir-techniques-title">투자 기법 한눈에 보기</h2>
            <p>기법마다 생각의 출발점, 기대하는 장점, 피할 수 없는 위험, 스스로 검증하는 방법을 나란히 놓았습니다. 성과 수치는 싣지 않습니다. 어떤 기법도 모든 시장에서 통하지 않습니다.</p>
          </div>

          <div className="ir-table-wrap">
            <table className="ir-table">
              <caption className="sr-only">투자 기법별 아이디어, 강점, 위험, 검증 방법 비교</caption>
              <thead>
                <tr>
                  <th scope="col">기법</th>
                  <th scope="col">아이디어</th>
                  <th scope="col">강점</th>
                  <th scope="col">위험</th>
                  <th scope="col">검증 방법</th>
                </tr>
              </thead>
              <tbody>
                {INVESTING_TECHNIQUES.map(item => (
                  <tr key={item.id}>
                    <th scope="row">
                      <span className="ir-tech-name">{item.name}</span>
                      <button type="button" className="ir-stage-chip" onClick={() => goTo(item.stages[0], "tab")} aria-label={`${item.name}: ${stageLabel(item.stages)} 로드맵 보기`}>
                        {stageLabel(item.stages)}
                      </button>
                    </th>
                    <td>{item.idea}</td>
                    <td>{item.strength}</td>
                    <td>{item.risk}</td>
                    <td>{item.verify}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="ir-tech-cards" aria-label="투자 기법 비교">
            {INVESTING_TECHNIQUES.map(item => (
              <li key={item.id} className="ir-tech-card">
                <div className="ir-tech-card-head">
                  <h3>{item.name}</h3>
                  <button type="button" className="ir-stage-chip" onClick={() => goTo(item.stages[0], "tab")} aria-label={`${item.name}: ${stageLabel(item.stages)} 로드맵 보기`}>
                    {stageLabel(item.stages)}
                  </button>
                </div>
                <dl>
                  <div><dt>아이디어</dt><dd>{item.idea}</dd></div>
                  <div><dt>강점</dt><dd>{item.strength}</dd></div>
                  <div><dt>위험</dt><dd>{item.risk}</dd></div>
                  <div><dt>검증 방법</dt><dd>{item.verify}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
          <p className="ir-footnote">과거 자료로 확인한 결과는 미래에 그대로 반복되지 않습니다. 기법을 고르기 전에 내 목표 기간과 감당할 수 있는 손실을 먼저 정하세요.</p>
        </section>

        <nav className="domain-next-links" aria-label="다음 학습">
          <Link to="/course">증권업 입문 과정 →</Link>
          <Link to="/learn">개념 학습·확인 문제 →</Link>
          <Link to="/replay">합성 차트로 판단 복기하기 →</Link>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}

const BLOCKS: { key: "learn" | "tasks" | "mistakes"; title: string; icon: IconName }[] = [
  { key: "learn", title: "배우는 것", icon: "book" },
  { key: "tasks", title: "확인 과업", icon: "check" },
  { key: "mistakes", title: "흔한 실수", icon: "alert" },
];

type PanelProps = { stage: RoadmapStage; onSelect: (index: number) => void };

/** 탭 패널 틀은 단계가 바뀌어도 유지해 초점을 둘 수 있게 하고, 안쪽 내용만 단계별로 새로 그린다. */
const StagePanel = forwardRef<HTMLDivElement, PanelProps>(function StagePanel({ stage, onSelect }, ref) {
  const prev = stage.level > 0 ? ROADMAP_STAGES[stage.level - 1] : null;
  const next = stage.level < LAST ? ROADMAP_STAGES[stage.level + 1] : null;
  return (
    <div ref={ref} className="card ir-panel" role="tabpanel" id="ir-stage-panel" aria-labelledby={`ir-tab-${stage.level}`} tabIndex={-1}>
      <div className="ir-panel-body" key={stage.level}>
        <header className="ir-panel-head">
          <span className="course-stage-index">{stage.level}단계</span>
          <h3>{stage.title}</h3>
          <p className="ir-panel-topics">{stage.topics}</p>
          <p className="ir-panel-summary">{stage.summary}</p>
        </header>
  
        <div className="ir-blocks">
          {BLOCKS.map(block => (
            <section key={block.key} className={`ir-block ir-block-${block.key}`} aria-label={block.title}>
              <h4><Icon name={block.icon} size={18} />{block.title}</h4>
              <ul>{stage[block.key].map(text => <li key={text}>{text}</li>)}</ul>
            </section>
          ))}
          <section className="ir-block ir-block-practice" aria-label="FinMATE에서 연습하는 곳">
            <h4><Icon name="compass" size={18} />FinMATE에서 연습하는 곳</h4>
            <ul>
              {stage.practice.map(link => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}<Icon name="next" size={16} /></Link>
                  <span>{link.note}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
  
        <div className="ir-criteria">
          <h4>{next ? "다음 단계로 넘어가는 기준" : "마지막 단계의 점검 기준"}</h4>
          <p>{stage.nextCriteria}</p>
        </div>
  
        <div className="ir-panel-nav">
          {prev ? <button type="button" className="btn btn-secondary btn-small" onClick={() => onSelect(prev.level)}><Icon name="prev" size={18} />{prev.level}단계 {prev.short}</button> : <span />}
          {next && <button type="button" className="btn btn-secondary btn-small" onClick={() => onSelect(next.level)}>{next.level}단계 {next.short}<Icon name="next" size={18} /></button>}
        </div>
      </div>
    </div>
  );
});
