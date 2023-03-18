import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import Layout from '@/components/Layout'
import Search from '@/components/Search';


export default function Home() {
  const [numQuestionsAsked, setNumQuestionsAsked] = useState(null)
  const [maxNumQuestions, setMaxNumQuestions] = useState(null)

  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {

    if (session) {
      try {
        let { data, error, status } = await supabase
          .from('profiles')
          .select(`id, n_questions_asked, max_questions`)
          .eq('id', session.user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setNumQuestionsAsked(data.n_questions_asked)
          setMaxNumQuestions(data.max_questions)
        }
      } catch (error) {
        alert('Error loading user data!')
        console.log(error)
      }
    }
  }

  return (
    <>
      <Layout>
        <section className="container max-w-xl mx-auto pt-4 pb-6 md:pt-8 md:pb-10 lg:pt-10 lg:pb-16">
          <div className="mx-auto flex flex-col gap-4">
            <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center mb-3">
              Ställ frågor om Palmeutredningen
            </h1>
            <Search session={session} numQuestionsAsked={numQuestionsAsked} maxNumQuestions={maxNumQuestions} setNumQuestionsAsked={setNumQuestionsAsked}/>
          </div>
        </section>
      </Layout>
    </>
  )
}
