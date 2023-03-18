import { useState } from 'react'

import NumberOfQuestions from '@/components/NumberOfQuestions'
import SearchBox from '@/components/SearchBox';
import SearchResult from '@/components/SearchResult';


function Search({ session, numQuestionsAsked, maxNumQuestions, setNumQuestionsAsked}) {
  const [query, setQuery] = useState('')
  const [lastQuery, setLastQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')

  async function handleSearch() {

    if (session && numQuestionsAsked < maxNumQuestions) {
      if (!query) {
        alert('Please input a question')
        return
      }

      if (query === lastQuery) {
        return
      }

      setLastQuery(query)
      setAnswer('')
      setLoading(true)

      const question = query.trim()

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
          }),
        })

        if (!response.ok) {
          setLoading(false)
          throw new Error(response.statusText)
        }

        const res = await response.json()

        if (res.answer) {
          setAnswer(res.answer)
          setNumQuestionsAsked(res.user_n_questions_asked)
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log('error', error)
      }
    } else {
      setLastQuery(query)
      setAnswer('not an answer')
      return
    }
  }

  return (
    <>
      <NumberOfQuestions numQuestionsAsked={numQuestionsAsked} maxNumQuestions={maxNumQuestions}/>
      <SearchBox query={query} setQuery={setQuery} handleSearch={handleSearch}/>
      <SearchResult session={session} answer={answer} loading={loading}/>
    </>
  )
}

export default Search
