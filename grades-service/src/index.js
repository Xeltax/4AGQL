const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express');
const authMiddleware = require("./middlewares/auth-middleware");
const sequelize = require('./config/db');
const {GraphQLSchema} = require("graphql/type");
const {RootQuery, Mutations} = require("./graphql/resolvers");
const User = require("./models/user.model");
const Course = require("./models/course.model")
const Grade = require('./models/garde.model')
const {getGradesForStudent} = require("./repositories/grades-repository");

const PORT = process.env.PORT || 8082;

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
    app.listen(PORT, () => console.log(`Classes service listening on port ${PORT}`));
})

const loadDefaultDataAsync = async () => {

    const user = await User.findOne({ where: { email: 'user@user.com' }})
    const grades = await getGradesForStudent(user.id)
    if (grades.length > 0) {
        console.log('User already has grades')
        return
    }

    const frenchCourse = await Course.findOne({ where: { name: 'Français' } });
    const englishCourse = await Course.findOne({ where: { name: 'Anglais' } });

    const notes = [];

    // Français : une seule note
    const note1 = generateRandomNote();
    notes.push({
        note: note1,
        comment: generateComment(note1),
        userId: user.id,
        courseId: frenchCourse.id,
    });

    // Anglais : 4 notes
    for (let i = 0; i < 4; i++) {
        const note = generateRandomNote();
        notes.push({
            note,
            comment: generateComment(note),
            userId: user.id,
            courseId: englishCourse.id,
        });
    }

    await Grade.bulkCreate(notes, {validate: true});
    console.log('Default grades created');
}

// Crée un tableau de notes aléatoires réalistes
const generateRandomNote = () => {
    const steps = Array.from({ length: 81 }, (_, i) => (i * 0.25).toFixed(2));
    return parseFloat(steps[Math.floor(Math.random() * steps.length)]);
}

const generateComment = (note) => {
    if (note < 5) return "Travail insuffisant";
    if (note < 10) return "Peut mieux faire";
    if (note < 15) return "Bon effort";
    if (note < 18) return "Très bon travail";
    return "Excellent !";
}