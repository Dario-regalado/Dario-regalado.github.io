import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pxcuxdmbnezltcdytyeb.supabase.co'
const supabaseKey = 'sb_publishable_Tf2T75Lg3eGDrI0g5Y_1vw_Va2WRDfn'

const supabaseClient = createClient(supabaseUrl, supabaseKey)

export { supabaseClient }
