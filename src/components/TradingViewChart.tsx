import { useEffect, useRef, useState } from "react";

/** 공식 임베드를 별도 문서에서 실행해 재시도·화면 이동 시 공급자 이벤트도 함께 정리한다. */
export default function TradingViewChart({ symbol }: { symbol: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "external" | "blocked">("loading");

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const data: unknown = event.data;
      if (!data || typeof data !== "object" || !("channel" in data) || data.channel !== "finmate-tradingview" || !("status" in data)) return;
      if (data.status === "external" || data.status === "blocked") setStatus(data.status);
    };
    window.addEventListener("message", receive);
    const timeout = window.setTimeout(() => setStatus(value => value === "loading" ? "blocked" : value), 12_000);
    return () => {
      window.removeEventListener("message", receive);
      window.clearTimeout(timeout);
    };
  }, []);

  return <>
    <p className="subtle chart-load-status" role="status">{status === "loading"
      ? "TradingView에 외부 차트를 요청하는 중…"
      : status === "blocked"
        ? "외부 차트를 불러오지 못했거나 응답이 지연되고 있습니다. 아래에서 다시 불러오거나 TradingView 원문을 확인해 주세요."
        : "외부 차트 영역을 열었습니다. 시세의 제공 여부·기준 시각·지연은 위젯 안에서 확인해 주세요. 차트가 보이지 않으면 원문을 열거나 다시 불러오세요."}</p>
    <div className={`stock-chart-frame${status === "blocked" ? " is-blocked" : ""}`}>
      <iframe ref={frame} className="stock-chart-wrapper" src={`/tradingview-chart.html?symbol=${encodeURIComponent(symbol)}`} title={`${symbol} 주식 차트 · TradingView`} />
    </div>
  </>;
}
