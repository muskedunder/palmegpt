import { useSession } from '@supabase/auth-helpers-react'

export default function NumberOfQuestions({ numQuestionsAsked, maxNumQuestions}) {

    const session = useSession()

    if (session) {
      return (
        <div className="leading-[1.1] tracking-tighter text-center mb-3">
            {numQuestionsAsked < maxNumQuestions ? (
              <>
                {maxNumQuestions - numQuestionsAsked === 1 ? (
                  <p>
                    Du har möjlighet att ställa totalt {maxNumQuestions} frågor, du har en fråga kvar.
                  </p>
                ) : (
                  <p>
                    Du har möjlighet att ställa totalt {maxNumQuestions} frågor, du har {maxNumQuestions - numQuestionsAsked} frågor kvar.
                  </p>
                )}
              </>
            ): (
              <p>
                Du har ställt alla dina frågor.
              </p>
            )}
        </div>
      )
    }
  return (null)
}
