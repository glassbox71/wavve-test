import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, limitToLast, onSnapshot, orderBy, query, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuthStore } from '../stores/useAuthStore';

interface Message {
  id: string;
  uid: string;
  name: string;
  text: string;
  createdAt: Timestamp | null;
}

export default function SportsChat({ videoId }: { videoId: string }) {
  const { user, selectedCharNickname } = useAuthStore();
  const uid = user?.uid;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const lastSent = useRef(0);

  useEffect(() => {
    if (!uid) return;
    const room = query(collection(db, 'sportsRooms', videoId, 'messages'), orderBy('createdAt'), limitToLast(100));
    return onSnapshot(room, { includeMetadataChanges: true }, snapshot => {
      setMessages(snapshot.docs.map(document => ({ id: document.id, ...document.data() }) as Message));
      setConnected(!snapshot.metadata.fromCache);
      setError('');
    }, () => {
      setConnected(false);
      setError('채팅에 연결할 수 없습니다. 연결 상태 또는 Firebase 채팅 접근 권한을 확인해 주세요.');
    });
  }, [videoId, uid]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = text.trim();
    if (!user || !connected || sending || !content || content.length > 300) return;
    if (Date.now() - lastSent.current < 2000) {
      setError('메시지는 2초 간격으로 보낼 수 있습니다.');
      return;
    }
    setSending(true);
    setError('');
    lastSent.current = Date.now();
    try {
      await addDoc(collection(db, 'sportsRooms', videoId, 'messages'), {
        uid: user.uid,
        name: (selectedCharNickname || user.displayName || '야구 팬').slice(0, 30),
        text: content,
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch {
      setError('메시지를 보내지 못했습니다. 연결과 채팅 접근 권한을 확인해 주세요.');
    } finally {
      setSending(false);
    }
  }

  return <aside className="sports-chat" aria-label="경기 실시간 채팅">
    <div className="sports-chat-heading"><h2>함께 응원해요</h2><span>{connected ? '실시간 연결됨' : '연결 대기'}</span></div>
    <p className="sports-muted">이 중계를 보는 사용자와 함께하는 경기별 채팅입니다.</p>
    {!user ? <div className="sports-chat-login"><p>로그인하고 함께 응원해 보세요.</p><Link to="/login">로그인하기 →</Link></div> : <>
      <div className="sports-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="채팅 메시지">
        {!messages.length && <p className="sports-muted">첫 응원 메시지를 남겨 주세요!</p>}
        {messages.map(message => <div key={message.id} className={`sports-message ${message.uid === user.uid ? 'mine' : ''}`}>
          <div><strong>{message.name}</strong><time>{message.createdAt?.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) ?? '전송 중'}</time></div>
          <p>{message.text}</p>
        </div>)}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="sports-chat-form">
        <label htmlFor="sports-message">응원 메시지</label>
        <textarea id="sports-message" maxLength={300} value={text} onChange={event => setText(event.target.value)} placeholder="서로 존중하며 응원해 주세요" disabled={sending} />
        <div><span>{text.length}/300</span><button disabled={!connected || sending || !text.trim()}>{sending ? '전송 중…' : '보내기'}</button></div>
      </form>
    </>}
    {error && <p className="sports-error" role="alert">{error}</p>}
  </aside>;
}
