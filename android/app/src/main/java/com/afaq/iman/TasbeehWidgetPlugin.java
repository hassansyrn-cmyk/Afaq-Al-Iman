package com.afaq.iman;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TasbeehWidget")
public class TasbeehWidgetPlugin extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        Context context = getContext();
        SharedPreferences.Editor e = context
            .getSharedPreferences(TasbeehWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
            .edit();
        e.putInt("count", call.getInt("count", 0));
        e.putInt("goal", call.getInt("goal", 100));
        e.putString("phrase", call.getString("phrase", ""));
        e.putString("date", call.getString("date", ""));
        e.putBoolean("rtl", Boolean.TRUE.equals(call.getBoolean("rtl", true)));
        e.apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, TasbeehWidgetProvider.class));
        TasbeehWidgetProvider.updateAll(context, ids);
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void getState(PluginCall call) {
        SharedPreferences p = getContext()
            .getSharedPreferences(TasbeehWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        JSObject result = new JSObject();
        result.put("count", p.getInt("count", 0));
        result.put("date", p.getString("date", ""));
        call.resolve(result);
    }
}
