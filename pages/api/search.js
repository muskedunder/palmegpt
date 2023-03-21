import { Configuration, OpenAIApi } from 'openai'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'


const getUserData = async (supabase, user) => {
  let { data, error, status } = await supabase
    .from('profiles')
    .select(`id, n_questions_asked, max_questions`)
    .eq('id', user.id)
    .single()
    return data
}


const incrementNumberOfQuestionsAsked = async (supabase, user, prevNumQuestionsAsked) => {
  let { error } = await supabase
    .from('profiles')
    .update({ n_questions_asked: prevNumQuestionsAsked + 1 })
    .eq('id', user.id)
}


const getDaVinciAnswer = async (openai, question, context) => {
  console.log("using davinci")

  let completion = null

  const prompt = `Besvara frågan baserat på kontexten. Beskriv hur du kommer fram till svaret.
  Kontext: ${context}
  
  Fråga: ${question}
  
  Svar:
  `

  try {
    completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }

  return completion.data.choices[0].text

}


const getPrompt = () => {
  let prompt = null
  if (process.env.MODEL == "chatgpt") {
    prompt = `Information: [context]

    Fråga: [question]

    Svar:
    `
  } else if (process.env.MODEL == "davinci") {
    prompt = `Besvara frågan baserat på kontexten. Beskriv hur du kommer fram till svaret.
    Kontext: ${context}
  
    Fråga: ${question}
  
    Svar:
    `
  }
  return prompt
}


const getChatGPTAnswer = async (openai, question, context) => {
  console.log("using chatgpt")
  let completion = null
  const prompt = `Information: ${context}

  Fråga: ${question}

  Svar:
  `

  try {
    completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "Besvara frågorna så gott du kan. Var så hjälpsam som du kan och resonera dig fram till svaret på frågan."},
        // {role: "system", content: `Utredningsmaterial att ta hänsyn till: ${context}`},
        {role: "user", content: prompt},
      ],
      temperature: 0.5
    })
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }

  return completion.data.choices[0].message.content

}


const getAnswerFromContext = async (openai, question, context) => {

  if (process.env.MODEL === "chatgpt") {
    return await getChatGPTAnswer(openai, question, context)
  } else if (process.env.MODEL == "davinci") {
    return await getDaVinciAnswer(openai, question, context)
  } else {
    return res.status(500).json({ error: 'internal error' })
  }
}


const getAnswerFromEmbedding = async (openai, supabase, question, embedding) => {
  const {context, contextIds} = await getContext(supabase, embedding)
  const answer = await getAnswerFromContext(openai, question, context)
  return { answer, contextIds }
}


const insertQuestion = async (supabase, question, embedding, userId) => {
    const { data, error } = await supabase
      .from('question2')
      .upsert({ content: question, embedding: embedding, user_id: userId, model_provider: "openai", model_id: "text-embedding-ada-002"})
      .select()

    if (error !== null) {
      console.log(`failed to insert question into table, error : ${error}`)
    }

    return data[0].id
}


const insertAnswer = async (supabase, answer, prompt, questionId, contextIds) => {
  const { data, error } = await supabase
    .from('answer2')
    .insert({ answer: answer, question_id: questionId, prompt: prompt, context_ids: contextIds, dataset_version: process.env.DATASET_VERSION, model_provider: "openai", model_id: process.env.MODEL})

  if (error !== null) {
    console.log(`failed to insert answer into table, error : ${error}`)
  }

}


const getExistingQuestion = async (supabase, question) => {
  const { data, error } = await supabase
    .from('question2')
    .select(`id, embedding`)
    .eq('content', question)
    .maybeSingle()

  if (error !== null) {
    console.log(`failed to query existing question, error : ${JSON.stringify(error)}`)
    return null
  }

  return data
}


const getExistingAnswer = async (supabase, questionId) => {
  const { data, error } = await supabase
    .from('answer2')
    .select(`answer`)
    .eq('question_id', questionId)
    .maybeSingle()

  if (error !== null) {
    console.log(`failed to query existing answer, error : ${JSON.stringify(error)}`)
    return null
  }

  return data
}


const getContext = async (supabase, embedding) => {

  const { data, error } = await supabase
    .rpc('match_documents', {
      match_count: 10, 
      query_embedding: embedding, 
      similarity_threshold: 0.0
  })

  if (error !== null) {
    console.log(`failed to match documents, error : ${JSON.stringify(error)}`)
    return null
  }

  let selectedParagraphs = []
  let selectedParagraphIds = []
  let currentContextLength = 0

  const maxContextLength = 2500

  for (let doc of data) {
    currentContextLength = currentContextLength + doc.n_tokens
    if (currentContextLength > maxContextLength) {
      break
    }
    selectedParagraphs.push(doc.content)
    selectedParagraphIds.push(doc.id)
  }

  return { context: selectedParagraphs.join("\n\n###\n\n"), contextIds: selectedParagraphIds }
}


const getEmbedding = async (openai, question) => {
  let embeddingResponse = null
  try {
    embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: question,
    })
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }

  const [{ embedding }] = embeddingResponse.data.data

  return embedding
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

    const userData = await getUserData(supabase, session.user)

    if (userData.n_questions_asked >= userData.max_questions)
      return res.status(401).json({
      error: 'question_limit',
      description: 'The user have asked the allowed number of questions',
    })

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });

    const openai = new OpenAIApi(configuration);

    let answerToReturn = null

    const normalizedQuestion = question.replace(/\n/g, ' ').normalize().toLowerCase()

    const existingQuestion = await getExistingQuestion(supabase, normalizedQuestion)
    if (existingQuestion !== null) {
      // console.log("found question already in db")
      const existingAnswer = await getExistingAnswer(supabase, existingQuestion.id)
      if (existingAnswer !== null) {
        // console.log("found answer already in db")
        answerToReturn = existingAnswer.answer
      } else {
        // console.log("did not found answer in db")
        const { answer, contextIds } = await getAnswerFromEmbedding(openai, supabase, normalizedQuestion, existingQuestion.embedding)
        await insertAnswer(supabase, answer, getPrompt(), existingQuestion.id, contextIds)
        answerToReturn = answer
      }
    } else {
      // console.log("did not find question in db")
      const embedding = await getEmbedding(openai, normalizedQuestion)
      const questionId = await insertQuestion(supabase, normalizedQuestion, embedding, userData.id)
      const { answer, contextIds } = await getAnswerFromEmbedding(openai, supabase, normalizedQuestion, embedding)
      await insertAnswer(supabase, answer, getPrompt(), questionId, contextIds)
      answerToReturn = answer
    }

    if (answerToReturn !== null) {
      incrementNumberOfQuestionsAsked(supabase, session.user, userData.n_questions_asked)
      res.status(200).json({ answer: answerToReturn, user_n_questions_asked: userData.n_questions_asked + 1})
    } else {
      res.status(500).json({ error: 'internal server error' })
    }

  }
  
  export default searchHandler