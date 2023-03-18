import { useRef, useState, useEffect } from 'react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import Layout from '@/components/Layout';


export default function Home() {
  const [query, setQuery] = useState('')
  const [lastQuery, setLastQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [numQuestionsAsked, setNumQuestionsAsked] = useState(null)
  const [maxQuestions, setMaxQuestions] = useState(null)

  const session = useSession()
  const supabase = useSupabaseClient()

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus();
  }, [])

  useEffect(() => {
    getProfile()
  }, [session])


  async function getProfile() {

    if (session) {
      try {
        setLoading(true)

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
          setMaxQuestions(data.max_questions)
        }
      } catch (error) {
        alert('Error loading user data!')
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleSearch() {
    if (!query) {
      alert('Please input a question');
      return;
    }

    if (query === lastQuery) {
      console.log("input wasn't changed")
      return
    }

    setLastQuery(query)
    setAnswer('');
    setLoading(true);

    const question = query.trim();

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error(response.statusText);
      }

      const res = await response.json();

      if (res.answer) {
        setAnswer(res.answer);
        setNumQuestionsAsked(res.user_n_questions_asked)
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter' && query) {
      handleSearch();
    } else {
      return;
    }
  };

  return (
    <>
     {!session ? (
        <div>
          <p className="text-xl font-bold text-center mb-3 mt-3"> Du behöver autentisera dig för att ställa frågor om Palmeutredningen </p>
          <Auth supabaseClient={supabase} providers={["google"]} appearance={{ theme: ThemeSupa }} theme="dark" onlyThirdPartyProviders={true} />
        </div>
      ) : (
        <Layout>
          <section className="container max-w-xl mx-auto pt-4 pb-6 md:pt-8 md:pb-10 lg:pt-10 lg:pb-16">
            <div className="mx-auto flex flex-col gap-4">
              <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center mb-3">
                Ställ frågor om Palmeutredningen
              </h1>
              {numQuestionsAsked < maxQuestions ? (
              <p className="leading-[1.1] tracking-tighter text-center mb-3">
                Du har möjlighet att ställa totalt {maxQuestions} frågor, du har {maxQuestions - numQuestionsAsked} frågor kvar.
              </p>
              ): (
                <p className="leading-[1.1] tracking-tighter text-center mb-3">
                Du har ställt alla dina frågor.
              </p>
              )}
              <div className="flex w-full max-w-xl items-center space-x-2">
                <input
                  ref={inputRef}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-black dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
                  type="search"
                  placeholder="Vem mördade Olof Palme?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleEnter}
                />
                <button
                  onClick={handleSearch}
                  className="active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 h-10 py-2 px-4"
                >
                  Sök
                </button>
              </div>
              {loading && (
                <div className="mt-3">
                  <>
                    <div className="animate-pulse mt-2">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                    </div>
                  </>
                </div>
              )}
              {!loading && answer.length > 0 && (
                <>
                  <div className="rounded-md border-neutral-300 border p-5 mt-4">
                    <h2 className="text-xl font-bold leading-[1.1] tracking-tighter text-center">
                      Svar
                    </h2>
                    <p className="leading-normal text-slate-700 sm:leading-7 mt-3">
                      {answer}
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>
        </Layout>
      )}
    </>
  );
}
