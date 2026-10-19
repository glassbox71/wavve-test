export interface BaseballLive {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  viewers: number;
}

interface YouTubeVideo {
  id: string;
  snippet: { title: string; channelTitle: string; thumbnails?: { medium?: { url: string } } };
  status: { embeddable: boolean; privacyStatus: string };
  liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string; concurrentViewers?: string };
}

async function request<T>(resource: string, params: Record<string, string>, signal: AbortSignal): Promise<T> {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!key) throw new Error('YouTube API 키가 설정되지 않았습니다.');
  const response = await fetch(`https://www.googleapis.com/youtube/v3/${resource}?${new URLSearchParams({ ...params, key })}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const reason = body?.error?.errors?.[0]?.reason;
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      throw new Error('YouTube API의 일일 조회 한도를 초과했습니다. 잠시 후 다시 확인해 주세요.');
    }
    throw new Error('실시간 중계를 불러올 수 없습니다. API 키 권한과 네트워크 연결을 확인해 주세요.');
  }
  return response.json();
}

let cache: { time: number; items: BaseballLive[] } | undefined;

export async function getBaseballLives(signal: AbortSignal): Promise<BaseballLive[]> {
  if (cache && Date.now() - cache.time < 300_000) return cache.items;
  const search = await request<{ items: { id: { videoId?: string } }[] }>('search', {
    part: 'snippet', type: 'video', eventType: 'live', videoEmbeddable: 'true',
    q: '야구|baseball', maxResults: '25', order: 'viewCount', relevanceLanguage: 'ko',
  }, signal);
  const ids = search.items.map(item => item.id.videoId).filter(Boolean).join(',');
  if (!ids) {
    cache = { time: Date.now(), items: [] };
    return [];
  }
  const videos = await request<{ items: YouTubeVideo[] }>('videos', {
    part: 'snippet,status,liveStreamingDetails', id: ids,
  }, signal);
  const items = videos.items
    .filter(video => video.status.embeddable && video.status.privacyStatus === 'public'
      && video.liveStreamingDetails?.actualStartTime && !video.liveStreamingDetails.actualEndTime)
    .map(video => ({
      id: video.id, title: video.snippet.title, channel: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails?.medium?.url ?? '',
      viewers: Number(video.liveStreamingDetails?.concurrentViewers ?? 0),
    }))
    .sort((a, b) => b.viewers - a.viewers);
  cache = { time: Date.now(), items };
  return items;
}
