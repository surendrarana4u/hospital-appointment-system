const User = require('../models/User');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

// In-memory OTP store for simplicity. In production, use Redis or DB.
const otpStore = new Map();

exports.registerPatient = async (req, res) => {
  try {
    const { fullName, phone, age, gender, address, medicalHistory } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Create User (Patient Role)
    user = new User({
      fullName,
      phone,
      role: 'patient'
    });
    await user.save();

    // Create Patient Profile
    const patient = new Patient({
      user: user._id,
      age,
      gender,
      address,
      medicalHistory
    });
    await patient.save();

    res.status(201).json({ message: 'Registration successful. Please login.' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering patient', error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone, role: 'patient' });
    
    if (!user) {
      return res.status(404).json({ message: 'Phone number not registered. Please register first.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, otp);

    // Development mode: send OTP in response
    res.status(200).json({ message: 'OTP sent successfully', devOTP: otp });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const storedOtp = otpStore.get(phone);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clear OTP
    otpStore.delete(phone);

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

exports.staffLogin = async (req, res) => {
  try {
    const { staffId, password } = req.body;
    
    const user = await User.findOne({ staffId });
    if (!user) {
      return res.status(404).json({ message: 'Staff ID not found' });
    }

    // Direct password check (mocking). In real life, use bcrypt.compare
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, staffId: user.staffId },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        staffId: user.staffId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during staff login', error: error.message });
  }
};
