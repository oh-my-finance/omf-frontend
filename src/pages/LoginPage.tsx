import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import "../styles/login-refinement.css";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // 보호된 화면에서 넘어왔다면 로그인 후 그 화면으로 돌려보낸다. 외부 주소로는 보내지 않는다.
  const from = (location.state as { from?: string } | null)?.from;
  const next = from && from.startsWith("/") && !from.startsWith("//") ? from : "/start";

  const selectTab = (value: "login" | "signup") => {
    setTab(value);
    setError(null);
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
          <span className="login-room-label"><span />나의 금융 공부방</span>
          <h2>함께 읽고,<br />하나씩 알아가요.</h2>
          <p>주식과 채권의 기초부터 낯선 금융 용어까지.<br />오늘도 내 속도로, 한 페이지부터 시작해요.</p>
        </div>
        <div className="login-campus-wrap">
          <span className="login-campus-badge"><Icon name="book" size={16} />한 페이지씩, 내 속도로</span>
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
            <span className="login-form-emblem"><Icon name="spark" size={20} /></span>
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
          <div className="login-public-preview">
            <p>먼저 구경하고 싶다면 <span>로그인 없이도 괜찮아요</span></p>
            <div>
              <Link to="/course"><span className="login-preview-icon"><Icon name="book" size={18} /></span><span>입문 과정<small>기초부터 차근차근</small></span><Icon name="arrow" size={15} /></Link>
              <Link to="/glossary"><span className="login-preview-icon"><Icon name="compass" size={18} /></span><span>용어 사전<small>궁금한 말 찾아보기</small></span><Icon name="arrow" size={15} /></Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
