import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";

const PUBLIC_LINKS = [
  { to: "/roadmap", label: "학습 로드맵" },
  { to: "/course", label: "입문 과정" },
  { to: "/learn", label: "개념 학습" },
  { to: "/glossary", label: "용어 사전" },
  { to: "/practice", label: "모의투자" },
  { to: "/replay", label: "차트 복기" },
  { to: "/market", label: "시장 관찰" },
  { to: "/models", label: "모델 실험실" },
];

/**
 * 상단 메뉴. 위쪽 줄은 계정·안내 같은 보조 링크, 아래쪽 줄은 학습 메뉴다.
 * 학습 메뉴는 누구에게나 보이고, 진단은 로그인 후, 콘텐츠 관리는 관리자에게만 보인다.
 * 좁은 화면에서는 두 줄을 하나로 접어 두고 버튼으로 펼친다.
 */
export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    ...PUBLIC_LINKS,
    ...(user ? [{ to: "/start", label: "성향 진단" }] : []),
    // /admin은 용어 탭으로 보내고, 용어·학습 개념 탭 어디에 있든 메뉴가 활성으로 보이게 한다.
    ...(user?.role === "ADMIN" ? [{ to: "/admin", label: "콘텐츠 관리" }] : []),
  ];

  const signOut = async () => {
    setOpen(false);
    try { await logout(); } catch { /* 로컬 세션은 이미 정리됨 */ }
    navigate("/");
  };

  const utility = user ? (
    <>
      <NavLink to="/settings" className="header-account-link" aria-label={`${user.name} 님 계정 설정`} onClick={() => setOpen(false)}>
        <span className="avatar" aria-hidden="true">{user.name.charAt(0)}</span>
        <span className="header-name">{user.name} 님</span>
      </NavLink>
      <NavLink to="/me" onClick={() => setOpen(false)}>내 학습</NavLink>
      <button type="button" onClick={signOut}>로그아웃</button>
    </>
  ) : (
    <>
      <button type="button" onClick={() => { setOpen(false); navigate("/login"); }}>로그인</button>
      <button type="button" onClick={() => { setOpen(false); navigate("/login", { state: { tab: "signup" } }); }}>회원가입</button>
    </>
  );

  return (
    <header className="site-header">
      <div className="site-utility">
        <nav className="site-utility-inner" aria-label="계정과 이용 안내">
          {utility}
          <Link to="/models">콘텐츠·모델 안내</Link>
        </nav>
      </div>
      <div className="site-header-inner">
        <Brand />

        <button
          type="button"
          className="nav-toggle-button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen(value => !value)}
        >
          <span className={`menu-lines${open ? " is-open" : ""}`} aria-hidden="true"><i /><i /></span>
          {open ? "메뉴 닫기" : "전체 메뉴"}
        </button>

        <nav id="site-nav" className={`site-nav${open ? " is-open" : ""}`} aria-label="주요 메뉴">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-nav-link${isActive ? " is-active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <span className="site-nav-account">{utility}</span>
        </nav>
      </div>
    </header>
  );
}
