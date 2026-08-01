# QPC Hafs + Hijri + Surah metadata
Run from the repository root in Termux:

python ~/storage/downloads/afaq-quran-hijri-metadata/apply-update.py
npm run build
npx cap sync android

The script downloads the official QPC Hafs V22 font into public/fonts, removes the previous tanween normalization, adds Hijri date to home and widget, and adds English name/meaning plus Meccan/Medinan classification to all 114 surahs.
