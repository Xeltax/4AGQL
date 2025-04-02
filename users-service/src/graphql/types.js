const { GraphQLObjectType, GraphQLString } = require("graphql");

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        email: { type: GraphQLString },
        pseudo: { type: GraphQLString },
        role: { type: GraphQLString },
    }
})

module.exports = UserType