import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { MarketIndicator, MarketIndicatorsResponse } from "../api/types";
import Header from "../components/Header";
import LoadError from "../components/LoadError";
import SiteFooter from "../components/SiteFooter";
import SubPageHeader from "../components/SubPageHeader";
import TradingViewChart from "../components/TradingViewChart";

const STATUS_LABEL: Record<MarketIndicator["status"], string> = {
  AVAILABLE: "관측값 제공",
  STALE: "이전 수신 자료",
  UNAVAILABLE: "조회 불가",
};

const STOCKS = [
  { symbol: "NASDAQ:AAPL", label: "Apple · 미국 나스닥" },
  { symbol: "NASDAQ:MSFT", label: "Microsoft · 미국 나스닥" },
  { symbol: "NYSE:KO", label: "Coca-Cola · 미국 뉴욕증권거래소" },
  { symbol: "AMEX:SPY", label: "SPDR S&P 500 ETF · 미국" },
];

function number(value: number, id: string) {
  return value.toLocaleString("ko-KR", { minimumFractionDigits: id === "DEXUSEU" ? 4 : 2, maximumFractionDigits: id === "DEXUSEU" ? 4 : 2 });
}

export default function MarketPage() {
  const [result, setResult] = useState<{ reload: number; data: MarketIndicatorsResponse | null; error: string | null } | null>(null);
  const [reload, setReload] = useState(0);
  const [symbol, setSymbol] = useState(STOCKS[0].symbol);
  const [chartOpen, setChartOpen] = useState(false);
  const [chartReload, setChartReload] = useState(0);
  const sourceUrl = `https://www.tradingview.com/symbols/${symbol.replace(":", "-")}/`;

  useEffect(() => {
    let current = true;
    api.getMarketIndicators().then(value => { if (current) setResult({ reload, data: value, error: null }); })
      .catch(() => { if (current) setResult({ reload, data: null, error: "금리·환율 자료를 불러오지 못했습니다." }); });
    return () => { current = false; };
  }, [reload]);

  const data = result?.reload === reload ? result.data : null;
  const error = result?.reload === reload ? result.error : null;

  return (
    <div className="app-page">
      <Header />
      <SubPageHeader section="practice" current="/market" title="금리·환율·주식 차트" description="숫자의 기준 시각과 출처를 확인하며 시장을 읽어 보세요. 금리·환율 관측값과 외부 주식 차트를 제공합니다." actions={<Link className="btn btn-secondary" to="/roadmap">학습 로드맵</Link>} />
      <main className="practice-main market-main">
        <section aria-label="금리와 환율">
          <div className="market-section-head"><div><h2>금리와 환율</h2><p className="subtle">실시간 시세가 아닌 공식 관측값입니다. 미국 금리는 한국은행 기준금리와 다릅니다.</p></div><button type="button" className="btn btn-secondary" onClick={() => setReload(value => value + 1)}>지표 다시 조회</button></div>
          {error && <LoadError message={error} onRetry={() => setReload(value => value + 1)} />}
          {!data && !error && <p className="subtle" role="status">금리·환율 자료를 불러오는 중…</p>}
          {data && <><div className="market-indicators">{data.indicators.map(indicator => <IndicatorCard key={indicator.id} indicator={indicator} />)}</div><p className="subtle market-notice">{data.notice}</p></>}
          <div className="market-learning-links"><span>숫자를 이해하려면</span><Link to="/learn?concept=bond-price-yield">금리와 채권 가격</Link><Link to="/glossary/exchange-rate">환율의 의미</Link><Link to="/practice">가정값을 바꿔 실험하기</Link></div>
        </section>

        <section className="card stock-section" aria-label="주식 차트">
          <h2>주식 차트</h2>
          <p className="subtle">미국 주식·ETF의 가격 흐름을 TradingView 차트로 살펴봅니다. 종목은 차트 사용 예시이며 추천 순서가 아닙니다. 거래소별 지연·제공 범위가 다릅니다.</p>
          <div className="stock-controls"><div><label className="field-label" htmlFor="stock-symbol">차트 종목</label><select id="stock-symbol" className="field-input" value={symbol} onChange={event => setSymbol(event.target.value)}>{STOCKS.map(stock => <option key={stock.symbol} value={stock.symbol}>{stock.label}</option>)}</select></div>
            {!chartOpen ? <button type="button" className="btn btn-primary" onClick={() => setChartOpen(true)}>외부 차트 불러오기</button>
              : <><button type="button" className="btn btn-secondary" onClick={() => setChartReload(value => value + 1)}>차트 다시 불러오기</button><button type="button" className="btn btn-secondary" onClick={() => setChartOpen(false)}>외부 차트 닫기</button></>}
          </div>
          {chartOpen ? <TradingViewChart key={`${symbol}-${chartReload}`} symbol={symbol} />
            : <div className="stock-chart-placeholder"><strong>차트를 열면 TradingView에 직접 연결됩니다.</strong><p>차트의 시세·도구는 외부 공급자가 제공합니다. 차트 자료는 FinMATE 학습 기록이나 합성 복기 데이터로 저장되지 않습니다.</p></div>}
          <p className="market-chart-source"><a href={sourceUrl} target="_blank" rel="noopener noreferrer">{symbol} · TradingView 원문에서 보기 ↗</a></p>
          <p className="subtle">외부 차트가 차단되거나 종목이 제공되지 않으면 원문 링크를 이용해 주세요. 일·주·월 등 기간과 봉 모양은 차트 안에서 바꿀 수 있습니다.</p>
        </section>
        <aside className="replay-notice">판단을 기록하며 연습하려면 <Link to="/replay">합성 데이터 차트 복기</Link>를 이용하세요. 시장 관찰 화면과 별도의 학습 기능입니다.</aside>
      </main>
      <SiteFooter />
    </div>
  );
}

