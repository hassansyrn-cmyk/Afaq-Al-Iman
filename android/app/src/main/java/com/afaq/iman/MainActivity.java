package com.afaq.iman;

import android.os.Build;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // إصلاح الهيدر خلف شريط الحالة (الساعة/البطارية/الشبكة/النوتش):
        // نطلب من النظام عدم فرض تخطيط Edge-to-Edge تلقائياً على الـ WebView،
        // لأن @capacitor/status-bar مع overlaysWebView=false (في capacitor.config.ts)
        // هو من يتحكم بمساحة شريط الحالة. الجمع بين الاثنين مطلوب لأن بعض
        // إصدارات أندرويد (خصوصاً 15/16 Edge-to-Edge الإجباري) تتجاوز إعداد
        // Capacitor وحده إن لم نضبط decorFitsSystemWindows صراحة هنا.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
