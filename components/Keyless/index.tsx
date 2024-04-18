'use client'
import { GOOGLE_CLIENT_ID } from "../../src/app/lib/constants";
import useEphemeralKeyPair from "../../src/app/lib/useEphemeralKeyPair";
import GoogleLogo from "../../components/GoogleLogo";
const Keyless = () => {
    const ephemeralKeyPair = useEphemeralKeyPair();
    const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    const searchParams = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `http://localhost:3000/`,
        response_type: "id_token",
        scope: "openid email profile",
        nonce: ephemeralKeyPair.nonce,
    });
    redirectUrl.search = searchParams.toString();
    return (
        <div className="flex items-center justify-center min-h-screen w-screen px-4 bg-black text-white">
            <div>
                <h1 className="text-4xl font-bold mb-2">Welcome to Aptos Tarot</h1>
                <p className="text-lg mb-8">
                    Sign in with your Google account to continue
                </p>
                <a
                    href={redirectUrl.toString()}
                    className="mt-10 flex justify-center items-center gap-4 border rounded-lg px-8 py-2 hover:bg-gray-500 hover:shadow-sm active:bg-gray-50 active:scale-95 transition-all"
                >
                    <GoogleLogo />
                    Sign in with Google
                </a>
            </div>
        </div>
    )
}

export default Keyless;
