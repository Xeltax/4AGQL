const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getUserByEmail = async (email) => {
    return User.findOne({ where: { email } })
}

const getAllUsers = async () => {
    return User.findAll()
}

const updateUser = async (id, { email, pseudo, password }) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');

    if (email) user.email = email;
    if (pseudo) user.pseudo = pseudo;
    if (password) user.password = await bcrypt.hash(password, 10);

    return user.save();
};

const deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');

    await user.destroy();
    return user;
};

module.exports = { getAllUsers, getUserByEmail, updateUser, deleteUser };