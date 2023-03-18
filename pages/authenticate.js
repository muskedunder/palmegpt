import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Authenticate() {

    const supabase = useSupabaseClient()

    return (
        <div>
          <p className="text-xl font-bold text-center mb-3 mt-3"> Du behöver autentisera dig för att ställa frågor om Palmeutredningen </p>
          <Auth supabaseClient={supabase} providers={["google"]} appearance={{ theme: ThemeSupa }} theme="dark" onlyThirdPartyProviders={true} />
        </div>
    )
}
