const { GraphQLObjectType, GraphQLString, GraphQLList } = require("graphql");
const { getAllUsers, getUserByEmail, updateUser, deleteUser } = require("../repositories/users-repository");
const UserType = require("./types");
const { register, login } = require("../repositories/auth-repository");
const { GraphQLNonNull } = require("graphql/type");

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
            resolve: async (_, { email }, { user }) => {
                // Create custom object to compare email as users id
                const userToCompare = user ? { id: user.email, role: user.role } : undefined
                checkUserAuthorizations(email, userToCompare)

                return await getUserByEmail(email)
            },
        }
    }
})

const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        updateUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLString },
                pseudo: { type: GraphQLString },
                password: { type: GraphQLString },
                role: { type: GraphQLString }
            },
            resolve: async (_, args, { user }) => {
                checkUserAuthorizations(args.id, user)
                return await updateUser(args.id, args, user)
            }
        },
        deleteUser: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve: async (_, { id }, { user }) => {
                checkUserAuthorizations(id, user)
                return await deleteUser(id);
            }
        },
        register: {
            type: UserType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                pseudo: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                role: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, { email, pseudo, password, role }) => {
                return await register({ email, pseudo, password, role })
            }
        },
        login: {
            type: new GraphQLObjectType({
                name: 'AuthPayload',
                fields: {
                    token: { type: GraphQLString },
                    user: { type: UserType },
                }
            }),
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, { email, password }) => {
                return await login({ email, password })
            }
        }
    }
})

function checkUserAuthorizations(askedId, user) {
    if (!user) {
        throw new Error("Unauthorized")
    }

    if (user.id !== askedId && user.role !== "ROLE_ADMIN") {
        throw new Error("You can only manage your own account")
    }
}

module.exports = { RootQuery, Mutations }