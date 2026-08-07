import { registerPlugin } from "@capacitor/core";
export type WidgetPrayerItem = { prayer: string; target: number };
export interface PrayerWidgetPlugin {
  update(options: {
    prayer: string;
    city: string;
    target: number;
    schedule?: WidgetPrayerItem[];
    hijri?: string;
  }): Promise<void>;
}
export const PrayerWidget = registerPlugin<PrayerWidgetPlugin>("PrayerWidget");
export interface SystemSettingsPlugin {
  openAppDetails(): Promise<void>;
}
export const SystemSettings =
  registerPlugin<SystemSettingsPlugin>("SystemSettings");
export interface TasbeehWidgetPlugin {
  update(options: {
    count: number;
    goal: number;
    phrase: string;
    date: string;
    rtl: boolean;
  }): Promise<void>;
  getState(): Promise<{ count: number; date: string }>;
}
export const TasbeehWidget =
  registerPlugin<TasbeehWidgetPlugin>("TasbeehWidget");
