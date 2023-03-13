import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

  
export default function Layout({ children }) {

    const supabase = useSupabaseClient()

    async function signout() {
      const { error } = await supabase.auth.signOut()
    }

    return (
    <div className="mx-auto flex flex-col space-y-4">
        <header className="container sticky top-0 z-40 bg-white">
        <div className="h-16 border-b border-b-slate-200 py-4">
            <nav className="ml-4 pl-6">
            <button className="hover:text-slate-600 cursor-pointer" onClick={signout}>
                Logga ut
            </button>
            </nav>
        </div>
        </header>
        <div className="container">
        <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
        </main>
        </div>
    </div>
    );
}
