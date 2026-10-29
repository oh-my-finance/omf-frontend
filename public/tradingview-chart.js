/* 공급자 스크립트의 전역 이벤트는 이 문서와 함께 소멸한다. 인라인 실행 코드는 사용하지 않는다. */
(() => {
  "use strict";
  const allowedSymbols = new Set(["NASDAQ:AAPL", "NASDAQ:MSFT", "NYSE:KO", "AMEX:SPY"]);
  const symbol = new URLSearchParams(window.location.search).get("symbol");
  const host = document.getElementById("chart");
  const report = status => window.parent.postMessage({ channel: "finmate-tradingview", status }, window.location.origin);
  if (!host || !allowedSymbols.has(symbol)) {
    if (host) host.textContent = "지원하지 않는 차트 종목입니다.";
    report("blocked");
    return;
  }

  const widget = document.createElement("div");
  widget.className = "tradingview-widget-container__widget";
  const copyright = document.createElement("div");
  copyright.className = "tradingview-widget-copyright";
  const source = document.createElement("a");
  source.href = `https://www.tradingview.com/symbols/${symbol.replace(":", "-")}/`;
  source.target = "_blank";
  source.rel = "noopener nofollow";
  const credit = document.createElement("span");
  credit.className = "blue-text";
  credit.textContent = `${symbol} chart by TradingView`;
  source.appendChild(credit);
  copyright.appendChild(source);

  let inserted = false;
  const observer = new MutationObserver(() => {
    const frame = host.querySelector("iframe");
    if (!frame) return;
    inserted = true;
    frame.title = `${symbol} 주식 차트 · TradingView`;
    // iframe 생성만 알린다. 외부 데이터의 수신·표시 성공을 의미하지 않는다.
    report("external");
  });
  observer.observe(host, { childList: true, subtree: true });

  const script = document.createElement("script");
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.type = "text/javascript";
  script.async = true;
  script.textContent = JSON.stringify({
    autosize: true,
    symbol,
    interval: "D",
    timezone: "Asia/Seoul",
    theme: "light",
    style: "1",
    locale: "kr",
    allow_symbol_change: false,
    calendar: false,
    withdateranges: true,
    support_host: "https://www.tradingview.com",
  });
  script.onerror = () => report("blocked");
  host.replaceChildren(widget, copyright, script);
  const timeout = window.setTimeout(() => { if (!inserted) report("blocked"); }, 10_000);
  window.addEventListener("pagehide", () => {
    observer.disconnect();
    window.clearTimeout(timeout);
  }, { once: true });
})();
