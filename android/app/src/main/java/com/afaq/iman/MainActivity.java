package com.afaq.iman;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
  @Override protected void onCreate(Bundle savedInstanceState){
    super.onCreate(savedInstanceState);
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    getWindow().setStatusBarColor(android.graphics.Color.rgb(245,248,246));
    getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
}
