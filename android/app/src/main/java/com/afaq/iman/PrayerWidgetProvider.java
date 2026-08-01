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
    public void onUpdate(
        Context context,
        AppWidgetManager appWidgetManager,
        int[] appWidgetIds
    ) {
        updateAll(context, appWidgetIds);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);

        AppWidgetManager manager =
            AppWidgetManager.getInstance(context);

        android.content.ComponentName componentName =
            new android.content.ComponentName(
                context,
                PrayerWidgetProvider.class
            );

        int[] widgetIds =
            manager.getAppWidgetIds(componentName);

        updateAll(context, widgetIds);
    }

    public static void updateAll(
        Context context,
        int[] appWidgetIds
    ) {
        SharedPreferences preferences =
            context.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            );

        String prayerName =
            preferences.getString(
                "prayer",
                "افتح التطبيق للتحديث"
            );

        String cityName =
            preferences.getString(
                "city",
                "آفاق الإيمان"
            );

        long targetTime =
            preferences.getLong(
                "target",
                System.currentTimeMillis()
            );

        String prayerTime =
            DateFormat.getTimeFormat(context)
                .format(new Date(targetTime));

        long remainingMilliseconds =
            Math.max(
                0L,
                targetTime - System.currentTimeMillis()
            );

        long chronometerBase =
            SystemClock.elapsedRealtime()
                + remainingMilliseconds;

        for (int widgetId : appWidgetIds) {
            RemoteViews views =
                new RemoteViews(
                    context.getPackageName(),
                    R.layout.widget_prayer
                );

            views.setTextViewText(
                R.id.widget_city,
                cityName
            );

            views.setTextViewText(
                R.id.widget_prayer,
                prayerName
            );

            views.setTextViewText(
                R.id.widget_prayer_time,
                prayerTime
            );

            views.setChronometer(
                R.id.widget_countdown,
                chronometerBase,
                null,
                true
            );

            Intent openApplication =
                new Intent(
                    context,
                    MainActivity.class
                );

            openApplication.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_CLEAR_TOP
            );

            PendingIntent pendingIntent =
                PendingIntent.getActivity(
                    context,
                    100,
                    openApplication,
                    PendingIntent.FLAG_UPDATE_CURRENT
                        | PendingIntent.FLAG_IMMUTABLE
                );

            views.setOnClickPendingIntent(
                R.id.widget_root,
                pendingIntent
            );

            AppWidgetManager.getInstance(context)
                .updateAppWidget(
                    widgetId,
                    views
                );
        }
    }
}
