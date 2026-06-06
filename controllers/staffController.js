const User = require('../models/User');

exports.createStaff = async (req, res) => {
  try {
    const { fullName, role, password } = req.body;
    
    // Auto generate staff ID
    const prefixes = { doctor: 'D', reception: 'R', pharma: 'PH', labs: 'LB' };
    const prefix = prefixes[role] || 'ST';
    const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const staffId = `${prefix}-${randomNum}`;
    
    const user = new User({
      fullName,
      role,
      staffId,
      password: password || 'password123'
    });
    
    await user.save();
    res.status(201).json({ message: 'Staff created successfully', staffId, user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating staff', error: error.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'reception', 'pharma', 'labs', 'admin'] } });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};
