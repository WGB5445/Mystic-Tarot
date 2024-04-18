'use client'
import { useEffect } from "react";
import { useKeylessAccounts } from "../../src/app/lib/useKeylessAccounts";

function CallbackPage() {
    const switchKeylessAccount = useKeylessAccounts(
        (state) => state.switchKeylessAccount
    );

    const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = fragmentParams.get("id_token");

    useEffect(() => {

        async function deriveAccount(idToken: string | '') {
            try {
                await switchKeylessAccount(idToken);

            } catch (error) {

            }
        }

        if (idToken) {
            deriveAccount(idToken);
        }
    }, [idToken, switchKeylessAccount]);

    return (
        <div>
                {/* Redirecting... */}
        </div>
    );
}

export default CallbackPage;
