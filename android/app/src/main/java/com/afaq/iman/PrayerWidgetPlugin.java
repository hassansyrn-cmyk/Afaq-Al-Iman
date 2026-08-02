package com.afaq.iman;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PrayerWidget")
public class PrayerWidgetPlugin extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("afaq_widget", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit()
            .putString("prayer", call.getString("prayer", "الصلاة القادمة"))
            .putString("city", call.getString("city", ""))
            .putLong("target", call.getLong("target", System.currentTimeMillis()));
        JSArray schedule = call.getArray("schedule");
        if (schedule != null) editor.putString("schedule", schedule.toString());
        String hijri = call.getString("hijri", null);
        if (hijri != null) editor.putString("hijri", hijri);
        editor.apply();
        int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, PrayerWidgetProvider.class));
        PrayerWidgetProvider.updateAll(context, ids);
        call.resolve(new JSObject());
    }
}
