const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLFloat } = require('graphql');
const {GradeType} = require("./types");
const {getGradesForStudent, getGradesForProfessor, isProfessorOfCourse, isStudentEnrolledInCourse, createGrade, getGradeWithCourse} = require("../repositories/grades-repository");

const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getGradesForStudent: {
            type: new GraphQLList(GradeType),
            args: {
                userId: {type: new GraphQLNonNull(GraphQLString) }

            },
            resolve: async (_, { userId }, { user }) => {
                if (!user) {
                    throw new Error('Unauthorized')
                }

                if (user.role === 'ROLE_USER' && user.id !== userId) {
                    throw new Error("Unauthorized access to another user's grades.");
                }

                return await getGradesForStudent(userId);
            }
        },
        getGradesForProfessor: {
            type: new GraphQLList(GradeType),
            args: {
                courseIds: { type: new GraphQLList(GraphQLString) }
            },
            resolve: async (_, { courseIds }, { user }) => {
                if (!user) {
                    throw new Error('Unauthorized')
                }

                // Vérification : seul un professeur peut accéder aux notes
                if (user.role !== 'ROLE_ADMIN') {
                    throw new Error('Only professors can access grades.');
                }

                return await getGradesForProfessor(user.id, courseIds);
            }
        }
    }
})

const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        createGrade: {
            type: GradeType,
            args: {
                userId: { type: new GraphQLNonNull(GraphQLString) },
                courseId: { type: new GraphQLNonNull(GraphQLString) },
                note: { type: new GraphQLNonNull(GraphQLFloat) },
                comment: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, { userId, courseId, note, comment }, { user }) => {
                if (!user) {
                    throw new Error('Unauthorized')
                }

                // Seul un professeur peut ajouter des notes
                if (user.role !== 'ROLE_ADMIN') {
                    throw new Error('Only professors can create grades.');
                }

                // Vérification : Le professeur doit enseigner le cours
                const isProfessor = await isProfessorOfCourse(user.id, courseId);
                if (!isProfessor) {
                    throw new Error('You are not the professor for this course.');
                }

                // Vérification : L'étudiant doit être inscrit au cours
                const isEnrolled = await isStudentEnrolledInCourse(userId, courseId);
                if (!isEnrolled) {
                    throw new Error('The student is not enrolled in this course.');
                }

                // Création de la note
                return await createGrade({ userId, courseId, note, comment });
            }
        },
        updateGrade: {
            type: GradeType,
            args: {
                gradeId: { type: new GraphQLNonNull(GraphQLString) },
                note: { type: GraphQLFloat },
                comment: { type: GraphQLString }
            },
            resolve: async (_, { gradeId, note, comment }, { user }) => {
                if (!user) {
                    throw new Error('Unauthorized')
                }

                // Seul un professeur peut mettre à jour les notes
                if (user.role !== 'ROLE_ADMIN') {
                    throw new Error('Only professors can update grades.');
                }

                // Récupérer la note
                const grade = await getGradeWithCourse(gradeId);
                if (!grade) {
                    throw new Error('Grade not found');
                }

                // Vérification : Le professeur doit être celui qui a enseigné le cours
                const isProfessor = await isProfessorOfCourse(user.id, grade.courseId);
                if (!isProfessor) {
                    throw new Error('You are not the professor for this course.');
                }

                // Mise à jour de la note
                if (note !== undefined) grade.note = note;
                if (comment !== undefined) grade.comment = comment;

                return grade.save();
            }
        },
        deleteGrade: {
            type: GradeType,
            args: {
                gradeId: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, { gradeId }, { user }) => {
                if (!user) {
                    throw new Error('Unauthorized')
                }

                // Seul un professeur peut supprimer une note
                if (user.role !== 'ROLE_ADMIN') {
                    throw new Error('Only professors can delete grades.');
                }

                // Récupérer la note
                const grade = await getGradeWithCourse(gradeId);
                if (!grade) {
                    throw new Error('Grade not found');
                }

                // Vérification : Le professeur doit être celui qui a enseigné le cours
                const isProfessor = await isProfessorOfCourse(user.id, grade.courseId);
                if (!isProfessor) {
                    throw new Error('You are not the professor for this course.');
                }

                // Suppression de la note
                await grade.destroy();
                return grade;
            }
        }
    }
})

module.exports = { RootQuery, Mutations }