import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RiAppleFill, RiGoogleFill, RiKakaoTalkFill } from "@remixicon/react";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import "../styles/login-refinement.css";

/** Remix Icon에 네이버 로고가 없어 N 모양을 직접 그린다. */
function NaverMark() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" /></svg>;
}

/**
 * 간편 로그인은 아직 목업이다. 요구사항상 OAuth를 지원하지 않으므로 실제 인증을 붙이기 전까지 화면에 내보내지 않는다.
 * 켜면 국내 서비스 관례대로 카카오·네이버·Google·Apple 순서로, 제공자별 버튼 색을 따른 전체 너비 막대로 쌓는다.
 */
const SOCIAL_LOGIN_ENABLED = false;
const socialProviders: { id: string; label: string; mark: ReactNode }[] = [
  { id: "kakao", label: "카카오", mark: <RiKakaoTalkFill size={20} aria-hidden="true" /> },
  { id: "naver", label: "네이버", mark: <NaverMark /> },
  { id: "google", label: "Google", mark: <RiGoogleFill size={20} aria-hidden="true" /> },
  { id: "apple", label: "Apple", mark: <RiAppleFill size={20} aria-hidden="true" /> },
];

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

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup(email, password, name);
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
        <form className="login-form" onSubmit={submit} aria-busy={loading}>
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

          {error && <div className="error-text" role="alert">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "처리 중..." : tab === "login" ? "로그인" : "가입하기"}
          </button>

          <p className="login-switch">
            {tab === "login" ? "아직 메이트가 아니신가요? " : "이미 계정이 있으신가요? "}
            <a href={tab === "login" ? "#signup" : "#login"} onClick={(event) => { event.preventDefault(); selectTab(tab === "login" ? "signup" : "login"); }}>
              {tab === "login" ? "회원가입" : "로그인"}
            </a>
          </p>
          {SOCIAL_LOGIN_ENABLED && <div className="login-social">
            <p className="login-social-title">{tab === "login" ? "간편 로그인" : "간편 가입"}</p>
            <div className="login-social-list">
              {socialProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  data-provider={provider.id}
                  onClick={() => setSocialNotice(`${provider.label} 로그인은 준비 중이에요. 지금은 이메일로 ${tab === "login" ? "로그인" : "가입"}해 주세요.`)}
                >
                  {provider.mark}<span>{provider.label}로 계속하기</span>
                </button>
              ))}
            </div>
            <p className="login-social-status" role="status">{socialNotice}</p>
          </div>}
        </form>
      </main>
    </div>
  );
}
