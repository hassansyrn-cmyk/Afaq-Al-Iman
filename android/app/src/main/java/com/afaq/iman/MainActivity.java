package com.afaq.iman;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity { protected void onCreate(Bundle b){ super.onCreate(b); WindowCompat.setDecorFitsSystemWindows(getWindow(), true); } }
