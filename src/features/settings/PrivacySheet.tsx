import { X } from 'lucide-react';

export function PrivacySheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet privacy-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h3>سياسة الخصوصية / Privacy Policy</h3>
          <button className="round" onClick={onClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <div className="privacy-body" dir="rtl">
          <h4>العربية</h4>
          <ul>
            <li>الموقع الجغرافي: يُستخدم فقط لحساب مواقيت الصلاة واتجاه القبلة عند منح الإذن، ولا يُرسل إلى أي خادم خارجي من طرفنا.</li>
            <li>الإشعارات: تصل بعد إذن صريح من المستخدم، ويمكن تعطيلها من إعدادات الجهاز في أي وقت.</li>
            <li>التخزين المحلي: الختمة، العلامات المرجعية، مفضلة الأحاديث، وCache التفسير تُحفظ على جهازك فقط.</li>
            <li>لا نبيع بيانات المستخدم لأي طرف ثالث.</li>
            <li>Analytics: لا توجد أدوات تحليل مستخدم مفعّلة في هذه النسخة.</li>
            <li>الإعلانات: لا توجد إعلانات في هذه النسخة.</li>
            <li>حذف البيانات: يمكن حذف جميع البيانات المحلية بمسح بيانات التطبيق من إعدادات النظام.</li>
            <li>تعطيل الأذونات: يمكن تعطيل الموقع أو الإشعارات في أي وقت من إعدادات الجهاز دون تعطّل التطبيق.</li>
            <li>التواصل: [يُستكمل ببريد الدعم الرسمي قبل النشر العام]</li>
            <li>آخر تحديث: يُحدَّث تلقائياً مع كل إصدار من التطبيق يُغيّر هذه السياسة.</li>
          </ul>
        </div>

        <div className="privacy-body" dir="ltr">
          <h4>English</h4>
          <ul>
            <li>Location: used only to calculate prayer times and Qibla direction when permission is granted; never sent to any external server by us.</li>
            <li>Notifications: sent only after explicit user permission, and can be disabled anytime from device settings.</li>
            <li>Local storage: Khatma progress, bookmarks, favorite hadiths, and tafsir cache are stored on your device only.</li>
            <li>We do not sell user data to any third party.</li>
            <li>Analytics: no user analytics tools are enabled in this build.</li>
            <li>Ads: no ads in this build.</li>
            <li>Data deletion: clear app data from system settings to remove all local data.</li>
            <li>Permission opt-out: location or notifications can be disabled anytime without breaking the app.</li>
            <li>Contact: [official support email to be added before public release]</li>
            <li>Last updated: refreshed automatically with each release that changes this policy.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
