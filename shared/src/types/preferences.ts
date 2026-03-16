export interface UserPreferences {
  id: string;
  userId: string;
  dailyReminderEnabled: boolean;
  reminderTime: string;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesRequest {
  dailyReminderEnabled?: boolean;
  reminderTime?: string;
  darkMode?: boolean;
}