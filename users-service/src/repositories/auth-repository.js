const User = require('../models/user.model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const register = async ({ email, pseudo, password, role }) => {
    const existingUser = await User.findOne({ where: { email }})
    if (existingUser) throw new Error('Email is already used')

    const hashedPassword = await bcrypt.hash(password, 10)
    const userRole = role === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER'

    return await User.create({
        email,
        pseudo,
        password: hashedPassword,
        role: userRole
    })
}

const login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } })
    if (!user) throw new Error('Invalid email or password')

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) throw new Error('Invalid email or password')

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )

    return { token, user }
}

module.exports = { register, login }