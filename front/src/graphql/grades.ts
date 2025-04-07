// graphql/grades.ts
import { gql } from '@apollo/client';

// Requête pour récupérer les notes d'un étudiant
export const GET_GRADES_FOR_STUDENT = gql`
  query GetGradesForStudent($userId: String!) {
    getGradesForStudent(userId: $userId) {
      id
      note
      comment
      course {
        id
        name
      }
      student {
        id
        pseudo
        email
      }
    }
  }
`;

// Requête pour récupérer les notes des cours d'un professeur
export const GET_GRADES_FOR_PROFESSOR = gql`
  query GetGradesForProfessor($courseIds: [String!]) {
    getGradesForProfessor(courseIds: $courseIds) {
      id
      note
      comment
      course {
        id
        name
      }
      student {
        id
        pseudo
        email
      }
    }
  }
`;

// Mutation pour créer une note
export const CREATE_GRADE = gql`
  mutation CreateGrade($userId: String!, $courseId: String!, $note: Float!, $comment: String!) {
    createGrade(userId: $userId, courseId: $courseId, note: $note, comment: $comment) {
      id
      note
      comment
      course {
        id
        name
      }
      student {
        id
        pseudo
      }
    }
  }
`;

// Mutation pour mettre à jour une note
export const UPDATE_GRADE = gql`
  mutation UpdateGrade($gradeId: String!, $note: Float, $comment: String) {
    updateGrade(gradeId: $gradeId, note: $note, comment: $comment) {
      id
      note
      comment
    }
  }
`;

// Mutation pour supprimer une note
export const DELETE_GRADE = gql`
  mutation DeleteGrade($gradeId: String!) {
    deleteGrade(gradeId: $gradeId) {
      id
    }
  }
`;