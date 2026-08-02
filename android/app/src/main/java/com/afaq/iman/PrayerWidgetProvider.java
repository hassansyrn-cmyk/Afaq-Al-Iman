package com.afaq.iman;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.SystemClock;
import android.text.format.DateFormat;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Date;

public class PrayerWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "afaq_widget";
    private static final String ACTION_REFRESH = "com.afaq.iman.WIDGET_NEXT_PRAYER";

    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { updateAll(c, ids); }
    @Override public void onEnabled(Context c) { super.onEnabled(c); updateExisting(c); }
    @Override public void onReceive(Context c, Intent i) {
        super.onReceive(c, i);
        if (ACTION_REFRESH.equals(i.getAction()) || Intent.ACTION_TIME_CHANGED.equals(i.getAction()) || Intent.ACTION_TIMEZONE_CHANGED.equals(i.getAction())) updateExisting(c);
    }

    private static void updateExisting(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        updateAll(c, m.getAppWidgetIds(new ComponentName(c, PrayerWidgetProvider.class)));
    }

    public static void updateAll(Context context, int[] ids) {
        SharedPreferences p = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String prayer = p.getString("prayer", "افتح التطبيق للتحديث");
        long target = p.getLong("target", System.currentTimeMillis());
        String raw = p.getString("schedule", "[]");
        long now = System.currentTimeMillis();
        try {
            JSONArray items = new JSONArray(raw);
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                long candidate = item.getLong("target");
                if (candidate > now) { prayer = item.getString("prayer"); target = candidate; break; }
            }
        } catch (Exception ignored) {}
        p.edit().putString("prayer", prayer).putLong("target", target).apply();
        long remaining = Math.max(0L, target - now);
        long base = SystemClock.elapsedRealtime() + remaining;
        String city = p.getString("city", "آفاق الإيمان");
        String hijri = p.getString("hijri", null);
        String prayerTime = DateFormat.getTimeFormat(context).format(new Date(target));
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_prayer);
            views.setTextViewText(R.id.widget_city, city);
            views.setTextViewText(R.id.widget_hijri, hijri != null ? hijri : "");
            views.setTextViewText(R.id.widget_prayer, prayer);
            views.setTextViewText(R.id.widget_prayer_time, prayerTime);
            views.setChronometer(R.id.widget_countdown, base, null, true);
            Intent open = new Intent(context, MainActivity.class);
            PendingIntent click = PendingIntent.getActivity(context, id, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, click);
            AppWidgetManager.getInstance(context).updateAppWidget(id, views);
        }
        scheduleRefresh(context, target + 1500L);
    }

    private static PendingIntent refreshIntent(Context c) {
        Intent i = new Intent(c, PrayerWidgetProvider.class).setAction(ACTION_REFRESH);
        return PendingIntent.getBroadcast(c, 7301, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    private static void scheduleRefresh(Context c, long at) {
        AlarmManager alarm = (AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        if (alarm == null) return;
        PendingIntent pi = refreshIntent(c);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarm.canScheduleExactAlarms()) alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        } else alarm.setExact(AlarmManager.RTC_WAKEUP, at, pi);
    }
}
