import { useState } from 'react';
import { Undo2, Plus, Clock } from 'lucide-react';
import { KhatmaRepository } from '../../repositories/khatma/KhatmaRepository';

const repo = new KhatmaRepository();

export function KhatmaPlanScreen({ onOpenQuranAtPage }: { onOpenQuranAtPage: (page: number) => void }) {
  const [plan, setPlan] = useState(repo.getPlan());
  const [confirmingUndo, setConfirmingUndo] = useState(false);
  const [confirmingNewPlan, setConfirmingNewPlan] = useState(false);
  const [newPlanDays, setNewPlanDays] = useState(30);

  if (!plan) {
    return (
      <div className="glass">
        <h2>خطة الختمة</h2>
        <p className="muted">لا توجد خطة حالياً. اختر عدد الأيام لإنشاء خطة جديدة.</p>
        <input
          type="number"
          min={1}
          max={604}
          value={newPlanDays}
          onChange={(e) => setNewPlanDays(Number(e.target.value))}
        />
        <button className="primary" onClick={() => setPlan(repo.createPlan(newPlanDays))}>
          إنشاء الخطة
        </button>
      </div>
    );
  }

  const progress = repo.getProgress(plan);

  function recordCompletion() {
    if (!plan) return;
    try {
      setPlan(repo.recordTodayCompletion(plan));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر التسجيل.');
    }
  }

  function undo() {
    if (!plan) return;
    setPlan(repo.undoLastCompletion(plan));
    setConfirmingUndo(false);
  }

  function startNewPlan() {
    setPlan(repo.replacePlan(newPlanDays));
    setConfirmingNewPlan(false);
  }

  return (
    <div className="glass khatma-card">
      <h2>خطة الختمة</h2>

      <div className="khatma-progress-bar">
        <div className="khatma-progress-fill" style={{ width: `${progress.percent}%` }} />
      </div>
      <p>
        <b>{progress.percent}%</b> — {progress.pagesRead} من 604 صفحة
      </p>

      <div className="khatma-stats">
        <span>أيام مكتملة: {progress.completedDays}</span>
        <span>أيام متبقية: {progress.remainingDays}</span>
        <span>صفحات متبقية: {progress.pagesRemaining}</span>
      </div>

      <p className="muted">
        الورد: {progress.todayStartPage} – {progress.todayEndPage} (البداية {plan.startDate}، الهدف {plan.endDateTarget})
      </p>

      <div className="khatma-actions">
        <button className="primary" onClick={() => onOpenQuranAtPage(progress.todayStartPage)}>
          قراءة ورد اليوم
        </button>

        {!progress.alreadyRecordedToday ? (
          <button onClick={recordCompletion}>تسجيل إنجاز اليوم</button>
        ) : (
          <span className="muted">تم تسجيل إنجاز اليوم ✓</span>
        )}

        <button onClick={() => repo.postponeToday(plan)}>
          <Clock size={16} /> تأجيل ورد اليوم
        </button>

        {plan.history.length > 0 && !confirmingUndo && (
          <button className="link" onClick={() => setConfirmingUndo(true)}>
            <Undo2 size={16} /> تراجع عن آخر إنجاز
          </button>
        )}
        {confirmingUndo && (
          <div className="confirm-box">
            <p>سيؤدي هذا لحذف آخر سجل إنجاز وإعادة توزيع الصفحات. هل تريد المتابعة؟</p>
            <button onClick={undo}>نعم، تراجع</button>
            <button onClick={() => setConfirmingUndo(false)}>إلغاء</button>
          </div>
        )}

        {!confirmingNewPlan && (
          <button className="link" onClick={() => setConfirmingNewPlan(true)}>
            <Plus size={16} /> خطة جديدة
          </button>
        )}
        {confirmingNewPlan && (
          <div className="confirm-box">
            <p>ستُستبدل الخطة الحالية بالكامل. عدد الأيام:</p>
            <input type="number" min={1} max={604} value={newPlanDays} onChange={(e) => setNewPlanDays(Number(e.target.value))} />
            <button onClick={startNewPlan}>تأكيد الاستبدال</button>
            <button onClick={() => setConfirmingNewPlan(false)}>إلغاء</button>
          </div>
        )}
      </div>
    </div>
  );
}
