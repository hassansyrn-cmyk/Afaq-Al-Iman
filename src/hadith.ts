export type Hadith = {
  ar: string;
  en: string;
  source: string;
  narrator?: string;
};

export const hadiths: Hadith[] = [
  // ── الإيمان والأخلاق ──
  { ar: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.', en: 'Actions are judged by intentions, and each person will get what they intended.', source: 'صحيح البخاري 1، صحيح مسلم 1907', narrator: 'عمر بن الخطاب' },
  { ar: 'المسلم من سلم المسلمون من لسانه ويده.', en: 'A Muslim is one from whose tongue and hand other Muslims are safe.', source: 'صحيح البخاري 10، صحيح مسلم 40', narrator: 'عبد الله بن عمرو' },
  { ar: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.', en: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'صحيح البخاري 13، صحيح مسلم 45', narrator: 'أنس بن مالك' },
  { ar: 'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت.', en: 'Whoever believes in Allah and the Last Day should speak good or remain silent.', source: 'صحيح البخاري 6018، صحيح مسلم 47', narrator: 'أبو هريرة' },
  { ar: 'الكلمة الطيبة صدقة.', en: 'A good word is charity.', source: 'صحيح البخاري 2989، صحيح مسلم 1009', narrator: 'أبو هريرة' },
  { ar: 'يسروا ولا تعسروا، وبشروا ولا تنفروا.', en: 'Make things easy and do not make them difficult. Give good tidings and do not drive people away.', source: 'صحيح البخاري 69، صحيح مسلم 1734', narrator: 'أنس بن مالك' },
  { ar: 'الدين النصيحة.', en: 'Religion is sincere counsel.', source: 'صحيح مسلم 55', narrator: 'تميم الداري' },
  { ar: 'الطهور شطر الإيمان، والحمد لله تملأ الميزان، وسبحان الله والحمد لله تملآن ما بين السماوات والأرض.', en: 'Purification is half of faith. Alhamdulillah fills the scales, and SubhanAllah and Alhamdulillah fill what is between the heavens and the earth.', source: 'صحيح مسلم 223', narrator: 'أبو هريرة' },
  { ar: 'لا تغضب.', en: 'Do not become angry.', source: 'صحيح البخاري 6116', narrator: 'أبو هريرة' },
  { ar: 'من لا يرحم لا يُرحم.', en: 'Whoever does not show mercy will not be shown mercy.', source: 'صحيح البخاري 6013، صحيح مسلم 2319', narrator: 'جرير بن عبد الله' },
  { ar: 'خيركم من تعلم القرآن وعلمه.', en: 'The best of you are those who learn the Quran and teach it.', source: 'صحيح البخاري 5027', narrator: 'عثمان بن عفان' },
  { ar: 'إن الله جميل يحب الجمال.', en: 'Allah is beautiful and loves beauty.', source: 'صحيح مسلم 91', narrator: 'عبد الله بن مسعود' },
  { ar: 'البر حسن الخلق.', en: 'Righteousness is good character.', source: 'صحيح مسلم 2553', narrator: 'النواس بن سمعان' },
  { ar: 'من غشنا فليس منا.', en: 'Whoever deceives us is not one of us.', source: 'صحيح مسلم 101', narrator: 'أبو هريرة' },
  { ar: 'الحياء من الإيمان.', en: 'Modesty is part of faith.', source: 'صحيح البخاري 24، صحيح مسلم 36', narrator: 'أبو هريرة' },
  { ar: 'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف وفي كل خير.', en: 'The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.', source: 'صحيح مسلم 2664', narrator: 'أبو هريرة' },
  { ar: 'اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن.', en: 'Fear Allah wherever you are, follow a bad deed with a good one and it will wipe it out, and treat people with good character.', source: 'صحيح الترمذي 1987', narrator: 'أبو ذر الغفاري' },
  { ar: 'لا يُلدغ المؤمن من جحر مرتين.', en: 'A believer is not stung from the same hole twice.', source: 'صحيح البخاري 6133، صحيح مسلم 2999', narrator: 'أبو هريرة' },
  { ar: 'لا تحاسدوا ولا تناجشوا ولا تباغضوا ولا تدابروا، وكونوا عباد الله إخواناً.', en: 'Do not envy one another, do not hate one another, do not turn your backs on one another. Rather, be servants of Allah as brothers.', source: 'صحيح مسلم 2563', narrator: 'أبو هريرة' },
  { ar: 'من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة.', en: 'Whoever travels a path seeking knowledge, Allah will make easy for him a path to Paradise.', source: 'صحيح مسلم 2699', narrator: 'أبو هريرة' },

  // ── الصلاة والعبادات ──
  { ar: 'إن أول ما يحاسب به العبد يوم القيامة من عمله صلاته، فإن صلحت فقد أفلح وأنجح، وإن فسدت فقد خاب وخسر.', en: 'The first thing for which a person will be brought to account on the Day of Resurrection will be his prayer. If it is sound, he will be successful; if it is bad, he will be doomed.', source: 'صحيح النسائي 465، سنن الترمذي 413', narrator: 'تميم الداري' },
  { ar: 'بين الرجل وبين الكفر والشرك ترك الصلاة.', en: 'Between a man and polytheism and disbelief is the abandonment of prayer.', source: 'صحيح مسلم 82', narrator: 'جابر بن عبد الله' },
  { ar: 'صلِّ كما رأيتني أصلي.', en: 'Pray as you have seen me praying.', source: 'صحيح البخاري 631', narrator: 'مالك بن الحويرث' },
  { ar: 'جعلت لي الأرض مسجداً وطهوراً.', en: 'The earth has been made for me a place of prostration and a means of purification.', source: 'صحيح البخاري 335، صحيح مسلم 521', narrator: 'أبو هريرة' },
  { ar: 'أفضل الأعمال الصلاة على وقتها.', en: 'The best of deeds is prayer at its appointed time.', source: 'صحيح البخاري 527، صحيح مسلم 625', narrator: 'عبد الله بن مسعود' },
  { ar: 'من صلى العشاء في جماعة فكأنما قام نصف الليل، ومن صلى الصبح في جماعة فكأنما صلى الليل كله.', en: 'Whoever prays Isha in congregation is as if he stood in prayer for half the night. Whoever prays Fajr in congregation is as if he stood in prayer the whole night.', source: 'صحيح مسلم 656', narrator: 'عثمان بن عفان' },

  // ── القرآن ──
  { ar: 'اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه.', en: 'Read the Quran, for it will come on the Day of Resurrection as an intercessor for its companions.', source: 'صحيح مسلم 804', narrator: 'أبو أمامة الباهلي' },
  { ar: 'خيركم من تعلم القرآن وعلمه.', en: 'The best of you are those who learn the Quran and teach it.', source: 'صحيح البخاري 5027', narrator: 'عثمان بن عفان' },
  { ar: 'الماهر بالقرآن مع السفرة الكرام البررة، والذي يقرأ القرآن ويتتعتع فيه وهو عليه شاق له أجران.', en: 'The one who is proficient in the Quran will be with the honorable and obedient scribes. The one who reads it and struggles with it will have two rewards.', source: 'صحيح البخاري 4937، صحيح مسلم 798', narrator: 'عائشة بنت أبي بكر' },
  { ar: 'لا حسد إلا في اثنتين: رجل آتاه الله القرآن فهو يقوم به آناء الليل وآناء النهار، ورجل آتاه الله مالاً فهو ينفقه آناء الليل وآاء النهار.', en: 'There is no envy except in two cases: a man whom Allah has given the Quran and he recites it night and day, and a man whom Allah has given wealth and he spends it night and day.', source: 'صحيح البخاري 7527', narrator: 'عبد الله بن عمر' },

  // ── الدعاء والذكر ──
  { ar: 'الدعاء هو العبادة.', en: 'Supplication is the essence of worship.', source: 'صحيح الترمذي 3370', narrator: 'النعمان بن بشير' },
  { ar: 'ادعوا الله وأنتم موقنون بالإجابة، واعلموا أن الله لا يستجيب دعاءً من قلب غافل لاهٍ.', en: 'Call upon Allah while being certain of being answered. Know that Allah does not respond to a supplication from a heedless and distracted heart.', source: 'صحيح الترمذي 3479', narrator: 'أبو هريرة' },
  { ar: 'أقرب ما يكون العبد من ربه وهو ساجد فأكثروا الدعاء.', en: 'The closest a servant is to his Lord is when he is prostrating, so increase your supplications.', source: 'صحيح مسلم 482', narrator: 'أبو هريرة' },
  { ar: 'مَثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت.', en: 'The comparison of one who remembers Allah and one who does not, is like the comparison between the living and the dead.', source: 'صحيح البخاري 6407، صحيح مسلم 779', narrator: 'أبو موسى الأشعري' },
  { ar: 'أحب الأعمال إلى الله أدومها وإن قل.', en: 'The most beloved of deeds to Allah are those that are most consistent, even if they are small.', source: 'صحيح البخاري 6464، صحيح مسلم 782', narrator: 'عائشة بنت أبي بكر' },
  { ar: 'إن الله لا يمل حتى تملوا.', en: 'Allah does not get tired of giving rewards until you get tired of doing good deeds.', source: 'صحيح البخاري 7405، صحيح مسلم 2819', narrator: 'أبو هريرة' },
  { ar: 'من لزم الاستغفار جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً ورزقه من حيث لا يحتسب.', en: 'Whoever persists in seeking forgiveness, Allah will appoint for him a way out of every distress, and relief from every anxiety, and will provide for him from where he did not reckon.', source: 'سنن أبي داود 1518', narrator: 'عبد الله بن عباس' },

  // ── المعاملات والبيئة ──
  { ar: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.', en: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'صحيح البخاري 13، صحيح مسلم 45', narrator: 'أنس بن مالك' },
  { ar: 'لا ضرر ولا ضرار.', en: 'There should be neither harming nor reciprocating harm.', source: 'سنن ابن ماجه 2340', narrator: 'عبادة بن الصامت' },
  { ar: 'تَبَسُّمُكَ في وجه أخيك صدقة.', en: 'Your smiling in the face of your brother is charity.', source: 'صحيح الترمذي 1956', narrator: 'أبو ذر الغفاري' },
  { ar: 'لا تحقرن من المعروف شيئاً ولو أن تلقى أخاك بوجه طلق.', en: 'Do not belittle any good deed, even meeting your brother with a cheerful face.', source: 'صحيح مسلم 2626', narrator: 'أبو ذر الغفاري' },
  { ar: 'المسلم أخو المسلم لا يظلمه ولا يسلمه، من كان في حاجة أخيه كان الله في حاجته.', en: 'A Muslim is the brother of a Muslim: he does not oppress him, nor does he fail him. Whoever fulfills the needs of his brother, Allah will fulfill his needs.', source: 'صحيح مسلم 2580', narrator: 'أبو هريرة' },

  // ── الصبر والابتلاء ──
  { ar: 'عجباً لأمر المؤمن إن أمره كله خير، إن أصابته سراء شكر فكان خيراً له، وإن أصابته ضراء صبر فكان خيراً له.', en: 'How wonderful is the affair of the believer, for his affair is all good. If something good happens to him, he is grateful for it and that is good for him. If something bad happens to him, he bears it with patience and that is good for him.', source: 'صحيح مسلم 2999', narrator: 'صهيب بن سنان' },
  { ar: 'إنما يُوَفَّى الصابرون أجرهم بغير حساب.', en: 'Indeed, the patient will be given their reward without account.', source: 'صحيح البخاري 2400', narrator: 'أنس بن مالك' },
  { ar: 'ما يصيب المؤمن من نصب ولا وصب ولا هم ولا حزن حتى الهم يهمه إلا كفّر الله بها من خطاياه.', en: 'No fatigue, illness, anxiety, sorrow, harm, or distress afflicts a Muslim, even the prick of a thorn, but Allah expiates some of his sins thereby.', source: 'صحيح البخاري 5641، صحيح مسلم 2573', narrator: 'أبو سعيد الخدري وأبو هريرة' },
  { ar: 'ومن يتوكل على الله فهو حسبه.', en: 'And whoever relies upon Allah — then He is sufficient for him.', source: 'سنن الترمذي 2344', narrator: 'عمر بن الخطاب' },

  // ── العلم والتعلّم ──
  { ar: 'من يرد الله به خيراً يُفَقِّهه في الدين.', en: 'When Allah wishes good for someone, He grants him understanding of the religion.', source: 'صحيح البخاري 71، صحيح مسلم 1037', narrator: 'معاوية بن أبي سفيان' },
  { ar: 'طلب العلم فريضة على كل مسلم.', en: 'Seeking knowledge is an obligation upon every Muslim.', source: 'سنن ابن ماجه 224', narrator: 'أنس بن مالك' },
  { ar: 'من سلك طريقاً يلتمس فيه علماً سهل الله له طريقاً إلى الجنة.', en: 'Whoever travels a path seeking knowledge, Allah will make easy for him a path to Paradise.', source: 'صحيح مسلم 2699', narrator: 'أبو هريرة' },

  // ── الجنة والنار ──
  { ar: 'حُفَّت الجنة بالمكاره وحُفَّت النار بالشهوات.', en: 'Paradise is surrounded by hardships and the Hellfire is surrounded by desires.', source: 'صحيح مسلم 2822', narrator: 'أبو هريرة' },
  { ar: 'إن أهل الجنة ليتراءون أهل الغرف من فوقهم كما يتراءون الكوكب الدري الغابر في الأفق من المشرق أو المغرب لتفاضل ما بينهم.', en: 'The people of Paradise will look at the people of the upper chambers above them as one looks at a shining star in the sky.', source: 'صحيح البخاري 3250، صحيح مسلم 2831', narrator: 'أبو سعيد الخدري' },
  { ar: 'أكمل المؤمنين إيماناً أحسنهم خلقاً.', en: 'The most complete of the believers in faith is the one with the best character.', source: 'سنن أبي داود 4682', narrator: 'أبو هريرة' },
  { ar: 'من خاف أدلج، ومن أدلج بلغ المنزل، ألا إن سلعة الله غالية، ألا إن سلعة الله الجنة.', en: 'Whoever fears sets out at nightfall, and whoever sets out at nightfall reaches his destination. Indeed, the commodity of Allah is precious. Indeed, the commodity of Allah is Paradise.', source: 'صحيح الترمذي 2450', narrator: 'أبو هريرة' },

  // ── الأعمال والمعاملة ──
  { ar: 'إن الله كتب الإحسان على كل شيء.', en: 'Allah has prescribed proficiency in all things.', source: 'صحيح مسلم 1955', narrator: 'شَدَّاد بن أوس' },
  { ar: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.', en: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'صحيح البخاري 13', narrator: 'أنس بن مالك' },
  { ar: 'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف وفي كل خير.', en: 'The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.', source: 'صحيح مسلم 2664', narrator: 'أبو هريرة' },
  { ar: 'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت، ومن كان يؤمن بالله واليوم الآخر فليكرم جاره، ومن كان يؤمن بالله واليوم الآخر فليكرم ضيفه.', en: 'Whoever believes in Allah and the Last Day should speak good or remain silent, should honor his neighbor, and should honor his guest.', source: 'صحيح البخاري 6018، صحيح مسلم 47', narrator: 'أبو هريرة' },
  { ar: 'آية المنافق ثلاث: إذا حدث كذب، وإذا وعد أخلف، وإذا اؤتمن خان.', en: 'The signs of a hypocrite are three: when he speaks he lies, when he makes a promise he breaks it, and when he is entrusted he betrays.', source: 'صحيح البخاري 33، صحيح مسلم 59', narrator: 'أبو هريرة' },
  { ar: 'لا يؤمن أحدكم حتى يكون هواه تبعاً لما جئت به.', en: 'None of you truly believes until his desires are subservient to what I have brought.', source: 'مستدرك الحاكم 1/93', narrator: 'عبد الله بن عمرو' },
];
