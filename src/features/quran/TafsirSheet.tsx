import { useEffect, useState } from 'react';
import { X, RefreshCw, WifiOff } from 'lucide-react';
import { TafsirRepository, getAsbabAlNuzul } from '../../repositories/tafsir/TafsirRepository';

const tafsirRepo = new TafsirRepository();

interface Props {
  sura: number;
  ayah: number;
  suraName: string;
  ayahText: string;
  onClose: () => void;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ok'; text: string; sourceName: string; offline: boolean }
  | { kind: 'error'; message: string };

export function TafsirSheet({ sura, ayah, suraName, ayahText, onClose }: Props) {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  async function load(forceRefresh = false) {
    setState({ kind: 'loading' });
    const result = await tafsirRepo.fetchTafseer(sura, ayah, { forceRefresh });
    if (result.status === 'ok') {
      setState({ kind: 'ok', text: result.record.text, sourceName: result.record.sourceName, offline: false });
    } else if (result.status === 'offline-cached') {
      setState({ kind: 'ok', text: result.record.text, sourceName: result.record.sourceName, offline: true });
    } else {
      setState({ kind: 'error', message: result.message });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sura, ayah]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet tafsir-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h3>
            تفسير — سورة {suraName} : {ayah}
          </h3>
          <button className="round" onClick={onClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <blockquote className="tafsir-ayah-text">{ayahText}</blockquote>

        {state.kind === 'loading' && <p className="muted">جارٍ تحميل التفسير…</p>}

        {state.kind === 'error' && (
          <div className="tafsir-error">
            <WifiOff size={20} />
            <p>{state.message}</p>
            <button className="link" onClick={() => load(true)}>
              <RefreshCw size={16} /> إعادة المحاولة
            </button>
          </div>
        )}

        {state.kind === 'ok' && (
          <>
            {state.offline && <p className="offline-banner">عرض نسخة محفوظة محلياً — لا يوجد اتصال بالإنترنت حالياً.</p>}
            <p className="tafsir-text">{state.text}</p>
            <p className="muted tafsir-source">المصدر: {state.sourceName}</p>
            <button className="link" onClick={() => load(true)}>
              <RefreshCw size={16} /> تحديث التفسير
            </button>

            <hr className="sheet-divider" />
            <h4>سبب النزول</h4>
            <p className="muted">{getAsbabAlNuzul(sura, ayah)}</p>
          </>
        )}
      </div>
    </div>
  );
}
