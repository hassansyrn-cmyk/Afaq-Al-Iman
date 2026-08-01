package com.afaq.iman;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.text.format.DateFormat;
import android.widget.RemoteViews;

import java.util.Date;
import java.util.Locale;

public class PrayerWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "afaq_widget";
    private static final String ACTION_TICK = "com.afaq.iman.PRAYER_WIDGET_TICK";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        updateAll(context, ids);
        startMinuteUpdates(context);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        startMinuteUpdates(context);
        updateExisting(context);
    }

    @Override
    public void onDisabled(Context context) {
        cancelMinuteUpdates(context);
        super.onDisabled(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_TICK.equals(intent.getAction())) {
            updateExisting(context);
        }
    }

    private static void updateExisting(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(
            new ComponentName(context, PrayerWidgetProvider.class)
        );
        updateAll(context, ids);
    }

    public static void updateAll(Context context, int[] ids) {
        SharedPreferences preferences = context.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        );

        String prayer = preferences.getString("prayer", "افتح التطبيق للتحديث");
        String city = preferences.getString("city", "آفاق الإيمان");
        long target = preferences.getLong("target", System.currentTimeMillis());
        long remaining = Math.max(0L, target - System.currentTimeMillis());

        String currentTime = DateFormat.getTimeFormat(context).format(new Date());
        String prayerTime = DateFormat.getTimeFormat(context).format(new Date(target));
        String countdown = formatRemaining(remaining);

        AppWidgetManager manager = AppWidgetManager.getInstance(context);

        for (int id : ids) {
            RemoteViews views = new RemoteViews(
                context.getPackageName(),
                R.layout.widget_prayer
            );

            views.setTextViewText(R.id.widget_city, city);
            views.setTextViewText(R.id.widget_current_time, currentTime);
            views.setTextViewText(R.id.widget_prayer, prayer);
            views.setTextViewText(R.id.widget_prayer_time, prayerTime);
            views.setTextViewText(R.id.widget_countdown, countdown);

            Intent open = new Intent(context, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            PendingIntent openIntent = PendingIntent.getActivity(
                context,
                id,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            views.setOnClickPendingIntent(R.id.widget_root, openIntent);
            manager.updateAppWidget(id, views);
        }
    }

    private static String formatRemaining(long milliseconds) {
        long totalMinutes = Math.max(0L, milliseconds / 60000L);
        long hours = totalMinutes / 60L;
        long minutes = totalMinutes % 60L;
        return String.format(Locale.US, "%02d:%02d", hours, minutes);
    }

    private static PendingIntent tickIntent(Context context) {
        Intent intent = new Intent(context, PrayerWidgetProvider.class);
        intent.setAction(ACTION_TICK);
        return PendingIntent.getBroadcast(
            context,
            9201,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static void startMinuteUpdates(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm == null) return;

        long first = SystemClock.elapsedRealtime() + 60000L;
        alarm.setInexactRepeating(
            AlarmManager.ELAPSED_REALTIME,
            first,
            60000L,
            tickIntent(context)
        );
    }

    private static void cancelMinuteUpdates(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm != null) alarm.cancel(tickIntent(context));
    }
}
