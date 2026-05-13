export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  reportEmailTo: process.env.REPORT_EMAIL_TO || '',
  googleSheetsWebhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || '',
  iotDeviceSecret: process.env.IOT_DEVICE_SECRET || '',
  publicAppUrl: process.env.NEXT_PUBLIC_APP_URL || '',
};

export function hasSupabaseBrowserEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasSupabaseServerEnv() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}
