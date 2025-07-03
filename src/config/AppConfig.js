export class AppConfig {
  static validate() {
    const required = {
      VITE_SUPABASE_URL: 'Supabase URL is required',
      VITE_SUPABASE_ANON_KEY: 'Supabase anonymous key is required'
    };

    const missing = [];
    for (const [key, message] of Object.entries(required)) {
      if (!process.env[key]) {
        missing.push(message);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Configuration errors:\n${missing.join('\n')}`);
    }
  }

  static get() {
    return {
      supabase: {
        url: process.env.VITE_SUPABASE_URL,
        anonKey: process.env.VITE_SUPABASE_ANON_KEY
      },
      app: {
        environment: process.env.NODE_ENV || 'development',
        debug: process.env.NODE_ENV === 'development'
      }
    };
  }
}