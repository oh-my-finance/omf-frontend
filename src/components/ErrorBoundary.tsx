import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

/**
 * 최상위 오류 경계. 화면을 그리다 예외가 나도 흰 화면 대신 안내와 복구 방법(새로고침·홈)을 보여 준다.
 * 이용자에게는 오류 메시지나 스택을 보여 주지 않고, 개발 중 확인용으로 콘솔에만 남긴다.
 * 라우터 상태가 깨졌을 수 있으므로 링크 대신 전체 페이지 이동으로 복구한다.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("화면 렌더링 오류", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="app-error" role="alert" aria-live="assertive">
        <div className="app-error-card">
          <span className="eyebrow">일시적인 문제</span>
          <h1>화면을 표시하지 못했어요</h1>
          <p>잠시 문제가 생겼습니다. 새로고침하면 대부분 다시 볼 수 있어요. 계속되면 홈에서 다시 시작해 주세요. 입력하던 내용은 저장되지 않았을 수 있습니다.</p>
          <div className="app-error-actions">
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>새로고침</button>
            <a className="btn btn-secondary" href="/">홈으로</a>
          </div>
        </div>
      </main>
    );
  }
}
