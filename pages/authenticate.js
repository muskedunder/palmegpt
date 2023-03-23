import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Authenticate() {

    const supabase = useSupabaseClient()

    return (
        <div className="container w-fit mx-auto pt-4 pb-6 md:pt-8 md:pb-10 lg:pt-10 lg:pb-16">
          <div className="mx-auto flex flex-col gap-4">
            <p className="text-xl font-bold text-center mb-3 mt-3"> Du behöver logga in för att kunna ställa frågor om Palmeutredningen </p>
            <Auth supabaseClient={supabase} providers={["facebook", "google"]} appearance={{ theme: ThemeSupa }} theme="dark" magicLink={true}/>
          </div>
        </div>
    )
}
