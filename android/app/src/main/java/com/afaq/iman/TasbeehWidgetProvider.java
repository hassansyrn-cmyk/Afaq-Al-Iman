package com.afaq.iman;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class TasbeehWidgetProvider extends AppWidgetProvider {
    static final String PREFS_NAME = "afaq_tasbeeh_widget";
    private static final String ACTION_INCREMENT = "com.afaq.iman.TASBEEH_WIDGET_INCREMENT";

    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { updateAll(c, ids); }
    @Override public void onEnabled(Context c) { super.onEnabled(c); updateExisting(c); }
    @Override public void onReceive(Context c, Intent i) {
        super.onReceive(c, i);
        if (ACTION_INCREMENT.equals(i.getAction())) incrementAndUpdate(c);
    }

    private static void updateExisting(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        updateAll(c, m.getAppWidgetIds(new ComponentName(c, TasbeehWidgetProvider.class)));
    }

    private static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private static void incrementAndUpdate(Context c) {
        SharedPreferences p = c.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String date = p.getString("date", "");
        int count = p.getInt("count", 0);
        String t = today();
        if (!t.equals(date)) count = 0;
        count += 1;
        p.edit().putString("date", t).putInt("count", count).apply();
        updateExisting(c);
    }

    public static void updateAll(Context context, int[] ids) {
        if (ids == null || ids.length == 0) return;
        SharedPreferences p = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String date = p.getString("date", "");
        int count = p.getInt("count", 0);
        if (!today().equals(date)) {
            count = 0;
            p.edit().putString("date", today()).putInt("count", 0).apply();
        }
        int goal = p.getInt("goal", 100);
        String phrase = p.getString("phrase", "");
        boolean rtl = p.getBoolean("rtl", true);

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tasbeeh);
        views.setTextViewText(R.id.tasbeeh_count, String.valueOf(count));
        views.setTextViewText(R.id.tasbeeh_goal, (rtl ? "الهدف " : "Goal ") + goal);
        views.setTextViewText(
            R.id.tasbeeh_phrase,
            phrase == null || phrase.isEmpty() ? (rtl ? "اضغط للتسبيح" : "Tap to count") : phrase
        );

        Intent tapIntent = new Intent(context, TasbeehWidgetProvider.class).setAction(ACTION_INCREMENT);
        PendingIntent tapPending = PendingIntent.getBroadcast(
            context, 7401, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, tapPending);

        for (int id : ids) manager.updateAppWidget(id, views);
    }
}
