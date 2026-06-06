# MediCare Plus - Healthcare Management System

A pure frontend healthcare management SPA (Single Page Application) with 3D effects and role-based dashboards.

## 🚀 Quick Start

Simply open `index.html` in your browser. No server or backend required!

## 🔐 Login Credentials

### Patient Login
1. Register with any 10-digit phone number
2. Use OTP: **123456** (shown in notification for demo)

### Staff Login
Use these credentials on the login page (click staff role buttons):

| Role | Staff ID | Password |
|------|----------|----------|
| Admin | ADMIN001 | admin123 |
| Doctor | DOC001 | doc123 |
| Reception | REC001 | rec123 |
| Pharmacy | PHARMA001 | pharma123 |
| Labs | LAB001 | lab123 |

## 📁 Project Structure

```
proj1 2/
├── index.html          # Main landing page
├── dashboard.html      # Unified role-based dashboard
├── style.css           # All styles including 3D effects
├── app.js              # JavaScript functionality
└── README.md           # This file
```

## ✨ Features

- **3D Flip Cards** - Doctor cards with hover effects
- **Role-Based Dashboards** - Single dashboard that adapts to user role
- **OTP Authentication** - Simulated login system
- **Pure Frontend** - No backend server needed
- **Responsive Design** - Works on all devices

## 🎨 Customization

### Change Doctor Images
Edit `index.html` and replace the image URLs in the doctors section:
```html
<img src="YOUR_IMAGE_URL" alt="Doctor Name" class="doctor-img">
```

### Add New Doctors
Copy any `doctor-card-3d` div block and update the content.

### Modify Staff Credentials
Edit `app.js` and update the `STAFF_CREDENTIALS` object.

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📝 Notes

- All data is stored in browser's localStorage
- Clear browser data to reset the application
- OTP is fixed to `123456` for demo purposes
