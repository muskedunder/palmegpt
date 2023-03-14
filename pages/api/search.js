import { Configuration, OpenAIApi } from 'openai'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

const MAX_QUESTIONS_PER_USER = 10


const getNumberOfQuestionsAsked = async (supabase, user) => {
  let { data, error, status } = await supabase
    .from('profiles')
    .select(`id, n_questions_asked, max_questions`)
    .eq('id', user.id)
    .single()
    return data.n_questions_asked
}

const incrementNumberOfQuestionsAsked = async (supabase, user, prevNumQuestionsAsked) => {
  let { error } = await supabase
    .from('profiles')
    .update({ n_questions_asked: prevNumQuestionsAsked + 1 })
    .eq('id', user.id)
}


const searchHandler = async (req, res) => {

    const { question } = req.body;

    const supabase = createServerSupabaseClient({ req, res })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session)
        return res.status(401).json({
        error: 'not_authenticated',
        description: 'The user does not have an active session or is not authenticated',
    })

    let { data: { user } } = await supabase.auth.getUser()

    const n_questions_asked = await getNumberOfQuestionsAsked(supabase, user)

    console.log(`## n questions asked = ${n_questions_asked}`)

    if (n_questions_asked >= MAX_QUESTIONS_PER_USER)
      return res.status(401).json({
      error: 'question_limit',
      description: 'The user have asked the allowed number of questions',
    })

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });

    const openai = new OpenAIApi(configuration);

   // TODO: Add validation of input
    const embeddingResponse = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: question.replace(/\n/g, ' '),
    })
    
    const [{ embedding }] = embeddingResponse.data.data

    let { data, error } = await supabase
      .rpc('match_documents', {
        match_count: 10, 
        query_embedding: embedding, 
        similarity_threshold: 0.0
    })

    let selectedParagraphs = []
    let currentContextLength = 0

    const maxContextLength = 2500


    for (let doc of data) {
      currentContextLength = currentContextLength + doc.n_tokens
      if (currentContextLength > maxContextLength) {
        break
      }
      selectedParagraphs.push(doc.content)
    }

    const context = selectedParagraphs.join("\n\n###\n\n")

    const prompt = `
    Information: ${context}
    
    Fråga: ${question}
    
    Svar:
    `

    // const completion = await openai.createCompletion({
    //   model: "text-davinci-003",
    //   prompt: prompt,
    //   max_tokens: 500,
    //   temperature: 0.7,
    //   frequency_penalty: 0,
    //   presence_penalty: 0,
    // });


    let completion = "hello"


    try {
        completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: "Besvara frågorna utifrån informationen som du får. Var så hjälpsam som du kan och resonera dig fram till svaret på frågan."},
          // {role: "system", content: `Utredningsmaterial att ta hänsyn till: ${context}`},
          {role: "user", content: prompt},
        ],
        temperature: 0.2
      });
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }    



    // let { data, error, status } = await supabase
    //     .from('profiles')
    //     .select(`id, n_questions_asked, max_questions`)
    //     .eq('id', user.id)
    //     .single()


    // res.status(200).json({ user_id: data.id, n_questions_asked: data.n_questions_asked, max_questions: data.max_questions, search_query: query.query_string})
    // res.status(200).json({ answer: completion.data.choices[0].text })

    incrementNumberOfQuestionsAsked(supabase, user, n_questions_asked)

    res.status(200).json({ answer: completion.data.choices[0].message.content })

    // const supabase = createServerSupabaseClient({ req, res })

    // const {
    //     data: { session },
    //   } = await supabase.auth.getSession()

    // if (!session)
    //     return res.status(401).json({
    //     error: 'not_authenticated',
    //     description: 'The user does not have an active session or is not authenticated',
    // })

    // const {
    //     data: { user },
    // } = await supabase.auth.getUser()

    // let { data, error, status } = await supabase
    //     .from('profiles')
    //     .select(`id, n_questions_asked, max_questions`)
    //     .eq('id', user.id)
    //     .single()


    // res.status(200).json({ user_id: data.id, n_questions_asked: data.n_questions_asked, max_questions: data.max_questions, search_query: query.query_string})
    // res.status(200).json({ text: "this is just a dummy answer"})
  }
  
  export default searchHandler