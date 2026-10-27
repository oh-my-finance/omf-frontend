/**
 * 불러오기 실패 안내. 화면마다 문구만 다르고 모양·역할은 같게 둔다.
 * role="alert"로 스크린리더에 바로 알리고, 다시 시도할 수 있으면 버튼을 붙인다.
 */
export default function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="panel-error load-error">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}
