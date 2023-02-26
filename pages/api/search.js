
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'


const searchHandler = async (req, res) => {

    const { query, method } = req

    const supabase = createServerSupabaseClient({ req, res })

    const {
        data: { session },
      } = await supabase.auth.getSession()

    if (!session)
        return res.status(401).json({
        error: 'not_authenticated',
        description: 'The user does not have an active session or is not authenticated',
    })

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let { data, error, status } = await supabase
        .from('profiles')
        .select(`id, n_questions_asked, max_questions`)
        .eq('id', user.id)
        .single()


    res.status(200).json({ user_id: data.id, n_questions_asked: data.n_questions_asked, max_questions: data.max_questions, search_query: query.query_string})

  }
  
  export default searchHandler