from pathlib import Path
import re, urllib.request
root=Path.cwd()
app=root/'src/App.tsx'; quran=root/'src/QuranExperience.tsx'; surahs=root/'src/surahs.ts'; css=root/'src/quran-font.css'
for p in (app,quran,surahs):
    if not p.exists(): raise SystemExit(f'File not found: {p}. Run from repository root.')
# QPC font, matched to Uthmani Hafs text.
font=root/'public/fonts/uthmanic_hafs_v22.ttf'; font.parent.mkdir(parents=True,exist_ok=True)
if not font.exists():
    url='https://raw.githubusercontent.com/nuqayah/qpc-fonts/master/text-mushafs/UthmanicHafs_V22/uthmanic_hafs_v22.ttf'
    print('Downloading QPC Hafs V22...')
    urllib.request.urlretrieve(url,font)
css.write_text('''@font-face{font-family:"Uthmanic Hafs V22";src:url("/fonts/uthmanic_hafs_v22.ttf") format("truetype");font-weight:400;font-style:normal;font-display:block}.mushafPage,.mushafPage .verse{font-family:"Uthmanic Hafs V22",serif;direction:rtl;unicode-bidi:isolate;font-feature-settings:"liga" 1,"rlig" 1,"calt" 1,"mark" 1,"mkmk" 1;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}\n''',encoding='utf8')
# Ensure no previous normalization remains.
qs=quran.read_text(encoding='utf8')
qs=re.sub(r'/\*\*[\s\S]*?U\+065E[\s\S]*?function normalizeQuranDisplay\([\s\S]*?\n}\n','',qs,count=1)
qs=qs.replace('{normalizeQuranDisplay(verse.text)}','{verse.text}')
# Add English name and revelation metadata rendering.
qs=qs.replace('<strong>{en ? "Surah" : "سورة"} {s.name}</strong><small>{s.verses} {en ? "verses" : "آية"}</small>', '<strong>{en ? s.englishName : `سورة ${s.name}`}</strong><em>{s.transliteration} — {s.englishMeaning}</em><small>{s.verses} {en ? "verses" : "آية"} · {en ? (s.revelation === "makkah" ? "Meccan" : "Medinan") : (s.revelation === "makkah" ? "مكية" : "مدنية")}</small>')
quran.write_text(qs,encoding='utf8')
# Hijri date in main UI.
asrc=app.read_text(encoding='utf8')
if 'const hijriDate =' not in asrc:
    marker='  const fmt = (d: Date) =>'
    insert='''  const hijriDate = useMemo(() => new Intl.DateTimeFormat(en ? "en-SA-u-ca-islamic-umalqura" : "ar-SA-u-ca-islamic-umalqura", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(clock)), [clock, en]);\n'''
    asrc=asrc.replace(marker,insert+marker)
if 'className="hijriDateCard"' not in asrc:
    anchor='{tab === "home" && (\n          <>\n'
    card='''{tab === "home" && (\n          <>\n            <section className="hijriDateCard"><CalendarDays /><div><small>{tr("التاريخ الهجري", "Hijri date")}</small><b>{hijriDate}</b></div></section>\n'''
    asrc=asrc.replace(anchor,card)
