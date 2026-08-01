import type{CapacitorConfig}from'@capacitor/cli';
const config:CapacitorConfig={appId:'com.afaq.iman',appName:'آفاق الإيمان',webDir:'dist',plugins:{StatusBar:{overlaysWebView:false,backgroundColor:'#F5F8F6',style:'LIGHT'},LocalNotifications:{smallIcon:'ic_stat_notify',iconColor:'#0B5D4D'}}};
export default config;
