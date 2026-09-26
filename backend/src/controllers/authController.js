const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password.', 400, 'MISSING_FIELDS'));
    }
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long.', 400, 'PASSWORD_TOO_SHORT'));
    }

    const emailTrimmed = email.trim().toLowerCase();
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [emailTrimmed]);
    if (existing.rows.length > 0) {
      return next(new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS'));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'manager')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), emailTrimmed, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Please provide both email and password.', 400, 'MISSING_FIELDS'));
    }

    const emailTrimmed = email.trim().toLowerCase();
    const result = await db.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [emailTrimmed]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Please provide your registered email.', 400, 'MISSING_EMAIL'));
    }

    const emailTrimmed = email.trim().toLowerCase();
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [emailTrimmed]);
    if (userResult.rows.length === 0) {
      return next(new AppError('No account found with this email address.', 404, 'USER_NOT_FOUND'));
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await db.query(
      `INSERT INTO password_resets (email, otp_code, expires_at)
       VALUES ($1, $2, $3)`,
      [emailTrimmed, otp, expiresAt]
    );

    console.log(`[StockSense Password Reset OTP for ${emailTrimmed}]: ${otp}`);

    res.json({
      success: true,
      message: 'Password reset OTP generated successfully.',
      data: {
        email: emailTrimmed,
        otp, // Included in response for seamless local demo without requiring external SMTP service
        expiresInMinutes: 15,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return next(new AppError('Email, OTP code, and new password are required.', 400, 'MISSING_FIELDS'));
    }
    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters long.', 400, 'PASSWORD_TOO_SHORT'));
    }

    const emailTrimmed = email.trim().toLowerCase();
    const otpRes = await db.query(
      `SELECT id, expires_at, used FROM password_resets 
       WHERE email = $1 AND otp_code = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [emailTrimmed, otp.trim()]
    );

    if (otpRes.rows.length === 0) {
      return next(new AppError('Invalid OTP code. Please check and try again.', 400, 'INVALID_OTP'));
    }

    const resetRecord = otpRes.rows[0];
    if (resetRecord.used) {
      return next(new AppError('This OTP code has already been used.', 400, 'OTP_ALREADY_USED'));
    }
    if (new Date() > new Date(resetRecord.expires_at)) {
      return next(new AppError('This OTP code has expired. Please request a new one.', 400, 'OTP_EXPIRED'));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, emailTrimmed]);
    await db.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetRecord.id]);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return next(new AppError('User not found.', 404, 'USER_NOT_FOUND'));
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
