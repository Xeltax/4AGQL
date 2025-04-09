const bcrypt = require('bcryptjs')
const { getUserByEmail, getAllUsers, updateUser, deleteUser } = require('../../src/repositories/users-repository')

// Mocks
jest.mock('bcryptjs', () => ({
    hash: jest.fn()
}))

jest.mock('../../src/models/user.model', () => ({
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
}))

const User = require('../../src/models/user.model')
jest.mock('../../src/models/course.model', () => ({}))

describe('Users Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should get user by email', async () => {
        const fakeUser = { id: 1, email: 'test@example.com' }
        User.findOne.mockResolvedValue(fakeUser)

        const result = await getUserByEmail('test@example.com')

        expect(User.findOne).toHaveBeenCalledWith(expect.objectContaining({
            where: { email: 'test@example.com' }
        }))
        expect(result).toBe(fakeUser)
    })

    it('should get all users', async () => {
        const users = [{ id: 1 }, { id: 2 }]
        User.findAll.mockResolvedValue(users)

        const result = await getAllUsers()

        expect(User.findAll).toHaveBeenCalledWith(expect.any(Object))
        expect(result).toBe(users)
    })

    it('should update user and return updated one', async () => {
        const user = {
            id: 1,
            email: 'old@example.com',
            pseudo: 'oldpseudo',
            password: 'oldpass',
            role: 'ROLE_USER',
            save: jest.fn().mockResolvedValue()
        }

        User.findByPk
            .mockResolvedValueOnce(user) // get user
            .mockResolvedValueOnce({ ...user, email: 'new@example.com' }) // return updated

        bcrypt.hash.mockResolvedValue('newHashedPassword')

        const result = await updateUser(
            1,
            {
                email: 'new@example.com',
                pseudo: 'newpseudo',
                password: 'newpass',
                role: 'ROLE_ADMIN'
            },
            { role: 'ROLE_ADMIN' }
        )

        expect(user.email).toBe('new@example.com')
        expect(user.pseudo).toBe('newpseudo')
        expect(user.password).toBe('newHashedPassword')
        expect(user.role).toBe('ROLE_ADMIN')
        expect(user.save).toHaveBeenCalled()
        expect(result.email).toBe('new@example.com')
    })

    it('should delete user by id', async () => {
        const user = {
            id: 1,
            email: 'delete@example.com',
            destroy: jest.fn().mockResolvedValue()
        }

        User.findByPk.mockResolvedValue(user)

        const result = await deleteUser(1)

        expect(User.findByPk).toHaveBeenCalledWith(1)
        expect(user.destroy).toHaveBeenCalled()
        expect(result).toBe(user)
    })
})