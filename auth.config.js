export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt'
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            return true;
        },
    },
}