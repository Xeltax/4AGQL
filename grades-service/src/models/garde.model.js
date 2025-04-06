const sequelize = require("../config/db");
const {DataTypes} = require("sequelize");
const User = require('./user.model')
const Course = require('./course.model')

const Grade = sequelize.define('grades', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    note: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0,
            max: 20,
        },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Course,
            key: 'id',
        },
    },
}, {
    timestamps: true,
})

// Un utilisateur (étudiant) peut avoir plusieurs notes
User.hasMany(Grade, { foreignKey: 'userId', as: 'grades' });
Grade.belongsTo(User, { foreignKey: 'userId', as: 'student' });

// Un cours peut avoir plusieurs notes
Course.hasMany(Grade, { foreignKey: 'courseId', as: 'grades' });
Grade.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

module.exports = Grade