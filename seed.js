const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hms';

const staffMembers = [
  {
    role: 'admin',
    staffId: 'ADMIN001',
    password: 'admin123',
    fullName: 'System Admin'
  },
  {
    role: 'doctor',
    staffId: 'DOC001',
    password: 'doc123',
    fullName: 'Dr. Smith'
  },
  {
    role: 'reception',
    staffId: 'REC001',
    password: 'rec123',
    fullName: 'Reception Desk'
  },
  {
    role: 'pharma',
    staffId: 'PHARMA001',
    password: 'pharma123',
    fullName: 'MediCare Pharmacy'
  },
  {
    role: 'labs',
    staffId: 'LAB001',
    password: 'lab123',
    fullName: 'MedLabs Central'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const staff of staffMembers) {
      const exists = await User.findOne({ staffId: staff.staffId });
      if (!exists) {
        await User.create(staff);
        console.log(`Created staff account: ${staff.staffId} (${staff.role})`);
      } else {
        console.log(`Staff account already exists: ${staff.staffId}`);
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();
