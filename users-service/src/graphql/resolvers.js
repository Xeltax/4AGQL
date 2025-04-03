const { GraphQLObjectType, GraphQLString, GraphQLList } = require("graphql");
const { getAllUsers, getUserByEmail, updateUser, deleteUser } = require("../repositories/users-repository");
const UserType = require("./types");

const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getAllUsers: {
            type: new GraphQLList(UserType),
            resolve: async () => await getAllUsers(),
        },
        getUserByEmail: {
            type: UserType,
            args: { email: { type: GraphQLString } },
            resolve: async (_, { email }) => await getUserByEmail(email),
        }
    }
})

const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        updateUser: {
            type: UserType,
            args: {
                id: {type: GraphQLString},
                email: {type: GraphQLString},
                pseudo: {type: GraphQLString},
                password: {type: GraphQLString}
            },
            resolve: async (_, args) => {
                // if (!user) throw new Error("Unauthorized");
                // if (user.id !== args.id) throw new Error("You can only update your own profile");

                return await updateUser(args.id, args);
            }
        },
        deleteUser: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve: async (_, { id }) => {
                // if (!user) throw new Error("Unauthorized");
                // if (user.id !== id) throw new Error("You can only delete your own account");

                return await deleteUser(id);
            }
        }
    }
})

module.exports = { RootQuery, Mutations }