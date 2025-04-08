const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express');
const authMiddleware = require("./middlewares/auth-middleware");
const sequelize = require('./config/db');
const {GraphQLSchema} = require("graphql/type");
const {RootQuery, Mutations} = require("./graphql/resolvers");
const User = require("./models/user.model");
const Course = require("./models/course.model")

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
    }
}))

sequelize.sync().then(async () => {
    console.log('Database schema synced')
    loadDefaultDataAsync()
        .then(() => console.log('Successfully preload data'))
        .catch(err => console.error('Failed to preload data', err))
    app.listen(8081, '0.0.0.0', () => console.log(`Classes service listening on port 8081`));
})

const loadDefaultDataAsync = async () => {
    // Create courses with professor
    const admin = await User.findOne({ where: { email: 'admin@admin.com' }})
    if (!await Course.findOne({ where: { professorId: admin.id } })) {
        await Course.bulkCreate([
            { name: 'Français', description: 'Cours de Français', professorId: admin.id, startDate: new Date(), endDate: addDays(new Date(), 30), hours: 10 },
            { name: 'Mathématiques', description: 'Cours de Mathématiques', professorId: admin.id, startDate: new Date(), endDate: addDays(new Date(), 20), hours: 5 },
            { name: 'Anglais', description: 'Cours d\'Anglais', professorId: admin.id, startDate: new Date(), endDate: addDays(new Date(), 18), hours: 21 },
        ], { validate: true, ignoreDuplicates: true })
    }

    // Register user to a courses
    const user = await User.findOne({ where: { email: 'user@user.com' }})
    const frenchCourse = await Course.findOne({ where: { name: 'Français' } });
    const mathsCourse = await Course.findOne({ where: { name: 'Mathématiques' } });
    const englishCourse = await Course.findOne({ where: { name: 'Anglais' } });
    await user.addEnrolledCourse(frenchCourse)
    await user.addEnrolledCourse(mathsCourse)
    await user.addEnrolledCourse(englishCourse)
}

function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}