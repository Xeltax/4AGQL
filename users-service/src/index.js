const express = require('express')
const { GraphQLSchema } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const sequelize = require("./config/db");
const { RootQuery, Mutations} = require("./graphql/resolvers");

const app = express()
const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutations })
app.all('/graphql', createHandler({ schema, graphiql: true }))

sequelize.sync().then(() => {
    console.log('Database synced')
    app.listen(8080, () => console.log(`Users service listen on port 8080`))
})
