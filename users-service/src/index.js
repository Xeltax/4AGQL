const express = require('express')
const { GraphQLSchema } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const sequelize = require("./config/db");
const { RootQuery, Mutations} = require("./graphql/resolvers");
const authMiddleware = require("./middlewares/auth-middleware");
const User = require("./models/user.model");

const app = express()
const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutations })
app.use('/graphql', createHandler({
        schema,
        graphiql: true,
        context: async req => {
            const authHeader = req.headers.authorization
            if (authHeader) {
                try {
                    return await authMiddleware(req)
                } catch (err) {
                    console.error('Error occurred during Authorization check', err)
                }
            }
            return {}
        },
    })
)

sequelize.sync().then(async () => {
    console.log('Database schema synced')
    loadDefaultDataAsync()
        .then(() => console.log('Successfully preload data'))
        .catch(err => console.error('Failed to preload data', err))
    app.listen(8080, '0.0.0.0', () => console.log(`Users service listen on port 8080`));
})

const loadDefaultDataAsync = async () => {
    const user = await User.findOne({ where: { pseudo: 'user' }})
    if (user) {
        console.log('Already preloaded data')
        return
    }

    // Create default users
    await User.bulkCreate([
        { email: 'admin@admin.com', pseudo: 'admin', password: '$2y$10$s5cJvtez0sNeW1hTzosN2.ic/QcAMqAC2xHi.IFEx3hvy9nPUxkbS', role: 'ROLE_ADMIN' },
        { email: 'user@user.com', pseudo: 'user', password: '$2y$10$s5cJvtez0sNeW1hTzosN2.ic/QcAMqAC2xHi.IFEx3hvy9nPUxkbS', role: 'ROLE_USER' },
    ], { validate: true, ignoreDuplicates: true })
}