import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { SIGNUP_PRIVACY_SUMMARY, SIGNUP_TRANSFER_SUMMARY } from "../content/legal";
import "../styles/login-refinement.css";

/**
 * 간편 로그인은 아직 목업이다. 실제 OAuth를 붙이기 전까지 누르기 전부터 "준비 중"임을 보여 주고(aria-disabled),
 * 누르면 이메일로 이용하라는 안내만 띄운다. 제공자 브랜드 로고·색은 정식 연동 전까지 쓰지 않는다(출시 점검 P0-5).
 */
const socialProviders: { id: string; label: string }[] = [
  { id: "kakao", label: "카카오" },
  { id: "naver", label: "네이버" },
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
];

/** 가입 필수 동의 항목. 하나라도 빠지면 가입 버튼을 막는다. */
type ConsentKey = "terms" | "privacy" | "transfer" | "age";
const CONSENT_KEYS: ConsentKey[] = ["terms", "privacy", "transfer", "age"];
const NO_CONSENT: Record<ConsentKey, boolean> = { terms: false, privacy: false, transfer: false, age: false };

export default function LoginPage() {
  const location = useLocation();
  const state = location.state as { from?: string; tab?: string } | null;
  // 상단의 회원가입 버튼으로 들어오면 가입 탭부터 연다.
  const [tab, setTab] = useState<"login" | "signup">(state?.tab === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialNotice, setSocialNotice] = useState("");
  const [consent, setConsent] = useState<Record<ConsentKey, boolean>>(NO_CONSENT);
  const allAgreed = CONSENT_KEYS.every(key => consent[key]);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  // 보호된 화면에서 넘어왔다면 로그인 후 그 화면으로 돌려보낸다. 외부 주소로는 보내지 않는다.
  const from = state?.from;
  const next = from && from.startsWith("/") && !from.startsWith("//") ? from : "/start";

  const selectTab = (value: "login" | "signup") => {
    setTab(value);
    setError(null);
    setSocialNotice("");
  };

  const toggleConsent = (key: ConsentKey, checked: boolean) => setConsent(prev => ({ ...prev, [key]: checked }));
  const toggleAll = (checked: boolean) => setConsent({ terms: checked, privacy: checked, transfer: checked, age: checked });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (tab === "signup" && !allAgreed) {
      setError("필수 항목에 모두 동의해야 가입할 수 있어요.");
      return;
    }
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        // 서버가 동의 항목을 약관·처리방침 버전, 동의 시각과 함께 기록한다(user_consents). 하나라도 빠지면 400이다.
        await signup(email, password, name, {
          terms: consent.terms,
          privacy: consent.privacy,
          overseasTransfer: consent.transfer,
          ageOver14: consent.age,
        });
      }
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <aside className="login-aside" aria-label="FinMATE 금융 학습">
        <div className="login-aside-top"><Brand /></div>
        <div className="login-aside-copy">
          <span className="login-room-label">나의 금융 공부방</span>
          <h2>함께 읽고,<br />하나씩 알아가요.</h2>
          <p>주식과 채권의 기초부터 낯선 금융 용어까지.<br />오늘도 내 속도로, 한 페이지부터 시작해요.</p>
        </div>
        <div className="login-campus-wrap">
          <img
            className="login-campus"
            src="/images/finance-campus.webp"
            alt="책과 금융 차트가 있는 캠퍼스에서 함께 배우는 사람들의 일러스트"
            width={1536}
            height={1024}
          />
        </div>
        <div className="login-aside-note"><Icon name="check" size={14} />기초 개념<span />용어 노트<span />나의 학습 기록</div>
      </aside>

      <main className="login-main">
        <div className="login-main-top">
          <div className="login-mobile-brand"><Brand compact /></div>
          <Link to="/" className="login-back">← 홈으로</Link>
        </div>
        <form className={`login-form${tab === "signup" ? " is-signup" : ""}`} onSubmit={submit} aria-busy={loading}>
          <div className="login-form-heading">
            <span className="login-form-emblem"><Icon name="stock" size={26} /></span>
            <h1>{tab === "login" ? "반가워요, 메이트!" : "첫 공부를 함께해요"}</h1>
            <p>{tab === "login" ? "배우던 내용을 이어서 살펴봐요." : "계정을 만들고 나만의 학습 기록을 남겨요."}</p>
          </div>

          <div className="login-tabs" aria-label="계정 접속 방법">
            <button type="button" aria-pressed={tab === "login"} onClick={() => selectTab("login")}>로그인</button>
            <button type="button" aria-pressed={tab === "signup"} onClick={() => selectTab("signup")}>회원가입</button>
          </div>

          <div className="login-fields">
            {tab === "signup" && (
              <div>
                <label className="field-label" htmlFor="login-name">이름</label>
                <input
                  id="login-name"
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div>
              <label className="field-label" htmlFor="login-email">이메일</label>
              <input
                id="login-email"
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="login-password">비밀번호</label>
              <input
                id="login-password"
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                minLength={8}
                required
              />
            </div>
          </div>

          {tab === "signup" && (
            <fieldset className="signup-consent" aria-describedby={allAgreed ? undefined : "consent-hint"}>
              <legend className="sr-only">가입 동의(모두 필수)</legend>
              <label className="consent-all">
                <input type="checkbox" checked={allAgreed} onChange={(e) => toggleAll(e.target.checked)} />
                <span>필수 항목에 모두 동의</span>
              </label>
              <ul className="consent-list">
                <li>
                  <label>
                    <input type="checkbox" checked={consent.terms} onChange={(e) => toggleConsent("terms", e.target.checked)} required />
                    <span><em>필수</em>이용약관 동의</span>
                  </label>
                  <Link to="/terms" target="_blank" rel="noopener" aria-label="이용약관 보기(새 창)">보기</Link>
                </li>
                <li>
                  <label>
                    <input type="checkbox" checked={consent.privacy} onChange={(e) => toggleConsent("privacy", e.target.checked)} aria-describedby="consent-privacy-desc" required />
                    <span><em>필수</em>개인정보 수집·이용 동의</span>
                  </label>
                  <Link to="/privacy" target="_blank" rel="noopener" aria-label="개인정보 처리방침 보기(새 창)">보기</Link>
                  <p id="consent-privacy-desc" className="consent-desc">
                    {SIGNUP_PRIVACY_SUMMARY.items} · {SIGNUP_PRIVACY_SUMMARY.purpose} · {SIGNUP_PRIVACY_SUMMARY.retention}
                  </p>
                </li>
                <li>
                  <label>
                    <input type="checkbox" checked={consent.transfer} onChange={(e) => toggleConsent("transfer", e.target.checked)} aria-describedby="consent-transfer-desc" required />
                    <span><em>필수</em>개인정보 국외 이전 동의</span>
                  </label>
                  <Link to="/privacy#outsourcing" target="_blank" rel="noopener" aria-label="국외 이전 내용 보기(새 창)">보기</Link>
                  <p id="consent-transfer-desc" className="consent-desc">{SIGNUP_TRANSFER_SUMMARY}</p>
                </li>
                <li>
                  <label>
                    <input type="checkbox" checked={consent.age} onChange={(e) => toggleConsent("age", e.target.checked)} required />
                    <span><em>필수</em>만 14세 이상입니다</span>
                  </label>
                </li>
              </ul>
              {!allAgreed && <p id="consent-hint" className="consent-hint">필수 항목에 모두 동의하면 가입할 수 있어요.</p>}
            </fieldset>
          )}

          {error && <div className="error-text" role="alert">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit" disabled={loading || (tab === "signup" && !allAgreed)}>
            {loading ? "처리 중..." : tab === "login" ? "로그인" : "가입하기"}
          </button>

          {/* 가입 탭에서는 위의 탭으로 충분해 전환 문구를 숨기고 높이를 아낀다. */}
          {tab === "login" && <p className="login-switch">
            아직 메이트가 아니신가요?{" "}
            <a href="#signup" onClick={(event) => { event.preventDefault(); selectTab("signup"); }}>회원가입</a>
          </p>}
          {/* 가입 탭은 동의 항목이 늘어나 데스크톱 한 화면에 담기 위해 간편 가입 목업을 보여 주지 않는다. */}
          {tab === "login" && <section className="login-social" aria-labelledby="login-social-title">
            <p className="login-social-title" id="login-social-title">
              간편 로그인<span className="soon-badge">준비 중</span>
              <span className="login-social-caption">아직 사용할 수 없어요</span>
            </p>
            <div className="login-social-list">
              {socialProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  data-provider={provider.id}
                  aria-disabled="true"
                  aria-label={`${provider.label} 로그인 (준비 중, 사용할 수 없음)`}
                  onClick={() => setSocialNotice(`${provider.label} 로그인은 준비 중이에요. 지금은 이메일로 로그인하거나 가입해 주세요.`)}
                >
                  {provider.label}
                </button>
              ))}
            </div>
            <p className="login-social-status" role="status">{socialNotice}</p>
          </section>}
        </form>
      </main>
    </div>
  );
}
