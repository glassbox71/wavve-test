import { useEffect, useState } from 'react';
import { getBaseballLives, type BaseballLive } from '../api/sports';
import SportsChat from '../components/SportsChat';
import './scss/Sports.scss';

export default function Sports() {
  const [lives, setLives] = useState<BaseballLive[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [updated, setUpdated] = useState<Date>();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const items = await getBaseballLives(controller.signal);
        if (!active) return;
        setLives(items);
        setSelectedId(id => items.some(item => item.id === id) ? id : (items[0]?.id ?? ''));
        setUpdated(new Date());
        setError('');
      } catch (failure) {
        if (active) setError(failure instanceof Error ? failure.message : '중계를 불러오지 못했습니다.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(() => { void load(); }, 300_000);
    return () => { active = false; controller.abort(); window.clearInterval(timer); };
  }, [revision]);

  const selected = lives.find(item => item.id === selectedId);
  const topFive = lives.slice(0, 5);
  return <main className="sports-page">
    <section className="sports-intro">
      <span className="sports-eyebrow">WAVVE SPORTS · BASEBALL</span>
      <h1>야구의 순간을, 함께.</h1>
      <p>지금 진행 중인 YouTube 공개 야구 중계를 보고 함께 응원하세요.</p>
      <div className="sports-refresh"><span>{updated ? `${updated.toLocaleTimeString('ko-KR')} 확인 · 5분마다 갱신` : '실시간 중계 확인 중'}</span><button disabled={loading} onClick={() => setRevision(value => value + 1)}>{loading ? '확인 중…' : '새로고침'}</button></div>
    </section>

    {error && <div role="alert" className="sports-error">{error} {lives.length > 0 && '이전 조회 결과를 표시하고 있습니다.'}</div>}
    {loading && !lives.length && <p role="status" className="sports-empty">실시간 야구 중계를 찾고 있습니다…</p>}
    {!loading && !error && !lives.length && <div className="sports-empty"><h2>지금은 공개 중계가 없습니다</h2><p>임베드 재생이 가능한 실시간 방송이 시작되면 여기에 표시됩니다.</p></div>}

    {selected && <section className="sports-watch" aria-label="중계 시청">
      <div className="sports-player">
        <div className="sports-video"><iframe key={selected.id} title={selected.title} src={`https://www.youtube.com/embed/${encodeURIComponent(selected.id)}?autoplay=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
        <div className="sports-now"><span className="sports-live">LIVE</span><span>{selected.channel}</span></div>
        <h2>{selected.title}</h2>
        <p className="sports-muted">재생이 제한되거나 방송이 종료된 경우 <a href={`https://www.youtube.com/watch?v=${encodeURIComponent(selected.id)}`} target="_blank" rel="noopener noreferrer">YouTube에서 확인 ↗</a></p>
      </div>
      <SportsChat key={selected.id} videoId={selected.id} />
    </section>}

    <section className="sports-ranking" aria-labelledby="sports-ranking-title">
      <div className="sports-section-heading"><h2 id="sports-ranking-title">실시간 인기 TOP 5</h2><span>조회된 중계의 동시 시청자 수 기준</span></div>
      <div className="sports-rank-grid">{topFive.map((live, index) => <button key={live.id} className={`sports-card ${live.id === selectedId ? 'selected' : ''}`} aria-pressed={live.id === selectedId} onClick={() => setSelectedId(live.id)}>
        <div className="sports-thumbnail">{live.thumbnail && <img src={live.thumbnail} alt="" />}<span className="sports-rank-number">{index + 1}</span><span className="sports-live">LIVE</span></div>
        <strong>{live.title}</strong><span>{live.channel}</span><small>{live.viewers ? `${live.viewers.toLocaleString('ko-KR')}명 시청 중` : '시청자 수 비공개'}</small>
      </button>)}</div>
      {!loading && topFive.length < 5 && topFive.length > 0 && <p className="sports-muted">현재 재생 가능한 중계는 {topFive.length}개입니다.</p>}
    </section>
    {lives.length > 5 && <section className="sports-all"><h2>전체 실시간 중계</h2><div className="sports-all-grid">{lives.slice(5).map(live => <button key={live.id} onClick={() => setSelectedId(live.id)} aria-pressed={live.id === selectedId}><span className="sports-live">LIVE</span> {live.title}<small>{live.channel}</small></button>)}</div></section>}
    <p className="sports-footnote">YouTube 검색 결과 중 현재 방송 중이며 외부 재생이 허용된 공개 영상만 표시합니다. 공식 경기 중계 제공 여부와 지역별 시청 권한은 방송 채널에 따라 다릅니다.</p>
  </main>;
}
