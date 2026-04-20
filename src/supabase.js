import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

export const DEFAULT_ROOM_ID = '00000000-0000-0000-0000-000000000001';
