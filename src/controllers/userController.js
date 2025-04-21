const bcrypt = require('bcryptjs');

class UserController {
    constructor(userModel) {
        this.userModel = userModel;
    }

    // Get all users
    async getAllUsers(req, res) {
        const { page = 1, limit = 10 } = req.query;
        try {
            const offset = (page - 1) * limit;
            const { rows, count } = await this.userModel.findAndCountAll({
                attributes: { exclude: ['password'] },
                limit,
                offset,
            });
            res.status(200).json({ users: rows, total: count, page, limit });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    }

    // Get a user by ID
    async getUserById(req, res) {
        const { id } = req.params;

        // Validate UUID
        if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        try {
            const user = await this.userModel.findByPk(id, {
                attributes: { exclude: ['password'] }, // Exclude password from response
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error: error.message });
        }
    }

    // Create a new user
    async createUser(req, res) {
        const { username, password, email, fullname, role } = req.body;

        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Validate role if provided
        const validRoles = ['user', 'superadmin', 'admin', 'staff'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        try {
            const existingUser = await this.userModel.findOne({ where: { username } });
            if (existingUser) {
                return res.status(409).json({ message: 'Username already exists' });
            }

            if (email) {
                const existingEmail = await this.userModel.findOne({ where: { email } });
                if (existingEmail) {
                    return res.status(409).json({ message: 'Email already exists' });
                }
            }

            const newUser = await this.userModel.create({
                username,
                password, // Will be hashed by the model's beforeCreate hook
                email,
                fullname,
                role,
            });

            // Exclude password from response
            const userResponse = newUser.toJSON();
            delete userResponse.password;

            res.status(201).json({ message: 'User created successfully', user: userResponse });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }

    // Update a user by ID
    async updateUser(req, res) {
        const { id } = req.params;
        const { username, password, email, fullname, role } = req.body;

        // Validate UUID
        if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Validate role if provided
        const validRoles = ['user', 'superadmin', 'admin', 'staff'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        try {
            const user = await this.userModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check for username conflict
            if (username && username !== user.username) {
                const existingUser = await this.userModel.findOne({ where: { username } });
                if (existingUser) {
                    return res.status(409).json({ message: 'Username already exists' });
                }
            }

            // Check for email conflict
            if (email && email !== user.email) {
                const existingEmail = await this.userModel.findOne({ where: { email } });
                if (existingEmail) {
                    return res.status(409).json({ message: 'Email already exists' });
                }
            }

            // Update fields
            const updateData = {};
            if (username) updateData.username = username;
            if (password) updateData.password = password; // Will be hashed by the model's beforeUpdate hook
            if (email !== undefined) updateData.email = email; // Allow null email
            if (fullname !== undefined) updateData.fullname = fullname; // Allow null fullname
            if (role) updateData.role = role;

            await user.update(updateData);

            // Exclude password from response
            const userResponse = user.toJSON();
            delete userResponse.password;

            res.status(200).json({ message: 'User updated successfully', user: userResponse });
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    }

    // Delete a user by ID
    async deleteUser(req, res) {
        const { id } = req.params;

        // Validate UUID
        if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        try {
            const user = await this.userModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await user.destroy(); // Soft delete (due to paranoid: true in User model)

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    }
}

module.exports = UserController;