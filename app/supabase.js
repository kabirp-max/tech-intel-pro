// app/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pocvrxpmbzopbdvwuvxl.supabase.co'; // Replace with your Supabase project URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvY3ZyeHBtYnpvcGJkdnd1dnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MDIwNjUsImV4cCI6MjA1MTQ3ODA2NX0.So3VS83y_hCjaXdD2wJ4eAN1u9SXOC3yrwiPrfzbrak'; // Replace with your Supabase API key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
