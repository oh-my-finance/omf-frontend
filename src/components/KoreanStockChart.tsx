import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { KoreanStockBar, KoreanStockCatalog, KoreanStockHistory } from "../api/types";
import LoadError from "./LoadError";

const STATUS_LABEL: Record<KoreanStockHistory["status"], string> = {
  AVAILABLE: "일별 시세 제공",
  STALE: "이전 수신 자료",
  UNAVAILABLE: "조회 불가",
};

function number(value: number) {
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 0 });
}

/** 한국 종목은 국내 공급자의 일별 자료를 그린다. 미국 외부 위젯에 국내 심볼을 넣지 않는다. */
export default function KoreanStockChart() {
  const [catalog, setCatalog] = useState<{ reload: number; data: KoreanStockCatalog | null; error: boolean } | null>(null);
  const [catalogReload, setCatalogReload] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<{ key: string; data: KoreanStockHistory | null; error: boolean } | null>(null);
  const stocks = catalog?.reload === catalogReload ? catalog.data?.stocks : undefined;
  const stock = stocks?.find(item => item.symbol === selectedSymbol) ?? stocks?.[0];
  const symbol = stock?.symbol;
  const requestKey = `${symbol ?? "none"}:${reload}`;
  const data = result?.key === requestKey ? result.data : null;
  const error = result?.key === requestKey && result.error;

  useEffect(() => {
    let current = true;
    api.getKoreanStocks().then(value => { if (current) setCatalog({ reload: catalogReload, data: value, error: false }); })
      .catch(() => { if (current) setCatalog({ reload: catalogReload, data: null, error: true }); });
    return () => { current = false; };
  }, [catalogReload]);

  useEffect(() => {
    let current = true;
    if (!symbol) return;
    api.getKoreanStockHistory(symbol).then(value => { if (current) setResult({ key: requestKey, data: value, error: false }); })
      .catch(() => { if (current) setResult({ key: requestKey, data: null, error: true }); });
    return () => { current = false; };
  }, [symbol, requestKey]);

  return <section className="card stock-section korean-stock-section" aria-label="국내 주식 차트">
    <h2>국내 주식 일별 차트</h2>
    <p className="subtle">국내 종목의 시가·고가·저가·종가와 거래량을 같은 날짜의 표로 확인합니다. 실시간 체결가가 아니며, 자료는 기준일 다음 영업일 13시 이후 갱신됩니다.</p>
    {catalog?.reload === catalogReload && catalog.error && <LoadError message="국내 종목 목록을 불러오지 못했습니다." onRetry={() => setCatalogReload(value => value + 1)} />}
    {!stocks && !(catalog?.reload === catalogReload && catalog.error) && <p className="subtle" role="status">국내 종목 목록을 불러오는 중…</p>}
    {stocks && stocks.length === 0 && <p className="subtle" role="status">현재 제공하는 국내 종목이 없습니다.</p>}
    {stock && <>
      <div className="stock-controls">
        <div><label className="field-label" htmlFor="korean-stock-symbol">국내 주식 종목</label><select id="korean-stock-symbol" className="field-input" value={stock.symbol} onChange={event => setSelectedSymbol(event.target.value)}>{stocks?.map(item => <option key={item.symbol} value={item.symbol}>{item.name} · {item.symbol} · {item.market}</option>)}</select></div>
        <button type="button" className="btn btn-secondary" onClick={() => setReload(value => value + 1)}>국내 시세 다시 조회</button>
      </div>
      {catalog?.data && <p className="subtle korean-stock-notice">{catalog.data.notice}</p>}
      {error && <LoadError message="국내 시세를 불러오지 못했습니다." onRetry={() => setReload(value => value + 1)} />}
      {!data && !error && <p className="subtle" role="status">국내 일별 시세를 불러오는 중…</p>}
      {data && <div data-testid="korean-stock-result" className={`korean-stock-result status-${data.status.toLowerCase()}`}>
        <div className="korean-stock-heading"><h3>{data.stock.name} <span>{data.stock.symbol} · {data.stock.market}</span></h3><span className="course-chip">{STATUS_LABEL[data.status]}</span></div>
        {data.status === "UNAVAILABLE" || data.bars.length === 0 ? <div className="stock-chart-placeholder" role="status"><strong>국내 시세를 표시할 수 없습니다.</strong><p>{data.message}</p></div>
          : <>
            <p className="market-value">{number(data.bars[data.bars.length - 1].close)}<span>원 · 마지막 거래일 종가</span></p>
            <p className="market-indicator-message">{data.message}</p>
            <Candles bars={data.bars} name={data.stock.name} />
            <details className="market-data-table"><summary>일별 시세 표 보기</summary><div className="market-table-scroll" tabIndex={0} role="region" aria-label={`${data.stock.name} 일별 시세 표`}><table>
              <caption>{data.stock.name} · 가격 원(KRW), 거래량 주 · 수정주가 아님 · 날짜 오름차순</caption>
              <thead><tr><th scope="col">거래일</th><th scope="col">시가</th><th scope="col">고가</th><th scope="col">저가</th><th scope="col">종가</th><th scope="col">거래량</th></tr></thead>
              <tbody>{data.bars.map(bar => <tr key={bar.date}><th scope="row">{bar.date}</th><td>{number(bar.open)}</td><td>{number(bar.high)}</td><td>{number(bar.low)}</td><td>{number(bar.close)}</td><td>{number(bar.volume)}</td></tr>)}</tbody>
            </table></div></details>
          </>}
        <dl className="market-metadata"><div><dt>마지막 거래일</dt><dd>{data.asOf ? <time dateTime={data.asOf}>{data.asOf}</time> : "자료 없음"}</dd></div><div><dt>성공 수신 시각</dt><dd>{data.fetchedAt ? <time dateTime={data.fetchedAt}>{new Date(data.fetchedAt).toLocaleString("ko-KR")}</time> : "수신 기록 없음"}</dd></div><div><dt>출처</dt><dd><a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">{data.sourceName} ↗</a></dd></div></dl>
        <p className="subtle korean-stock-notice">{data.notice}</p>
      </div>}
      <p className="market-chart-source"><a href={`https://kr.tradingview.com/symbols/KRX-${stock.symbol}/`} target="_blank" rel="noopener noreferrer">{stock.name} · TradingView 원문에서 보기 ↗</a></p>
      <p className="subtle korean-stock-notice">국내 종목은 거래일별 가격 자료로 표시합니다. 연동 준비 중이거나 시세를 받을 수 없을 때는 원문 링크를 이용해 주세요. 휴장일·거래정지의 빈 날짜를 만들지 않으며, 액면분할·배당 등 기업행위가 반영된 수정주가가 아닙니다.</p>
    </>}
  </section>;
}

