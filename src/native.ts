import { registerPlugin } from "@capacitor/core";
export type WidgetPrayerItem = { prayer: string; target: number };
export interface PrayerWidgetPlugin {
  update(options: {
    prayer: string;
    city: string;
    target: number;
    schedule?: WidgetPrayerItem[];
  }): Promise<void>;
}
export const PrayerWidget = registerPlugin<PrayerWidgetPlugin>("PrayerWidget");
