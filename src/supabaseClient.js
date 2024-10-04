import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

const supabaseUrl = "https://rqwwkjokdwyydpgwjrds.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxd3dram9rZHd5eWRwZ3dqcmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwMDQzMjUsImV4cCI6MjA0MzU4MDMyNX0.dweQh0-qc-nxUaZNfuA11Z5Ek1JHA1_bzqU9w0E5tpo"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
