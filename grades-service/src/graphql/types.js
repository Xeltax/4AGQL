const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat } = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        email: { type: GraphQLString },
        pseudo: { type: GraphQLString },
        role: { type: GraphQLString },
        enrolledCourses: { type: new GraphQLList(CourseType) }, // One to many
        taughtCourses: { type: new GraphQLList(CourseType) }    // Many to Many
    })
})

const CourseType = new GraphQLObjectType({
    name: 'Course',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        professor: { type: UserType },                  // One to many
        students: { type: new GraphQLList(UserType) }   // Many to one
    })
})

const GradeType = new GraphQLObjectType({
    name: 'Grade',
    fields: () => ({
        id: { type: GraphQLString },
        note: { type: GraphQLFloat },
        comment: { type: GraphQLString },
        course: { type: CourseType },   // One to many
        student: { type: UserType }     // Many to one
    })
});

module.exports = { CourseType, UserType, GradeType }