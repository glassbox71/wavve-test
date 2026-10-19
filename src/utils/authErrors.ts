export function googleLoginErrorMessage(error: unknown, hostname: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
  switch (code) {
    case 'auth/unauthorized-domain':
      return `현재 사이트(${hostname})가 Google 로그인에 승인되지 않았습니다. 사이트 관리자에게 문의해 주세요.`;
    case 'auth/popup-blocked':
      return '브라우저에서 로그인 팝업이 차단되었습니다. 팝업을 허용한 뒤 다시 시도해 주세요.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google 로그인이 취소되었습니다. 다시 시도해 주세요.';
    case 'auth/operation-not-allowed':
      return 'Google 로그인이 아직 활성화되지 않았습니다. 사이트 관리자에게 문의해 주세요.';
    case 'auth/network-request-failed':
      return '로그인 서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.';
    default:
      return 'Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
}
