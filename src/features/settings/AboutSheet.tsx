import { X } from 'lucide-react';

export function AboutSheet({ onClose, onOpenPrivacy }: { onClose: () => void; onOpenPrivacy: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet about-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h3>حول البرنامج</h3>
          <button className="round" onClick={onClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <p>
          <b>آفاق الإيمان</b> — تطبيق إسلامي يجمع مواقيت الصلاة، القرآن الكريم، الأذكار، الختمة،
          الأحاديث النبوية، والقبلة.
        </p>
        <p className="muted">الإصدار: 1.4.0</p>

        <h4>المصادر</h4>
        <ul>
          <li>نص القرآن: مشروع Tanzil (عبر حزمة quran-json)، بدون تعديل على النص.</li>
          <li>خط عرض النص القرآني: خط النظام الافتراضي حالياً (لم يُضمَّن خط قرآني مخصص بعد).</li>
          <li>التفسير: Quran Tafseer API — التفسير الميسر.</li>
          <li>الأحاديث: صحيح البخاري وصحيح مسلم كاملين عبر مشروع fawazahmed0/hadith-api المجاني (بلا مفتاح API)؛ يتحوّل تلقائياً إلى مجموعة اختبار محلية صغيرة عند انعدام الإنترنت. مصدر النص العربي الدقيق لهذا المشروع غير موثّق أكاديمياً بشكل رسمي من صاحبه.</li>
          <li>حساب مواقيت الصلاة: مكتبة adhan.</li>
        </ul>

        <p className="muted">
          قد تختلف مواقيت الصلاة المحسوبة بضع دقائق عن الجهات الرسمية المحلية. اتجاه القبلة يعتمد على
          دقة مستشعر البوصلة في جهازك ويتطلب معايرة دورية.
        </p>

        <button className="link" onClick={onOpenPrivacy}>
          سياسة الخصوصية
        </button>
      </div>
    </div>
  );
}
