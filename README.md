# oh-my-finance / front

증권업을 이해하기 위한 FinMATE 학습 서비스의 React 19 + TypeScript + Vite 프런트엔드입니다. 이 디렉터리 전체가 독립 `front` 저장소의 루트가 됩니다.

## 개발

Node.js는 `.nvmrc` 기준입니다. API는 별도로 `back` 저장소에서 실행합니다.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

기본 API는 `http://localhost:8080/api`, 화면은 `http://localhost:5173`입니다. 다른 API를 사용할 때 `.env.local`의 `VITE_API_BASE_URL`을 변경합니다. 배포처럼 같은 origin의 `/api`로 부르려면 `API_PROXY_TARGET=http://localhost:8080 VITE_API_BASE_URL=/api npm run dev`로 띄웁니다(개발 서버와 `vite preview`가 `/api`를 백엔드로 넘깁니다). omf-e2e가 이 방식을 씁니다. 인증은 Spring API의 DB 해시 세션을 사용하며, 진단 이력·학습 기록도 API로 조회합니다. 브라우저 토큰 저장은 현재 `localStorage` 방식입니다.

```powershell
npm run lint
npm run build
```

## 배포

배포는 사람이 GitHub Actions의 **Deploy frontend**를 `main`에서 실행하고 대상(`gcp`/`aws`)을 고릅니다(장기 키 없이 OIDC). 두 대상 모두 같은 origin의 `/api`를 쓰므로 `VITE_API_BASE_URL=/api`로 빌드합니다.

| 대상 | 호스팅 | `/api` | 저장소 변수 |
|---|---|---|---|
| A (GCP) | Firebase Hosting, 설정은 `firebase.json`(rewrite·SPA 폴백·보안 헤더·캐시) | rewrite → Cloud Run `omf-backend` | `GCP_WIF_PROVIDER`, `GCP_DEPLOY_FRONTEND_SA`, `GCP_PROJECT_ID` |
| C (AWS) | S3 + CloudFront(보안 헤더는 CloudFront 정책) | CloudFront behavior → ALB | `AWS_DEPLOY_FRONTEND_ROLE_ARN`, `AWS_FRONTEND_BUCKET`, `AWS_CLOUDFRONT_DISTRIBUTION_ID` |

변수 값은 omf-infra Terraform 출력입니다. `VITE_` 변수는 브라우저 번들에 들어가므로 비밀값을 넣지 않습니다. `netlify.toml`은 채택하지 않은 대안 D의 기록입니다(ADR-020).

## 경계와 다음 단계

- 이 저장소는 화면·상호작용·API 호출·프런트 빌드 설정을 소유합니다.
- DB 접근과 업무 규칙은 `back`, 배포 운영은 `infra`, UR/FR/NFR과 학습 로드맵은 `docs`가 소유합니다.
- 현재 구현은 성향 진단·용어·개념·퀴즈·시뮬레이션·복습·콘텐츠 운영·차트 복기(합성 데이터)입니다. 증권업 입문 과정과 경량 모델 실험은 계획입니다.

조직 저장소 대상: [back](https://github.com/oh-my-finance/omf-backend), [infra](https://github.com/oh-my-finance/omf-infra), [docs](https://github.com/oh-my-finance/omf-docs). 원격 생성·권한·기본 브랜치는 이 작업에서 확인되지 않았습니다.