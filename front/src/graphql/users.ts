// graphql/users.ts
import { gql } from '@apollo/client';

// Requête pour obtenir tous les utilisateurs
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      email
      pseudo
      role
      enrolledCourses {
        id
        name
      }
      taughtCourses {
        id
        name
      }
    }
  }
`;

// Requête pour récupérer un utilisateur par email
export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      email
      pseudo
      role
      enrolledCourses {
        id
        name
      }
      taughtCourses {
        id
        name
      }
    }
  }
`;

// Mutation pour se connecter
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        pseudo
        role
      }
    }
  }
`;

// Mutation pour s'inscrire
export const REGISTER = gql`
  mutation register($email: String!, $pseudo: String!, $password: String!, $role: String!) {
    register(email: $email, pseudo: $pseudo, password: $password, role: $role) {
      id
      email
      pseudo
      role
    }
  }
`;

// Mutation pour mettre à jour un utilisateur
export const UPDATE_USER = gql`
  mutation UpdateUser($id: String!, $email: String, $pseudo: String, $password: String) {
    updateUser(id: $id, email: $email, pseudo: $pseudo, password: $password) {
      id
      email
      pseudo
      role
    }
  }
`;

// Mutation pour supprimer un utilisateur
export const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id) {
      id
    }
  }
`;