app.write_text(asrc,encoding='utf8')
# Expand surah metadata in surahs.ts.
sp=surahs.read_text(encoding='utf8')
if 'englishName:' not in sp:
    names=['Al-Fatihah','Al-Baqarah','Ali Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha','Al-Anbiya','Al-Hajj','Al-Muminun','An-Nur','Al-Furqan','Ash-Shuara','An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqiah','Al-Hadid','Al-Mujadilah','Al-Hashr','Al-Mumtahanah','As-Saff','Al-Jumuah','Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Maarij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat','Al-Qariah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Maun','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas']
    meanings=['The Opening','The Cow','Family of Imran','The Women','The Table Spread','The Cattle','The Heights','The Spoils of War','The Repentance','Jonah','Hud','Joseph','The Thunder','Abraham','The Rocky Tract','The Bee','The Night Journey','The Cave','Mary','Ta-Ha','The Prophets','The Pilgrimage','The Believers','The Light','The Criterion','The Poets','The Ant','The Stories','The Spider','The Romans','Luqman','The Prostration','The Confederates','Sheba','The Originator','Ya-Sin','Those Ranged in Rows','Sad','The Groups','The Forgiver','Explained in Detail','The Consultation','The Gold','The Smoke','The Crouching','The Sandhills','Muhammad','The Victory','The Rooms','Qaf','The Scatterers','The Mount','The Star','The Moon','The Most Merciful','The Inevitable','The Iron','The Pleading Woman','The Exile','The Examined One','The Ranks','Friday','The Hypocrites','Mutual Loss','Divorce','The Prohibition','The Sovereignty','The Pen','The Reality','The Ascending Stairways','Noah','The Jinn','The Enshrouded One','The Cloaked One','The Resurrection','Man','Those Sent Forth','The Tidings','Those Who Pull Out','He Frowned','The Overthrowing','The Cleaving','The Defrauding','The Splitting Open','The Constellations','The Morning Star','The Most High','The Overwhelming','The Dawn','The City','The Sun','The Night','The Morning Brightness','The Relief','The Fig','The Clot','The Power','The Clear Proof','The Earthquake','The Racers','The Striking Calamity','Competition','Time','The Slanderer','The Elephant','Quraysh','Small Kindnesses','Abundance','The Disbelievers','Divine Support','The Palm Fiber','Sincerity','Daybreak','Mankind']
    medina={2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110}
    meta='\nexport const surahMetadata = '+repr([{'id':i+1,'englishName':names[i],'transliteration':names[i],'englishMeaning':meanings[i],'revelation':'madinah' if i+1 in medina else 'makkah'} for i in range(114)]).replace("'",'"')+' as const;\n'
    sp=sp.replace('export type SurahInfo = { id: number; name: string; verses: number };','export type SurahInfo = { id: number; name: string; verses: number; englishName: string; transliteration: string; englishMeaning: string; revelation: "makkah" | "madinah" };')
    sp=sp.replace('].map(([id,name,verses])=>({id:id as number,name:name as string,verses:verses as number}));','].map(([id,name,verses], index)=>({id:id as number,name:name as string,verses:verses as number,...surahMetadata[index]}));')
    sp=meta+sp
surahs.write_text(sp,encoding='utf8')
# CSS
styles=root/'src/styles.css'; st=styles.read_text(encoding='utf8')
if 'hijriDateCard' not in st:
    st+='''\n.hijriDateCard{display:flex;align-items:center;gap:11px;margin-bottom:14px;padding:13px 16px;border:1px solid color-mix(in srgb,var(--gold) 50%,var(--line));border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--green) 10%,var(--card)),var(--card))}.hijriDateCard svg{color:var(--gold)}.hijriDateCard div{display:flex;flex-direction:column}.hijriDateCard small{color:var(--muted)}.hijriDateCard b{margin-top:3px}.suras button em{color:var(--muted);font-size:11px;font-style:normal}.suras button small{color:var(--green)!important;font-weight:700}\n'''
styles.write_text(st,encoding='utf8')
# Widget Hijri field and Java value.
layout=root/'android/app/src/main/res/layout/widget_prayer.xml'
if layout.exists():
    ls=layout.read_text(encoding='utf8')
    if 'widget_hijri' not in ls:
        city='''<TextView\n                android:id="@+id/widget_city"'''
        idx=ls.find(city)
        if idx>=0:
            end=ls.find('/>',idx)+2
            hijri='''\n\n            <TextView android:id="@+id/widget_hijri" android:layout_width="wrap_content" android:layout_height="wrap_content" android:layout_marginTop="2dp" android:text="التاريخ الهجري" android:textColor="#DDF2EDE8" android:textSize="10sp" />'''
            ls=ls[:end]+hijri+ls[end:]
            layout.write_text(ls,encoding='utf8')
provider=root/'android/app/src/main/java/com/afaq/iman/PrayerWidgetProvider.java'
if provider.exists():
    ps=provider.read_text(encoding='utf8')
    if 'widget_hijri' not in ps:
        ps=ps.replace('import java.util.Date;','import java.util.Date;\nimport java.util.Locale;\nimport android.icu.util.IslamicCalendar;')
        anchor='String prayerTime = DateFormat.getTimeFormat(context).format(new Date(target));'
        calc=anchor+'\n        IslamicCalendar hc = new IslamicCalendar(new Date());\n        String hijri = String.format(new Locale("ar"), "%d %s %d هـ", hc.get(IslamicCalendar.DAY_OF_MONTH), new String[]{"محرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"}[hc.get(IslamicCalendar.MONTH)], hc.get(IslamicCalendar.YEAR));'
        ps=ps.replace(anchor,calc)
        ps=ps.replace('views.setTextViewText(R.id.widget_prayer, prayer);','views.setTextViewText(R.id.widget_prayer, prayer);\n            views.setTextViewText(R.id.widget_hijri, hijri);')
        provider.write_text(ps,encoding='utf8')
print('Update applied successfully.')
