const User = require('../models/user.model');
const Course = require('../models/course.model')
const bcrypt = require('bcryptjs');

const QUERY_OPTIONS = {
    include: [
        {
            model: Course,
            as: 'enrolledCourses',
            through: { attributes: [] }, // Exclude join table data
            include: [
                {
                    model: User,
                    as: 'professor',
                    attributes: ['id', 'email', 'pseudo', 'role'],
                    include: [
                        {
                            model: Course, // Inclusion circulaire pour les cours enseignés par le professeur
                            as: 'taughtCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        },
                        {
                            model: Course, // Inclusion circulaire pour les cours suivis par l'étudiant
                            as: 'enrolledCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        }
                    ]
                },
                {
                    model: User,
                    through: {attributes: []},  // Exclut les données de la table de jointure
                    as: 'students',
                    attributes: ['id', 'email', 'pseudo', 'role'],
                    include: [
                        {
                            model: Course, // Inclusion circulaire pour les cours enseignés par le professeur
                            as: 'taughtCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        },
                        {
                            model: Course, // Insertion circulaire pour les cours suivis par l'étudiant
                            as: 'enrolledCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        }
                    ]
                }
            ]
        },
        {
            model: Course,
            as: 'taughtCourses',
            foreignKey: 'professorId',
            include: [
                {
                    model: User,
                    as: 'professor',
                    attributes: ['id', 'email', 'pseudo', 'role'],
                    include: [
                        {
                            model: Course, // Inclusion circulaire pour les cours enseignés par le professeur
                            as: 'taughtCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        },
                        {
                            model: Course, // Inclusion circulaire pour les cours suivis par l'étudiant
                            as: 'enrolledCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        }
                    ]
                },
                {
                    model: User,
                    through: {attributes: []},  // Exclut les données de la table de jointure
                    as: 'students',
                    attributes: ['id', 'email', 'pseudo', 'role'],
                    include: [
                        {
                            model: Course, // Inclusion circulaire pour les cours enseignés par le professeur
                            as: 'taughtCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        },
                        {
                            model: Course, // Insertion circulaire pour les cours suivis par l'étudiant
                            as: 'enrolledCourses',
                            attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'hours'],
                        }
                    ]
                }
            ]
        }
    ]
}

const getUserByEmail = async (email) => {
    return User.findOne({ where: { email }, ...QUERY_OPTIONS })
}

const getAllUsers = async () => {
    return User.findAll(QUERY_OPTIONS)
}

const updateUser = async (id, { email, pseudo, password, role }, requester) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');

    if (email) user.email = email;
    if (pseudo) user.pseudo = pseudo;
    if (password) user.password = await bcrypt.hash(password, 10);

    if (requester.role === 'ROLE_ADMIN' && role) {
        user.role = role
    }

    await user.save();
    return User.findByPk(id, QUERY_OPTIONS)
};

const deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');

    await user.destroy();
    return user;
};

module.exports = { getAllUsers, getUserByEmail, updateUser, deleteUser };