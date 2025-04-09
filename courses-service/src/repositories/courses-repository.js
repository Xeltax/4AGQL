const Course = require('../models/course.model')
const User = require('../models/user.model')
const {Op} = require("sequelize");

const QUERY_OPTIONS = {
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

const getAllCourses = async () => {
    return Course.findAll(QUERY_OPTIONS)
}

const getCourseById = async (id) => {
    return Course.findByPk(id, QUERY_OPTIONS)
}

const getCoursesByNameLike = async (name) => {
    return Course.findAll({
        where: {
            name: {
                [Op.iLike]: `%${name}%`
            }
        },
        include: QUERY_OPTIONS.include
    })
}

const createCourse = async (name, professorId, description, startDate, endDate, hours) => {
    const professor = await User.findByPk(professorId)
    if (professor.role !== 'ROLE_ADMIN') {
        throw new Error('This user is not a professor')
    }

    // checkCourseArgs(startDate, endDate, hours)

    const created = await Course.create({
        name,
        professorId,
        description,
        startDate: startDate,
        endDate: endDate,
        hours,
    });

    return await Course.findByPk(created.id, QUERY_OPTIONS)
};

const updateCourse = async (id, name, professorId, description, startDate, endDate, hours) => {
    const course = await Course.findOne({ where: { id } });
    if (!course) throw new Error('Course not found');

    checkCourseArgs(startDate, endDate, hours)

    course.name = name || course.name;
    course.professorId = professorId || course.professorId;
    course.description = description || course.description;
    course.startDate = startDate ? startDate : course.startDate;
    course.endDate = endDate ? endDate : course.endDate;
    course.hours = hours || course.hours;

    const professor = await User.findByPk(professorId)
    if (professor.role !== 'ROLE_ADMIN') {
        throw new Error('This user is not a professor')
    }

    await course.save();
    return await Course.findByPk(id, QUERY_OPTIONS);
};

const checkCourseArgs = (startDate, endDate, hours) => {
    if (startDate < Date.now()) {
        throw new Error('Start date cannot be before current date')
    }

    if (endDate < startDate) {
        throw new Error('End date cannot be before start date')
    }

    if (hours <= 0) {
        throw new Error('Course cannot have 0 or negative hours')
    }
}

const parseDate = (date) => {
    if (!date) {
        return undefined
    }
    try {
        return new Date(Number(date) * 1000)
    } catch (err) {
        return new Date(date)
    }
};

const updateCourseStudents = async (courseId, userId, action) => {
    const course = await Course.findOne({ where: { id: courseId } });
    if (!course) throw new Error('Course not found');

    const user = await User.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (action === 0) {  // ADD
        if (user.role === 'ROLE_ADMIN') {
            throw new Error('This user is not a student')
        }
        await course.addStudent(user);
    } else if (action === 1) {  // REMOVE
        await course.removeStudent(user);
    } else {
        throw new Error('Invalid action');
    }

    return course;
};

const deleteCourse = async (id) => {
    const course = await Course.findOne({ where: { id } });
    if (!course) throw new Error('Course not found');

    await course.destroy();
    return course;
};

module.exports = {
    getAllCourses,
    getCourseById,
    getCoursesByNameLike,
    createCourse,
    updateCourse,
    updateCourseStudents,
    deleteCourse
}