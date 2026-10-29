import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

const SECTIONS = {
  learning: {
    label: "금융 학습",
    links: [
      { to: "/roadmap", label: "학습 로드맵" },
      { to: "/course", label: "입문 과정" },
      { to: "/learn", label: "개념 학습" },
      { to: "/glossary", label: "용어 사전" },
    ],
  },
  practice: {
    label: "실습",
    links: [
      { to: "/practice", label: "모의투자" },
      { to: "/replay", label: "차트 복기" },
      { to: "/market", label: "시장 관찰" },
    ],
  },
};

type Props = {
  section: keyof typeof SECTIONS;
  /** 메뉴에서 현재 화면에 해당하는 경로. */
  current: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  /** 상세 화면처럼 메뉴 아래 한 단계가 더 있을 때의 이름. */
  detail?: string;
};

/** 하위 화면 머리: 현재 위치, 화면 제목, 같은 묶음의 화면으로 가는 탭. */
export default function SubPageHeader({ section, current, title, description, meta, actions, detail }: Props) {
  const group = SECTIONS[section];
  const currentLabel = group.links.find(link => link.to === current)?.label ?? title;
  return (
    <div className="subpage-head">
      <div className="subpage-inner">
        <nav className="breadcrumb-trail" aria-label="현재 위치">
          <ol>
            <li><Link to="/">홈</Link></li>
            <li>{group.label}</li>
            {detail ? <><li><Link to={current}>{currentLabel}</Link></li><li aria-current="page">{detail}</li></> : <li aria-current="page">{currentLabel}</li>}
          </ol>
        </nav>
        {!detail && (
          <div className="subpage-title">
            <div>
              <h1>{title}</h1>
              {description && <p className="subpage-description">{description}</p>}
              {meta && <p className="subpage-meta">{meta}</p>}
            </div>
            {actions && <div className="subpage-actions">{actions}</div>}
          </div>
        )}
      </div>
      <nav className="subpage-tabs" aria-label={`${group.label} 메뉴`}>
        <div className="subpage-inner">
          {group.links.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "is-active" : undefined)}>{link.label}</NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
