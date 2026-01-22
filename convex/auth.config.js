export default {
    providers: [
        {
            domain: (() => {
                const d = process.env.AUTH0_DOMAIN;
                if (!d) throw new Error("Missing AUTH0_DOMAIN for Convex auth provider");
                const withScheme = d.startsWith("https://") ? d : `https://${d}`;
                // Auth0 issues tokens with an issuer (`iss`) that ends with a trailing slash:
                // `https://YOUR_TENANT.us.auth0.com/`
                // If we don't match it exactly, Convex will reject the token and `ctx.auth.getUserIdentity()`
                // will be null (appears as "guest").
                return withScheme.endsWith("/") ? withScheme : `${withScheme}/`;
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
