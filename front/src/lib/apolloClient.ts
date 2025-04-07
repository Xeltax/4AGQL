// lib/apolloClient.ts
import {ApolloClient, InMemoryCache, HttpLink, createHttpLink} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import fetch from 'cross-fetch';

// Un seul lien pour la gateway GraphQL Mesh
const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_GATEWAY_URL || 'http://127.0.0.1:4000/graphql',
});

// Middleware pour ajouter le token JWT aux requêtes
const authLink = setContext((_, { headers }) => {
    if (headers && headers.authorization) {
        return { headers };
    }

    // Si pas trouvé dans les headers du contexte, essayer localStorage (côté client uniquement)
    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
    }

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        }
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined',
});

export { client };
// Pour la rétrocompatibilité avec ton code existant
export const usersClient = client;
export const coursesClient = client;
export const gradesClient = client;