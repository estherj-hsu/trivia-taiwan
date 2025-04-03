import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rfqgxrwervshiyzrsfcb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWd4cndlcnZzaGl5enJzZmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDc0NzMsImV4cCI6MjA1OTIyMzQ3M30.Uu5SdSQy91leGLW8PURxNLzTu69JmhIKRXmCOZ51Iyg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)