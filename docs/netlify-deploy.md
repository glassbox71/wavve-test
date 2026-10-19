# wavve-test.netlify.app 배포

## Google 로그인 승인 도메인 (필수)

1. Firebase Console에서 **ott-test-1f684** 프로젝트를 선택합니다.
2. Authentication → Settings → Authorized domains에 `wavve-test.netlify.app`을 추가합니다. 프로토콜(`https://`)이나 경로는 넣지 않습니다. 실제 접속하는 다른 사용자 지정 도메인이 있으면 개별 추가합니다.
3. Authentication → Sign-in method에서 Google 제공업체를 활성화하고 프로젝트 지원 이메일을 설정합니다.
4. Google Cloud에서 Firebase API 키에 웹사이트 제한을 걸었다면 `https://wavve-test.netlify.app/*`를 허용합니다.

`auth/unauthorized-domain`은 서버의 OAuth 승인 설정 오류입니다. 환경변수 변경이나 재빌드만으로 승인 도메인이 추가되지 않습니다. `VITE_FIREBASE_AUTH_DOMAIN`은 `ott-test-1f684.firebaseapp.com`을 유지합니다.

## 게시

- GitHub 연동 배포: 이 변경을 `glassbox71/wavve-test`의 `main`에 push하면 연결된 Netlify 사이트가 새 커밋으로 빌드합니다. Netlify의 Production branch가 `main`, Build command가 `npm run build`, Publish directory가 `dist`인지 확인합니다. 로컬 작업 공간의 수정만으로는 GitHub 연동 배포에 반영되지 않습니다.

- 현재 빌드는 Git에서 무시되는 `.env.local`의 새 설정을 사용합니다. 이 파일을 커밋하지 않습니다. Vite는 환경변수를 빌드 시점에 번들에 반영하므로 변수 변경 후 반드시 다시 빌드해야 합니다.
- 기존 Netlify 사이트 **wavve-test**의 Site configuration → Environment variables에서 제공된 최신 `VITE_TMDB_API_KEY`, `VITE_YOUTUBE_API_KEY`, `VITE_FIREBASE_*` 값을 안전하게 설정하세요. 기존 사이트의 값이 로컬 설정과 다르면 Netlify 재빌드 시 기존 값이 우선될 수 있습니다.
- 수동 게시: 기존 사이트의 Deploys 화면에서 배포 ZIP을 풀어 `index.html`이 들어 있는 **폴더의 내용**을 업로드합니다. 새 사이트를 만들지 않습니다.
- CLI 게시: 환경 설정에 `NETLIFY_AUTH_TOKEN`을 안전하게 주입한 뒤 Netlify API로 접근 가능한 사이트 목록에서 `wavve-test.netlify.app`의 site ID를 확인하고, 기존 사이트 ID에 `netlify deploy --prod --dir=dist --site=<verified-site-id>`를 실행합니다. 토큰은 채팅이나 저장소에 기록하지 않습니다.
- `netlify.toml`은 빌드 명령/출력 폴더와 SPA 경로 처리를 설정합니다. ZIP 직접 업로드에도 적용되도록 빌드 결과에 `_redirects`가 포함됩니다.

## 배포 후 확인

`https://wavve-test.netlify.app/build-info.json`에서 `firebaseProjectId`가 `ott-test-1f684`, `firebaseAuthDomain`이 `ott-test-1f684.firebaseapp.com`인지 확인합니다. 이 파일은 API 키를 포함하지 않습니다. JSON 대신 HTML 또는 404가 나오면 이 변경이 포함된 빌드가 게시되지 않은 상태입니다. Netlify 환경변수는 **Builds** 범위와 **Production** 배포 컨텍스트에 적용되어야 합니다. ZIP을 업로드하는 수동 배포는 Netlify에서 다시 빌드하지 않으므로 ZIP에 이미 반영된 환경변수를 사용합니다.

`/sports`와 `/login`에 직접 접속하고 새로고침합니다. Google 로그인은 모의 응답이 아닌 실제 계정으로 완료해 `/choice-char` 이동을 확인합니다. 새 Firebase 프로젝트에는 기존 프로젝트의 계정·데이터·Firestore 규칙이 자동으로 이전되지 않습니다. 스포츠 채팅을 사용하려면 `sports-chat.rules`를 새 프로젝트의 기존 규칙에 병합하세요.

환경 설정 초안 저장·환경 게시와 Netlify 사이트 게시는 별개입니다. 이 작업에서는 배포 인증이 없어 Netlify 게시 및 Firebase 승인 도메인 등록을 실행하지 못했습니다.
