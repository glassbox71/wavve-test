# 스포츠

`/sports`는 공개 시청 페이지입니다. 헤더 및 모바일 전체 카테고리에서 이동합니다. 채팅은 기존 Firebase 로그인이 필요합니다. 기존 `.env`의 `VITE_YOUTUBE_API_KEY` 및 `VITE_FIREBASE_*`를 사용하며 키 값을 소스에 복사하지 않습니다. TMDB는 스포츠 중계를 제공하지 않으므로 이 기능에서 사용하지 않습니다.

YouTube Data API v3의 `search.list`로 라이브 야구 영상을 최대 25개 조회하고 `videos.list`로 실제 방송 시작·종료 및 외부 재생 허용 여부를 확인합니다. 조회된 방송을 동시 시청자 수 내림차순으로 정렬해 최대 5개를 표시합니다. 검색 결과에는 팬 해설 등도 포함될 수 있으며 공식 KBO 중계 제공을 보장하지 않습니다. 중계가 없으면 빈 상태를 표시하며 가짜 중계를 만들지 않습니다. 클릭하면 YouTube 임베드 플레이어와 경기별 채팅으로 전환합니다. 자동 재생은 브라우저 정책에 따라 재생 버튼 클릭이 필요할 수 있습니다. 방송 권한·지역 제한으로 재생되지 않는 경우 YouTube 링크로 확인할 수 있습니다.

조회는 탭 내 메모리에 5분간 캐시하고 페이지가 열려 있는 동안 5분 간격으로 갱신합니다. 새로고침도 캐시 유효 기간을 따릅니다. search.list는 요청당 100 quota units를 사용하므로 다수 사용자의 운영 서비스에는 서버 캐시/중계 목록 API가 권장됩니다. 브라우저용 API 키는 Google Cloud에서 HTTP referrer와 YouTube Data API v3 제한을 설정하세요. Firebase 웹 설정과 VITE 변수는 브라우저 번들에 포함됩니다.

## Firebase 채팅

Firestore 경로: `sportsRooms/{YouTube video ID}/messages/{auto ID}`. `onSnapshot`으로 최신 100개를 구독하고 경기 전환·페이지 이탈 시 구독을 해제합니다. 발신 UID는 로그인 UID, 이름은 기존 프로필 닉네임 또는 표시 이름, 시간은 서버 타임스탬프를 사용합니다. 메시지는 300자 제한이며 HTML로 렌더링하지 않습니다. 2초 전송 간격은 UI 편의 제한이며 보안상 스팸 방지 장치가 아닙니다.

Firebase Console의 기존 Firestore 보안 규칙 안에 `sports-chat.rules`의 match 블록을 병합해야 합니다. 기존의 넓은 허용 규칙과 겹치면 이 블록이 접근을 제한하지 못하므로 함께 검토하세요. 인증 사용자의 읽기와 본인 UID의 생성만 허용하며 수정/삭제는 허용하지 않습니다. 기존 데이터 규칙을 통째로 덮어쓰지 마세요. 운영 서비스에는 별도의 서버 측 전송 속도 제한·신고/관리자 삭제·보관 기간 정책이 필요합니다.

다른 두 로그인 계정으로 동일 중계를 열고 한쪽에서 보낸 메시지가 다른 창에 나타나는지 확인하세요. 서로 다른 중계를 선택했을 때 채팅이 섞이지 않는지도 확인하세요. 규칙 배포 및 실제 두 사용자 통신은 환경의 Firebase 접근 권한이 있어야 검증할 수 있습니다.

네트워크 제한 환경에서는 `www.googleapis.com`, `www.youtube.com`, `i.ytimg.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `firestore.googleapis.com` 및 Firebase 프로젝트의 인증 도메인 접근이 필요합니다. 동영상 재생 CDN은 브라우저 환경에서 추가 접근이 필요할 수 있습니다.
