# omf-frontend

FinMATE 웹. React 19 + Vite + TypeScript, react-router. API 클라이언트는 `src/api/client.ts`, 타입은 `src/api/types.ts`.

## 명령

- Node 버전: `.nvmrc`
- `npm ci` → `npm run dev` (http://localhost:5173, API는 `VITE_API_BASE_URL`)
- 검증: `npm run lint` 그리고 `npm run build`

## 규칙

- 배포 환경은 같은 origin `/api`를 쓴다. API 주소를 코드에 하드코딩하지 않는다.
- `VITE_` 변수는 브라우저에 공개된다. 비밀값을 넣지 않는다.
- 백엔드 응답 타입이 바뀌면 `src/api/types.ts`와 omf-docs의 API 계약을 함께 맞춘다.

## 협업 규칙

- 작업 묶음(WP)과 담당은 [omf-docs/project/work-plan.md](https://github.com/oh-my-finance/omf-docs/blob/main/project/work-plan.md)를 따른다. 맡지 않은 WP의 파일은 고치지 않는다.
- 브랜치 `wp<번호>-<이름>`에서 작업하고 `main`에는 PR로 합친다. force push 금지.
- API·환경변수·상태 확인 경로를 바꾸면 먼저 omf-docs/contracts/를 고친다([runtime.md](https://github.com/oh-my-finance/omf-docs/blob/main/contracts/runtime.md)).
- 커밋 메시지는 `feat(scope): 한국어 요약` 형식. 주석·문서는 한국어.
- 커밋·PR·병합 메시지에 AI 도구 공동 작성자 트레일러(`Co-Authored-By`, 세션 링크)나 생성 문구(`Generated with ...`)를 넣지 않는다. squash 병합 메시지도 직접 적는다. 문서에 작업자를 AI 도구 이름으로 적지 않는다.
- 비밀값, `.env`(예시 제외), Terraform state, 실제 `*.tfvars`는 커밋하지 않는다.
- `terraform apply`, 클라우드 리소스 생성, 원격 저장소 설정 변경은 사람의 확인 후에만 한다.
- 교육용 서비스다. 매매 주문·투자 권유 기능은 만들지 않는다.
