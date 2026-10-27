import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import LoadError from "../components/LoadError";
import Icon from "../components/Icon";
import { api } from "../api/client";
import type { ProductResponse } from "../api/types";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    api
      .getProduct(productId)
      .then(setProduct)
      .catch(() => setError("상품 정보를 찾을 수 없습니다."));
  }, [productId]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Header />

      <div className="legacy-pad">
        <div style={{ fontSize: 13, color: "var(--text-faint)" }}>
          분석 결과 &nbsp;›&nbsp; 탐색 카테고리 &nbsp;›&nbsp; <span style={{ color: "var(--text)", fontWeight: 600 }}>상품 상세</span>
        </div>
        <a
          href="#"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginTop: 14, width: "fit-content" }}
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          <Icon name="prev" size={16} />
          목록으로
        </a>
      </div>

      <div className="legacy-body" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {error ? (
          <LoadError message={error} />
        ) : !product ? (
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>불러오는 중...</div>
        ) : (
          <div style={{ width: 640, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-primary">{product.categoryName}</span>
                <span className="badge badge-warn">위험등급 {product.riskGrade}등급</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.4 }}>{product.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
                <Icon name="time" size={16} />
                예상 투자 기간: {product.expectedPeriod}
              </div>
            </div>

            <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>상품 설명</div>
              <div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.7 }}>{product.description}</div>
            </div>

            <p className="notice-line" style={{ margin: 0 }}>{product.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
