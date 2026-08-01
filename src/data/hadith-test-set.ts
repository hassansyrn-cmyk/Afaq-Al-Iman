import type { HadithRecord } from '../types';

/**
 * ⚠️ مجموعة اختبار للتطوير فقط — 15 حديثاً مختاراً.
 *
 * هذه ليست مكتبة الصحيحين الكاملة، ولا يجوز عرضها للمستخدم على أنها كذلك.
 * المصدر الفعلي الكامل (صحيح البخاري + صحيح مسلم) يتطلب اتصالاً بـ Sunnah.com API
 * (يحتاج مفتاحاً لا يمكن تضمينه داخل الـ APK) أو Offline Dump رسمي مرخّص —
 * راجع src/repositories/hadith/HadithProvider.ts لبنية التوسعة الجاهزة.
 *
 * الأرقام أدناه هي أرقام الأحاديث في المصدرين كما هي متداولة، وتحتاج مطابقة
 * مقابل نسخة Sunnah.com الرسمية قبل اعتمادها كمصدر نهائي.
 */
export const hadithTestSet: HadithRecord[] = [
  { id: 'test:1', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '1', textAr: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.', textEn: 'Actions are judged by intentions.', source: 'صحيح البخاري 1، صحيح مسلم 1907' },
  { id: 'test:2', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '2', textAr: 'المسلم من سلم المسلمون من لسانه ويده.', textEn: 'A Muslim is one from whose tongue and hand Muslims are safe.', source: 'صحيح البخاري 10، صحيح مسلم 40' },
  { id: 'test:3', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '3', textAr: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.', textEn: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'صحيح البخاري 13، صحيح مسلم 45' },
  { id: 'test:4', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '4', textAr: 'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت.', textEn: 'Whoever believes in Allah and the Last Day should speak good or remain silent.', source: 'صحيح البخاري 6018، صحيح مسلم 47' },
  { id: 'test:5', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '5', textAr: 'الكلمة الطيبة صدقة.', textEn: 'A good word is charity.', source: 'صحيح البخاري 2989، صحيح مسلم 1009' },
  { id: 'test:6', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '6', textAr: 'يسروا ولا تعسروا، وبشروا ولا تنفروا.', textEn: 'Make things easy and do not make them difficult.', source: 'صحيح البخاري 69، صحيح مسلم 1734' },
  { id: 'test:7', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '7', textAr: 'الدين النصيحة.', textEn: 'Religion is sincere counsel.', source: 'صحيح مسلم 55' },
  { id: 'test:8', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '8', textAr: 'الطهور شطر الإيمان.', textEn: 'Purification is half of faith.', source: 'صحيح مسلم 223' },
  { id: 'test:9', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '9', textAr: 'لا تغضب.', textEn: 'Do not become angry.', source: 'صحيح البخاري 6116' },
  { id: 'test:10', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '10', textAr: 'من لا يرحم لا يرحم.', textEn: 'Whoever does not show mercy will not be shown mercy.', source: 'صحيح البخاري 6013، صحيح مسلم 2319' },
  { id: 'test:11', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '11', textAr: 'خيركم من تعلم القرآن وعلمه.', textEn: 'The best of you are those who learn the Quran and teach it.', source: 'صحيح البخاري 5027' },
  { id: 'test:12', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '12', textAr: 'إن الله جميل يحب الجمال.', textEn: 'Allah is beautiful and loves beauty.', source: 'صحيح مسلم 91' },
  { id: 'test:13', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '13', textAr: 'البر حسن الخلق.', textEn: 'Righteousness is good character.', source: 'صحيح مسلم 2553' },
  { id: 'test:14', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '14', textAr: 'من غشنا فليس منا.', textEn: 'Whoever deceives us is not one of us.', source: 'صحيح مسلم 101' },
  { id: 'test:15', collection: 'test-set', collectionName: 'مجموعة اختبار', number: '15', textAr: 'الحياء من الإيمان.', textEn: 'Modesty is part of faith.', source: 'صحيح البخاري 24، صحيح مسلم 36' },
];
