import { Configuration, OpenAIApi } from 'openai'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'


const searchHandler = async (req, res) => {

    const { query, method } = req

    const supabase = createServerSupabaseClient({ req, res })

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

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });

    const openai = new OpenAIApi(configuration);

    // TODO: Add validation of question
    const question = query.query_string.replace(/\n/g, ' ')

    // const questionEmbeddingResponse = await openai.createEmbedding({
    //     model: "text-embedding-ada-002",
    //     input: question,
    //   });


    // const [{ questionEmbedding }] = questionEmbeddingResponse.data.data

    const embeddingResponse = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: question,
    })
    
    const [{ embedding }] = embeddingResponse.data.data



    let { data, error } = await supabase
      .rpc('match_documents', {
        match_count: 10, 
        query_embedding: embedding, 
        similarity_threshold: 0.0
    })

    // console.log(data)

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

    const prompt = `Besvara frågan baserat på kontexten. Beskriv hur du kommer fram till svaret.

    Kontext: ${context}
    
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
          {role: "system", content: "Du är en hjälpsam polisassistent som hjälper till att lösa Palmemordet baserat på utredningsmaterial."},
          // {role: "system", content: `Utredningsmaterial att ta hänsyn till: ${context}`},
          {role: "user", content: prompt},
        ],
      });
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }


    console.log(completion.data.choices[0].message.content)



    // const answer = response.choices[0].text
    

    // if (error) console.error(error)
    // else console.log(data)

        
    // const { data, error } = await supabase.rpc('match_documents', {
    //     query_embedding: embedding,
    //     match_threshold: 0.0, // Choose an appropriate threshold for your data
    //     match_count: 3, // Choose the number of matches
    // })


    // console.log(`### data = ${data}`)
    // console.log(`### error = ${error}`)




    // let { data, error, status } = await supabase
    //     .from('profiles')
    //     .select(`id, n_questions_asked, max_questions`)
    //     .eq('id', user.id)
    //     .single()


    // res.status(200).json({ user_id: data.id, n_questions_asked: data.n_questions_asked, max_questions: data.max_questions, search_query: query.query_string})
    // res.status(200).json({ answer: completion.data.choices[0].text })
    res.status(200).json({ answer: completion.data.choices[0].message.content })
  }
  
  export default searchHandler