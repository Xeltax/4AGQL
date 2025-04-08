const Grade = require('../models/garde.model')
const Course = require('../models/course.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');
const {getCourseById} = require('./courses-repository')

const QUERY_OPTIONS = {
    include: [
        {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'description'],
            include: [
                {
                    model: User,
                    as: 'professor',
                    // attributes: ['id', 'pseudo', 'email'],
                    include: [
                        {
                            model: Course,
                            as: 'taughtCourses',
                            // attributes: ['id', 'name', 'description']
                        },
                        {
                            model: Course,
                            as: 'enrolledCourses',
                            // attributes: ['id', 'name', 'description']
                        }
                    ]
                }
            ]
        },
        {
            model: User,
            as: 'student',
            attributes: ['id', 'email', 'pseudo'],
            include: [
                {
                    model: Course,
                    as: 'enrolledCourses',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Course,
                    as: 'taughtCourses',
                    attributes: ['id', 'name', 'description']
                }
            ]
        }
    ]
}

const getGradesForStudent = async (userId) => {
    return Grade.findAll({
        where: { userId },
        ...QUERY_OPTIONS
    });
}

const getGradesForProfessor = async (professorId, courseIds = []) => {
    const whereClause = courseIds.length
        ? { id: { [Op.in]: courseIds }, professorId }
        : { professorId };

    const courses = await Course.findAll({ where: whereClause });

    return Grade.findAll({
        where: {
            courseId: { [Op.in]: courses.map(c => c.id) }
        },
        ...QUERY_OPTIONS
    });
}

const isProfessorOfCourse = async (professorId, courseId) => {
    const course = await Course.findOne({ where: { id: courseId, professorId } });
    return !!course;
}

const isStudentEnrolledInCourse = async (userId, courseId) => {
    const course = await getCourseById(courseId)
    const students = await course.getStudents({ where: { id: userId } });
    return students.length > 0;
}

const createGrade = async ({ userId, courseId, note, comment }) => {
    return Grade.create({ userId, courseId, note, comment });
}

const updateGrade = async (gradeId, { note, comment }) => {
    const grade = await Grade.findByPk(gradeId);
    if (!grade) throw new Error('Grade not found');

    if (note !== undefined) grade.note = note;
    if (comment !== undefined) grade.comment = comment;

    return grade.save();
}

const deleteGrade = async (gradeId) => {
    const grade = await Grade.findByPk(gradeId);
    if (!grade) throw new Error("Grade not found");

    await grade.destroy();
    return grade
}

const getGradeWithCourse = async (gradeId) => {
    return await Grade.findByPk(gradeId, {
        include: [{ model: Course, as: 'course' }]
    });
}

module.exports = {
    getGradesForStudent,
    getGradesForProfessor,
    createGrade,
    updateGrade,
    deleteGrade,
    isProfessorOfCourse,
    isStudentEnrolledInCourse,
    getGradeWithCourse
};