const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async register(req, res) {
    const { username, password, email, fullname, role } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      const existingUser = await this.userModel.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
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

      res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  }

  async login(req, res) {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      const user = await this.userModel.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRATION }
      );

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  }

  async resetPassword(req, res) {
    const { username, newPassword } = req.body;

    // Basic validation
    if (!username || !newPassword) {
      return res.status(400).json({ message: 'Username and new password are required' });
    }

    try {
      const user = await this.userModel.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update password (will be hashed by the model's beforeUpdate hook)
      await user.update({ password: newPassword });

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  }
}

module.exports = AuthController;