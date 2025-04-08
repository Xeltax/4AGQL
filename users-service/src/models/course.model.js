const sequelize = require("../config/db");
const {DataTypes} = require("sequelize");
const User = require('./user.model')

const Course = sequelize.define('courses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
    },
    professorId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id',
        },
        allowNull: false,
    }
}, {
    timestamps: true,
})

// Associe un professeur à un cours
Course.belongsTo(User, { foreignKey: 'professorId', as: 'professor' });

// Associe des étudiants à un cours
Course.belongsToMany(User, { through: 'user_courses', as: 'students' })

// Cours enseignés par le prof
User.hasMany(Course, { foreignKey: 'professorId', as: 'taughtCourses' });

// Cours suivis par l'étudiant
User.belongsToMany(Course, { through: 'user_courses', as: 'enrolledCourses' })

module.exports = Course