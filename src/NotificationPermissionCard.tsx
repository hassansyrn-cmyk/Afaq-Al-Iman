import { Bell, BookOpen, ChevronLeft, Heart } from "lucide-react";

type Props = {
  onAllow: () => void | Promise<void>;
  onLater: () => void;
};

export default function NotificationPermissionCard({ onAllow, onLater }: Props) {
  return (
    <div className="notificationPermissionOverlay" role="dialog" aria-modal="true" aria-labelledby="notification-permission-title">
      <section className="notificationPermissionCard">
        <div className="notificationIconWrapper">
          <svg className="notificationCrescentIcon" viewBox="0 0 64 64" role="img" aria-label="هلال ذهبي">
            <defs>
              <linearGradient id="crescentGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF3B5" />
                <stop offset="45%" stopColor="#E5C566" />
                <stop offset="100%" stopColor="#A97E22" />
              </linearGradient>
            </defs>
            <path d="M43.8 9.8C32.5 11.9 24 21.8 24 33.7c0 10.7 6.9 19.9 16.5 23.1C27.8 60.2 14 50.6 14 35.5 14 21.2 26 9.6 40.6 9.6c1.1 0 2.2.1 3.2.2Z" fill="url(#crescentGold)" />
            <path d="M45.5 20.5l1.8 4.2 4.4.5-3.3 2.9 1 4.3-3.9-2.2-3.8 2.2 1-4.3-3.3-2.9 4.4-.5 1.7-4.2Z" fill="#F7D97C" />
          </svg>
          <span className="notificationPulse notificationPulseOne" />
          <span className="notificationPulse notificationPulseTwo" />
        </div>

        <div className="notificationPermissionContent">
          <span className="notificationPermissionBadge">تنبيهات مهمة</span>
          <h2 id="notification-permission-title">لا تفوّت وقت الصلاة</h2>
          <p className="notificationPermissionDescription">
            يحتاج تطبيق آفاق الإيمان إلى إذن الإشعارات حتى يذكّرك في الوقت المناسب، حتى عندما لا يكون التطبيق مفتوحًا.
          </p>

          <div className="notificationBenefits">
            <Benefit icon={<Bell />} title="تنبيهات مواقيت الصلاة" text="تذكير عند دخول وقت كل صلاة حسب مدينتك المختارة." />
            <Benefit icon={<Heart />} title="أذكار الصباح والمساء" text="تذكيرات يومية تساعدك على المحافظة على الأذكار." />
            <Benefit icon={<BookOpen />} title="الورد والختمة والحديث اليومي" text="متابعة ورد القرآن وخطة الختمة واستقبال حديث يومي." />
          </div>

          <p className="notificationPrivacyNote">يمكنك إيقاف أي نوع من التذكيرات لاحقًا من الإعدادات.</p>

          <button className="notificationAllowButton" onClick={onAllow}>
            <Bell />
            <span><b>السماح بالإشعارات</b><small>الانتقال إلى نافذة إذن Android</small></span>
            <ChevronLeft />
          </button>
          <button className="notificationLaterButton" onClick={onLater}>ربما لاحقًا</button>
        </div>
      </section>
    </div>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="notificationBenefitItem"><span className="notificationBenefitIcon">{icon}</span><div><b>{title}</b><small>{text}</small></div></div>;
}
