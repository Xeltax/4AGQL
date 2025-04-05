const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull } = require('graphql');
const {CourseType} = require("./types");
const {GraphQLEnumType} = require("graphql/type");
const {getAllCourses, getCourseById, getCoursesByNameLike, createCourse, updateCourse, updateCourseStudents,
    deleteCourse
} = require("../repositories/courses-repository");

const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getAllCourses: {
            type: new GraphQLList(CourseType),
            resolve: async () => await getAllCourses()
        },
        getCourseById: {
            type: CourseType,
            args: { id: { type: new GraphQLNonNull(GraphQLString) } },
            resolve: async (_, { id }) => await getCourseById(id)
        },
        getCoursesByNameLike: {
            type: new GraphQLList(CourseType),
            args: { name: { type: new GraphQLNonNull(GraphQLString) } },
            resolve: async (_, { name }) => await getCoursesByNameLike(name)
        }
    }
})

const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        createCourse: {
            type: CourseType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                professorId: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, { name, professor }, { user }) => {
                checkUserAuthorizations(user)
                return await createCourse(name, professor)
            }
        },
        updateCourse: {
            type: CourseType,
            args: {
                courseId: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: GraphQLString },
                professorId: { type: GraphQLString },
            },
            resolve: async (_, args, { user }) => {
                checkUserAuthorizations(user)
                return await updateCourse(args.courseId, args.name, args.professorId)
            }
        },
        updateCourseStudents: {
            type: CourseType,
            args: {
                courseId: { type: new GraphQLNonNull(GraphQLString) },
                studentId: { type: new GraphQLNonNull(GraphQLString) },
                action: { type: new GraphQLEnumType({
                        name: 'ActionType',
                        values: {
                            ADD: {
                                value: 0
                            },
                            REMOVE: {
                                value: 1
                            }
                        }
                    })}
            },
            resolve: async (_, { courseId, studentId, action }, { user }) => {
                checkUserAuthorizations(user)
                return await updateCourseStudents(courseId, studentId, action)
            }
        },
        deleteCourse: {
            type: CourseType,
            args: { id: { type: new GraphQLNonNull(GraphQLString) } },
            resolve: async (_, { id }, { user }) => {
                checkUserAuthorizations(user)
                return await deleteCourse(id)
            }
        }
    }
})

function checkUserAuthorizations(user) {
    if (!user) {
        throw new Error("Unauthorized")
    }

    if (user.role !== "ROLE_ADMIN") {
        throw new Error("You can only manage your own account")
    }
}

module.exports = { RootQuery, Mutations }