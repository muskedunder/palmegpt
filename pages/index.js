import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import Footer from '@/components/Footer';
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
              PalmeGPT - Ställ frågor om Palmeutredningen
            </h1>
            <div className="rounded-xl border-neutral-300 border p-5 mt-4 mb-6 mx-3">
                <p className="leading-normal text-slate-700 sm:leading-7">
                  Ställ en fråga om Palmeutredningen och PalmeGPT ger ett svar baserat på vad den kan hitta i utredningsmaterialet. PalmeGPT har tillgång till allt utredningsmaterial som finns att hitta på <a href="https://palmemordsarkivet.se" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">palmemordsarkivet</a>.
                </p>
              </div>
            <Search session={session} numQuestionsAsked={numQuestionsAsked} maxNumQuestions={maxNumQuestions} setNumQuestionsAsked={setNumQuestionsAsked}/>
          </div>
        </section>
        <Footer/>
      </Layout>
    </>
  )
}
