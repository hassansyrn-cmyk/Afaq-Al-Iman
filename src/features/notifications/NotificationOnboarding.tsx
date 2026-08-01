import { useEffect, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { load, save } from '../../services/storage';

const SHOWN_KEY = 'notifications:onboarding-shown';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

export function useNotificationPermissionState() {
  const [state, setState] = useState<PermissionState>('unknown');

  useEffect(() => {
    LocalNotifications.checkPermissions()
      .then((r) => setState(r.display as PermissionState))
      .catch(() => setState('unknown'));
  }, []);

  return state;
}

export function shouldShowNotificationOnboarding(): boolean {
  return !load<boolean>(SHOWN_KEY, false);
}

export function NotificationOnboarding({ onDone }: { onDone: () => void }) {
  const [requesting, setRequesting] = useState(false);

  async function handleAllow() {
    setRequesting(true);
    try {
      await LocalNotifications.requestPermissions();
    } catch {
      /* المستخدم رفض أو المنصة لا تدعم الطلب — لا ننهار */
    } finally {
      save(SHOWN_KEY, true);
      setRequesting(false);
      onDone();
    }
  }

  function handleSkip() {
    save(SHOWN_KEY, true);
    onDone();
  }

  return (
    <div className="sheet-backdrop">
      <div className="sheet notification-onboarding">
        <h3>الإشعارات</h3>
        <p>نستخدم الإشعارات لمواقيت الصلاة والأذكار والورد والحديث اليومي.</p>
        <div className="onboarding-actions">
          <button className="primary" onClick={handleAllow} disabled={requesting}>
            متابعة
          </button>
          <button className="link" onClick={handleSkip}>
            ليس الآن
          </button>
        </div>
      </div>
    </div>
  );
}

export async function sendTestNotification(): Promise<void> {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 999999,
        title: 'آفاق الإيمان',
        body: 'هذا إشعار اختباري.',
        schedule: { at: new Date(Date.now() + 2000) },
        channelId: 'quran-reminders',
      },
    ],
  });
}
