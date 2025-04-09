const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { register, login } = require('../../src/repositories/auth-repository')

// Mocks
jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}))

jest.mock('../../src/models/user.model', () => ({
    findOne: jest.fn(),
    create: jest.fn()
}))

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        bcrypt.hash.mockResolvedValue('hashedPassword123')
        jwt.sign.mockReturnValue('fake-jwt-token')
    })

    describe('register', () => {
        it('should register a new user with hashed password and default role', async () => {
            const { findOne, create } = require('../../src/models/user.model')
            findOne.mockResolvedValue(null)

            create.mockResolvedValue({
                email: 'test@example.com',
                pseudo: 'testuser',
                role: 'ROLE_USER',
                password: 'hashedPassword123'
            })

            const result = await register({
                email: 'test@example.com',
                pseudo: 'testuser',
                password: 'plainpassword',
                role: 'not-admin'
            })

            expect(findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' }})
            expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10)
            expect(create).toHaveBeenCalledWith({
                email: 'test@example.com',
                pseudo: 'testuser',
                password: 'hashedPassword123',
                role: 'ROLE_USER'
            })
            expect(result.role).toBe('ROLE_USER')
        })

        it('should throw if email already exists', async () => {
            const { findOne } = require('../../src/models/user.model')
            findOne.mockResolvedValue({ id: 1, email: 'test@example.com' })

            await expect(register({
                email: 'test@example.com',
                pseudo: 'dupuser',
                password: 'password',
                role: 'ROLE_USER'
            })).rejects.toThrow('Email is already used')

            expect(findOne).toHaveBeenCalled()
        })
    })

    describe('login', () => {
        it('should login an existing user with correct password and generate a token', async () => {
            const { findOne } = require('../../src/models/user.model')
            findOne.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword123',
                role: 'ROLE_USER'
            })

            bcrypt.compare.mockResolvedValue(true)  // Simuler une comparaison réussie de mot de passe

            const result = await login({
                email: 'test@example.com',
                password: 'correctpassword'
            })

            expect(findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
            expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedPassword123')
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, email: 'test@example.com', role: 'ROLE_USER' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )
            expect(result.token).toBe('fake-jwt-token')
            expect(result.user.email).toBe('test@example.com')
        })

        it('should throw an error if the email is not found', async () => {
            const { findOne } = require('../../src/models/user.model')
            findOne.mockResolvedValue(null)  // Aucun utilisateur trouvé

            await expect(login({
                email: 'nonexistent@example.com',
                password: 'password'
            })).rejects.toThrow('Invalid email or password')

            expect(findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } })
            expect(bcrypt.compare).not.toHaveBeenCalled()  // Ne pas appeler compare si l'email n'existe pas
        })

        it('should throw an error if the password is incorrect', async () => {
            const { findOne } = require('../../src/models/user.model')
            findOne.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword123',
                role: 'ROLE_USER'
            })

            bcrypt.compare.mockResolvedValue(false)  // Mot de passe incorrect

            await expect(login({
                email: 'test@example.com',
                password: 'wrongpassword'
            })).rejects.toThrow('Invalid email or password')

            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword123')
        })
    })
})