function Candles({ bars, name }: { bars: KoreanStockBar[]; name: string }) {
  const low = Math.min(...bars.map(bar => bar.low));
  const high = Math.max(...bars.map(bar => bar.high));
  const padding = Math.max((high - low) * 0.08, high * 0.005, 1);
  const min = low - padding;
  const max = high + padding;
  const y = (price: number) => 252 - (price - min) / (max - min) * 228;
  const step = 760 / bars.length;
  const x = (index: number) => 70 + step * (index + 0.5);
  const width = Math.max(1, Math.min(12, step * 0.65));
  return <figure className="korean-stock-chart">
    <svg viewBox="0 0 900 300" role="img" aria-label={`${name} 일별 주가 차트`}>
      <desc>시가·종가를 몸통, 고가·저가를 선으로 표시합니다. 정확한 가격과 거래량은 같은 관측값의 일별 시세 표에서 확인할 수 있습니다.</desc>
      {[0, 1, 2, 3, 4].map(tick => { const value = min + (max - min) * tick / 4; return <g key={tick}><line x1="70" y1={y(value)} x2="830" y2={y(value)} className="korean-stock-grid" /><text x="62" y={y(value) + 4} textAnchor="end">{number(value)}</text></g>; })}
      {bars.map((bar, index) => <g key={bar.date} className={bar.close >= bar.open ? "candle-up" : "candle-down"}><title>{bar.date} · 시가 {number(bar.open)}, 고가 {number(bar.high)}, 저가 {number(bar.low)}, 종가 {number(bar.close)}원 · 거래량 {number(bar.volume)}주</title><line x1={x(index)} x2={x(index)} y1={y(bar.high)} y2={y(bar.low)} /><rect x={x(index) - width / 2} y={Math.min(y(bar.open), y(bar.close))} width={width} height={Math.max(1, Math.abs(y(bar.open) - y(bar.close)))} /></g>)}
      <text x="70" y="282" textAnchor="start">{bars[0].date}</text><text x="830" y="282" textAnchor="end">{bars[bars.length - 1].date}</text>
      <text x="840" y="20">원</text>
    </svg>
    <figcaption>거래일 간격으로 표시 · 빨강: 종가 ≥ 시가, 파랑: 종가 &lt; 시가 · 정확한 값은 일별 시세 표에서 확인하세요.</figcaption>
  </figure>;
}
