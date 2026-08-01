package com.afaq.iman;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.text.format.DateFormat;
import android.widget.RemoteViews;

import java.util.Date;

public class PrayerWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "afaq_widget";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        updateAll(context, ids);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(
                new android.content.ComponentName(context, PrayerWidgetProvider.class));
        updateAll(context, ids);
    }

    public static void updateAll(Context context, int[] ids) {
        SharedPreferences preferences = context.getSharedPreferences(
                PREFS_NAME, Context.MODE_PRIVATE);

        String prayer = preferences.getString(
                "prayer", "افتح التطبيق للتحديث");
        String city = preferences.getString(
                "city", "آفاق الإيمان");
        long target = preferences.getLong(
                "target", System.currentTimeMillis());
        long remaining = Math.max(
                0L, target - System.currentTimeMillis());
        long chronometerBase = SystemClock.elapsedRealtime() + remaining;
        String prayerTime = DateFormat.getTimeFormat(context)
                .format(new Date(target));

        for (int id : ids) {
            RemoteViews views = new RemoteViews(
                    context.getPackageName(), R.layout.widget_prayer);

            views.setTextViewText(R.id.widget_city, city);
            views.setTextViewText(R.id.widget_prayer, prayer);
            views.setTextViewText(R.id.widget_prayer_time, prayerTime);
            views.setChronometer(
                    R.id.widget_countdown,
                    chronometerBase,
                    null,
                    true);

            Intent open = new Intent(context, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            PendingIntent openIntent = PendingIntent.getActivity(
                    context,
                    id,
                    open,
                    PendingIntent.FLAG_UPDATE_CURRENT
                            | PendingIntent.FLAG_IMMUTABLE);

            views.setOnClickPendingIntent(R.id.widget_root, openIntent);
            AppWidgetManager.getInstance(context).updateAppWidget(id, views);
        }
    }
}
