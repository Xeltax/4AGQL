// graphql/courses.ts
import { gql } from '@apollo/client';

// Requête pour récupérer tous les cours
export const GET_ALL_COURSES = gql`
  query GetAllCourses {
    getAllCourses {
      id
      name
      professor {
        id
        pseudo
        email
      }
      students {
        id
        pseudo
        email
      }
    }
  }
`;

// Requête pour récupérer un cours par ID
export const GET_COURSE_BY_ID = gql`
  query GetCourseById($id: String!) {
    getCourseById(id: $id) {
      id
      name
      professor {
        id
        pseudo
        email
      }
      students {
        id
        pseudo
        email
      }
    }
  }
`;

// Requête pour chercher des cours par nom
export const GET_COURSES_BY_NAME = gql`
  query GetCoursesByNameLike($name: String!) {
    getCoursesByNameLike(name: $name) {
      id
      name
      professor {
        id
        pseudo
        email
      }
    }
  }
`;

// Mutation pour créer un cours
export const CREATE_COURSE = gql`
  mutation CreateCourse(
        $name: String!, 
        $professorId: String!, 
        $description: String, 
        $startDate: String, 
        $endDate: String!, 
        $hours: Int!
    ) {
    createCourse(
      name: $name, 
      professorId: $professorId, 
      description: $description, 
      startDate: $startDate, 
      endDate: $endDate, 
      hours: $hours
    ) {
      id
      name
      description
      hours
      startDate
      endDate
      professor {
        id
        pseudo
      }
    }
  }
`;

// Mutation pour mettre à jour un cours
export const UPDATE_COURSE = gql`
  mutation UpdateCourse(
    $courseId: String!, 
    $name: String, 
    $description: String,
    $startDate: String,
    $endDate: String,
    $hours: Int,
    $professorId: String
  ) {
    updateCourse(
        courseId: $courseId,
        name: $name,
        description: $description,
        startDate: $startDate,
        endDate: $endDate,
        hours: $hours,
        professorId: $professorId
    ) {
      id
      name
      description
      hours
      startDate
      endDate
       
      professor {
        id
        pseudo
      }
    }
  }
`;

// Mutation pour ajouter/supprimer un étudiant d'un cours
export const UPDATE_COURSE_STUDENTS = gql`
  mutation UpdateCourseStudents($courseId: String!, $studentId: String!, $action: ActionType!) {
    updateCourseStudents(courseId: $courseId, studentId: $studentId, action: $action) {
      id
      name
      students {
        id
        pseudo
      }
    }
  }
`;

// Mutation pour supprimer un cours
export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: String!) {
    deleteCourse(id: $id) {
      id
      name
    }
  }
`;