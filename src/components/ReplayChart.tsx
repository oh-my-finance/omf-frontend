import type { ReplayBar, ReplayDecisionResult, ReplayEvent } from "../api/types";

/**
 * 차트 복기용 종가 차트. 외부 라이브러리 없이 SVG로 그린다(SimulationChart와 같은 방식).
 *
 * 서버가 보낸 공개 구간만 그리므로 x축 끝이 곧 "지금"이다. 판단 시점은 세로선, 공시 공개일은 아래쪽 점으로 표시한다.
 * 같은 데이터를 표(ReplayTable)로도 제공하므로 차트는 흐름을 보는 보조 수단이다.
 */
export default function ReplayChart({
  bars,
  events,
  decisions,
  totalDays,
}: {
  bars: ReplayBar[];
  events: ReplayEvent[];
  decisions: ReplayDecisionResult[];
  totalDays: number;
}) {
  if (bars.length === 0) return null;
  const values = bars.flatMap(bar => [bar.high, bar.low]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || max || 1;
  const low = min - span * 0.06;
  const high = max + span * 0.06;
  // x축은 전체 기간 길이로 고정해 남은 구간이 있다는 것을 보여 준다(값은 그리지 않는다).
  const x = (day: number) => PAD.left + ((day - 1) / Math.max(totalDays - 1, 1)) * (WIDTH - PAD.left - PAD.right);
  const y = (value: number) => PAD.top + (1 - (value - low) / (high - low)) * (HEIGHT - PAD.top - PAD.bottom);
  const last = bars[bars.length - 1];
  const ticks = [low + span * 0.06, (low + high) / 2, high - span * 0.06];
  const ma = bars.filter(bar => bar.ma20 !== null);

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`1거래일부터 ${last.day}거래일까지 종가 차트. 마지막 종가 ${last.close.toLocaleString("ko-KR")}원. 같은 값은 표 보기에서 읽을 수 있습니다.`}
      >
        {ticks.map(tick => (
          <g key={tick}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} className="chart-grid" />
            <text x={PAD.left - 8} y={y(tick) + 4} className="chart-tick" textAnchor="end">
              {Math.round(tick).toLocaleString("ko-KR")}
            </text>
          </g>
        ))}
        {last.day < totalDays && (
          <rect
            x={x(last.day)}
            y={PAD.top}
            width={WIDTH - PAD.right - x(last.day)}
            height={HEIGHT - PAD.top - PAD.bottom}
            className="replay-hidden-zone"
          />
        )}
        {decisions.map(decision => (
          <line
            key={decision.step}
            x1={x(decision.decisionDay)}
            x2={x(decision.decisionDay)}
            y1={PAD.top}
            y2={HEIGHT - PAD.bottom}
            className="replay-decision-line"
          />
        ))}
        {ma.length > 1 && (
          <polyline
            fill="none"
            stroke={COLORS.ma}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            points={ma.map(bar => `${x(bar.day)},${y(bar.ma20 as number)}`).join(" ")}
          />
        )}
        <polyline
          fill="none"
          stroke={COLORS.close}
          strokeWidth={2}
          strokeLinejoin="round"
          points={bars.map(bar => `${x(bar.day)},${y(bar.close)}`).join(" ")}
        />
        {events.map(event => (
          <circle key={event.id} cx={x(event.publishedDay)} cy={HEIGHT - PAD.bottom + 8} r={4} className="replay-event-dot" />
        ))}
        <text x={PAD.left} y={HEIGHT - 4} className="chart-tick">1거래일</text>
        <text x={x(last.day)} y={HEIGHT - 4} className="chart-tick" textAnchor={last.day < totalDays ? "middle" : "end"}>
          {last.day}거래일{last.day < totalDays ? " (지금)" : ""}
        </text>
      </svg>
      <ul className="chart-legend">
        <li><span className="legend-swatch" style={{ background: COLORS.close }} />종가</li>
        <li><span className="legend-swatch" style={{ background: COLORS.ma }} />20거래일 이동평균(그날까지의 값)</li>
        <li><span className="legend-swatch replay-legend-decision" />내 판단 시점</li>
        <li><span className="legend-swatch replay-legend-event" />공시 공개일</li>
        {last.day < totalDays && <li><span className="legend-swatch replay-legend-hidden" />아직 공개되지 않은 구간</li>}
      </ul>
    </div>
  );
}

/** 차트와 같은 범위·정밀도의 표. 최근 거래일이 위에 온다. */
export function ReplayTable({ bars, decisions }: { bars: ReplayBar[]; decisions: ReplayDecisionResult[] }) {
  const decisionDays = new Set(decisions.map(decision => decision.decisionDay));
  const rows = [...bars].reverse();
  return (
    <div className="table-scroll replay-table-scroll" tabIndex={0} role="region" aria-label="공개된 거래일 시세 표">
      <table className="sim-table">
        <caption className="sr-only">거래일별 시가·고가·저가·종가·거래량·20거래일 이동평균(원, 주)</caption>
        <thead>
          <tr>
            <th scope="col">거래일</th>
            <th scope="col">시가</th>
            <th scope="col">고가</th>
            <th scope="col">저가</th>
            <th scope="col">종가</th>
            <th scope="col">거래량</th>
            <th scope="col">20일 평균</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(bar => (
            <tr key={bar.day} className={decisionDays.has(bar.day) ? "replay-row-decision" : undefined}>
              <th scope="row">
                {bar.day}
                {decisionDays.has(bar.day) && <span className="replay-row-mark"> · 판단</span>}
              </th>
              <td>{bar.open.toLocaleString("ko-KR")}</td>
              <td>{bar.high.toLocaleString("ko-KR")}</td>
              <td>{bar.low.toLocaleString("ko-KR")}</td>
              <td>{bar.close.toLocaleString("ko-KR")}</td>
              <td>{bar.volume.toLocaleString("ko-KR")}</td>
              <td>{bar.ma20 === null ? "—" : bar.ma20.toLocaleString("ko-KR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const WIDTH = 720;
const HEIGHT = 260;
const PAD = { top: 14, right: 14, bottom: 34, left: 64 };
const COLORS = { close: "#2f55e8", ma: "#d98324" };
