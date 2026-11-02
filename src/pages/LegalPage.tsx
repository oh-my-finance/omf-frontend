import { Fragment, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Icon from "../components/Icon";
import SiteFooter from "../components/SiteFooter";
import SubPageHeader from "../components/SubPageHeader";
import { LEGAL_DRAFT_NOTICE, type LegalBlock, type LegalDocument } from "../content/legal";

/** [운영자 이름] 같은 미정 자리표시를 강조해, 시행 전에 빠짐없이 채웠는지 눈으로 확인할 수 있게 한다. */
function withPlaceholders(text: string): ReactNode {
  const parts = text.split(/(\[[^\]]+\])/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    /^\[[^\]]+\]$/.test(part) ? <mark key={index} className="legal-placeholder">{part}</mark> : <Fragment key={index}>{part}</Fragment>,
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return <p>{withPlaceholders(block.text)}</p>;
    case "note":
      return <p className="legal-note">{withPlaceholders(block.text)}</p>;
    case "list": {
      const items = block.items.map((item, index) => <li key={index}>{withPlaceholders(item)}</li>);
      return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case "table":
      return (
        <div className="legal-table-wrap">
          <table className="legal-table">
            <caption>{block.caption}</caption>
            <thead><tr>{block.head.map(cell => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => cellIndex === 0
                    ? <th key={cellIndex} scope="row">{withPlaceholders(cell)}</th>
                    : <td key={cellIndex}>{withPlaceholders(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/** 개인정보 처리방침·이용약관 공통 화면. 내용은 content/legal.ts의 정적 문서를 그대로 그린다. */
export default function LegalPage({ doc }: { doc: LegalDocument }) {
  const { hash } = useLocation();
  // 가입 화면·고지의 "/terms#education-only" 같은 링크로 들어오면 해당 조항으로 이동한다(라우터는 해시로 스크롤하지 않는다).
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [hash, doc.path]);

  return (
    <div className="app-page">
      <Header />
      <SubPageHeader
        section="legal"
        current={doc.path}
        title={doc.title}
        description={doc.summary}
        meta={<>문서 버전 {doc.version} · 시행일 {withPlaceholders(doc.effectiveDate)}</>}
      />
      <main className="practice-main legal-main">
        <p className="legal-draft" role="note">
          <Icon name="alert" size={18} />
          <span><strong>{LEGAL_DRAFT_NOTICE}</strong> 이 문서는 현재 서비스 코드가 처리하는 정보를 기준으로 작성한 초안입니다. 강조 표시한 [대괄호] 항목은 시행 전에 채워야 합니다.</span>
        </p>
        <div className="legal-layout">
          <nav className="legal-toc" aria-label={`${doc.title} 목차`}>
            <strong>목차</strong>
            <ol>
              {doc.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
            </ol>
          </nav>
          <article className="legal-body">
            {doc.sections.map(section => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                {section.blocks.map((block, index) => <Block key={index} block={block} />)}
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
