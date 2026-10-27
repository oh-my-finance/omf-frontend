import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ApiError, api } from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * 계정 설정(FR-36). 비밀번호 변경과 탈퇴.
 * 탈퇴는 되돌릴 수 없으므로 비밀번호와 확인 체크를 함께 받는다.
 */
export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="app-page">
      <Header />
      <main className="practice-main settings-main">
        <div className="practice-head">
          <div>
            <span className="eyebrow">계정 설정</span>
            <h1>내 계정</h1>
            {user && <p className="intro-copy">{user.name} · {user.email}</p>}
          </div>
        </div>
        <PasswordForm />
        <WithdrawForm />
      </main>
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setDone(false);
    if (next.length < 8) return setError("새 비밀번호는 8자 이상이어야 합니다.");
    if (next !== confirm) return setError("새 비밀번호 확인이 일치하지 않습니다.");
    setSaving(true);
    setError(null);
    try {
      await api.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 403 ? "현재 비밀번호가 올바르지 않습니다." : e instanceof Error ? e.message : "바꾸지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card settings-card" onSubmit={submit} noValidate>
      <h2>비밀번호 변경</h2>
      <p className="subtle">바꾸면 지금 이 기기만 로그인 상태로 남고, 다른 기기에서는 다시 로그인해야 합니다.</p>
      <label className="field-label">
        현재 비밀번호
        <input className="field-input" type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} required />
      </label>
      <label className="field-label">
        새 비밀번호(8자 이상)
        <input className="field-input" type="password" autoComplete="new-password" minLength={8} maxLength={64} value={next} onChange={e => setNext(e.target.value)} required />
      </label>
      <label className="field-label">
        새 비밀번호 확인
        <input className="field-input" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </label>
      {error && <p className="error-text" role="alert">{error}</p>}
      {done && <p className="settings-done" role="status">비밀번호를 바꿨습니다. 다른 기기의 로그인은 끊었습니다.</p>}
      <button className="btn btn-primary" type="submit" disabled={saving || !current || !next || !confirm}>
        {saving ? "바꾸는 중…" : "비밀번호 바꾸기"}
      </button>
    </form>
  );
}

function WithdrawForm() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.role === "ADMIN";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.withdraw(password);
      // 보호된 화면에서 로그아웃하면 로그인 화면으로 밀려나므로, 홈으로 먼저 옮긴 뒤 로컬 세션을 정리한다.
      // 서버 세션은 탈퇴와 함께 이미 지워졌다.
      navigate("/", { replace: true, state: { notice: "탈퇴했습니다. 그동안의 기록은 모두 지웠습니다." } });
      await logout().catch(() => undefined);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 403 ? "비밀번호가 올바르지 않습니다." : e instanceof Error ? e.message : "탈퇴하지 못했습니다.");
      setSaving(false);
    }
  };

  return (
    <form className="card settings-card settings-danger" onSubmit={submit} noValidate>
      <h2>탈퇴</h2>
      <p>
        탈퇴하면 진단 결과, 확인 문제 기록과 복습 일정, 저장한 용어, 차트 복기 기록이 모두 지워지고 되돌릴 수 없습니다.
        같은 이메일로는 다시 가입할 수 있습니다.
      </p>
      {isAdmin ? (
        <p className="subtle">관리자 계정은 콘텐츠 편집 이력을 남겨야 하므로 여기서 탈퇴할 수 없습니다. 운영자에게 요청하세요.</p>
      ) : (
        <>
          <label className="field-label">
            비밀번호
            <input className="field-input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <label className="replay-choice">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            기록이 모두 지워지고 되돌릴 수 없다는 것을 확인했습니다.
          </label>
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="btn btn-danger" type="submit" disabled={saving || !password || !agreed}>
            {saving ? "탈퇴하는 중…" : "탈퇴하기"}
          </button>
        </>
      )}
    </form>
  );
}
