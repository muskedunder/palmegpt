import '@/styles/globals.css'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { Source_Serif_4 } from '@next/font/google'

const sourceSerif4 = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif-4'})


function App({ Component, pageProps }) {
  const [supabase] = useState(() => createBrowserSupabaseClient())

  return (
    <main className={`${sourceSerif4.variable} font-sans`}>
      <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
        <Component {...pageProps} />
      </SessionContextProvider>
    </main>
  )
}
export default App