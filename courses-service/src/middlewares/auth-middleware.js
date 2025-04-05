const jwt = require('jsonwebtoken');
const User = require('../models/user.model')

const authMiddleware = async (req) => {
    const authorization = req.headers.authorization
    if (!authorization) throw new Error("Authorization header is missing")
    if (!authorization.startsWith("Bearer ")) throw new Error("Authorization header is invalid")

    const token = authorization.split(" ")[1]
    if (!token) throw new Error('Token is missing')
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return { user: await User.findByPk(decoded.id) }
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
}

module.exports = authMiddleware