const express = require('express')
const { GraphQLSchema } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const sequelize = require("./config/db");
const { RootQuery, Mutations} = require("./graphql/resolvers");
const authMiddleware = require("./middlewares/auth-middleware");

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

sequelize.sync().then(() => {
    console.log('Database synced')
    app.listen(8080, () => console.log(`Users service listen on port 8080`))
})
