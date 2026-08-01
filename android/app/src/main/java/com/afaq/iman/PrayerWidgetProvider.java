package com.afaq.iman;

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

        int[] widgetIds = manager.getAppWidgetIds(
            new ComponentName(
                context,
                PrayerWidgetProvider.class
            )
        );

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

        String prayerName = preferences.getString(
            "prayer",
            "افتح التطبيق للتحديث"
        );

        String cityName = preferences.getString(
            "city",
            "آفاق الإيمان"
        );

        long targetTime = preferences.getLong(
            "target",
            System.currentTimeMillis()
        );

        long remainingMilliseconds = Math.max(
            0L,
            targetTime - System.currentTimeMillis()
        );

        long chronometerBase =
            SystemClock.elapsedRealtime()
                + remainingMilliseconds;

        String currentTime =
            DateFormat.getTimeFormat(context).format(
                new Date()
            );

        String prayerTime =
            DateFormat.getTimeFormat(context).format(
                new Date(targetTime)
            );

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(
                context.getPackageName(),
                R.layout.widget_prayer
            );

            views.setTextViewText(
                R.id.widget_city,
                cityName
            );

            views.setTextViewText(
                R.id.widget_current_time,
                currentTime
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

            Intent openApplication = new Intent(
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
                    widgetId,
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
