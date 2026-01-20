export default {
    providers: [
        {
            domain: (() => {
                const d = process.env.AUTH0_DOMAIN;
                if (!d) throw new Error("Missing AUTH0_DOMAIN for Convex auth provider");
                return d.startsWith("https://") ? d : `https://${d}`;
            })(),
            // For Auth0, we validate the ID token where `aud` === Auth0 SPA Client ID.
            applicationID: (() => {
                const id = process.env.AUTH0_CLIENT_ID;
                if (!id) throw new Error("Missing AUTH0_CLIENT_ID for Convex auth provider");
                return id;
            })(),
        },
    ]
};