function IndicatorCard({ indicator }: { indicator: MarketIndicator }) {
  const value = indicator.value;
  return <article className={`card market-indicator status-${indicator.status.toLowerCase()}`} data-testid={`market-indicator-${indicator.id}`}>
    <div className="market-indicator-head"><h3>{indicator.name}</h3><span className="course-chip">{STATUS_LABEL[indicator.status]}</span></div>
    <p className="market-value">{value !== null ? number(value, indicator.id) : "—"}<span>{indicator.unit}</span></p>
    <p className="market-change">{indicator.change !== null ? `이전 관측 대비 ${indicator.change > 0 ? "+" : ""}${number(indicator.change, indicator.id)} ${indicator.id === "DFF" ? "%p" : indicator.unit}` : "이전 관측값과 비교할 수 없습니다."}</p>
    <p className="market-description">{indicator.description}</p>
    {indicator.points.length > 1 && <IndicatorTrend indicator={indicator} />}
    <dl className="market-metadata"><div><dt>마지막 관측일</dt><dd>{indicator.asOf ? <time dateTime={indicator.asOf}>{indicator.asOf}</time> : "자료 없음"}</dd></div><div><dt>성공 수신 시각</dt><dd>{indicator.fetchedAt ? <time dateTime={indicator.fetchedAt}>{new Date(indicator.fetchedAt).toLocaleString("ko-KR")}</time> : "수신 기록 없음"}</dd></div><div><dt>출처</dt><dd><a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer">{indicator.sourceName} · {indicator.id} ↗</a></dd></div></dl>
    <p className="market-indicator-message" role={indicator.status === "UNAVAILABLE" ? "status" : undefined}>{indicator.message}</p>
    {indicator.points.length > 0 && <details className="market-data-table"><summary>관측값 표 보기</summary><div className="market-table-scroll" tabIndex={0} role="region" aria-label={`${indicator.name} 관측값 표`}><table><caption>{indicator.name} · {indicator.unit} · 날짜 오름차순</caption><thead><tr><th scope="col">관측일</th><th scope="col">관측값</th></tr></thead><tbody>{indicator.points.map(point => <tr key={point.date}><th scope="row">{point.date}</th><td>{number(point.value, indicator.id)}</td></tr>)}</tbody></table></div></details>}
  </article>;
}

function IndicatorTrend({ indicator }: { indicator: MarketIndicator }) {
  const values = indicator.points.map(point => point.value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const start = Date.parse(`${indicator.points[0].date}T00:00:00Z`);
  const end = Date.parse(`${indicator.points[indicator.points.length - 1].date}T00:00:00Z`);
  const line = indicator.points.map(point => `${8 + (Date.parse(`${point.date}T00:00:00Z`) - start) / Math.max(1, end - start) * 264},${high === low ? 44 : 76 - (point.value - low) / (high - low) * 64}`).join(" ");
  return <figure className="market-trend"><svg viewBox="0 0 280 88" role="img" aria-label={`${indicator.name} 관측 추이. 최소 ${number(low, indicator.id)}, 최대 ${number(high, indicator.id)} ${indicator.unit}. 정확한 값은 관측값 표에서 확인하세요.`}><line x1="8" y1="78" x2="272" y2="78" className="market-trend-baseline" /><polyline points={line} fill="none" /></svg><figcaption>{indicator.points[0].date} — {indicator.asOf} · 세로축 {number(low, indicator.id)} ~ {number(high, indicator.id)}</figcaption></figure>;
}
