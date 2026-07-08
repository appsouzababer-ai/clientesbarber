import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xtmbsjsvlsiqbhgtvwwi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bWJzanN2bHNpcWJoZ3R2d3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzg0ODQsImV4cCI6MjA5ODY1NDQ4NH0.hHIS33Hdd-ZjI3co3Hsg-Ou_cFYlAtFR3ome1EablTQ";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);