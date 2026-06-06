(function () {
  // No backend - pure frontend mode

  function injectNotificationStyles() {
    if (document.getElementById('hms-notification-style')) return;
    const style = document.createElement('style');
    style.id = 'hms-notification-style';
    style.textContent = `
      .notification {
        position: fixed;
        top: 100px;
        right: -420px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 99999;
        transition: right 0.35s ease;
        min-width: 300px;
        max-width: 420px;
      }
      .notification.show { right: 20px; }
      .notification-success { border-left: 4px solid #10b981; }
      .notification-success i { color: #10b981; font-size: 1.4rem; }
      .notification-error { border-left: 4px solid #ef4444; }
      .notification-error i { color: #ef4444; font-size: 1.4rem; }
      .notification-info { border-left: 4px solid #2563eb; }
      .notification-info i { color: #2563eb; font-size: 1.4rem; }
      .animate-in {
        animation: slideInUp 0.6s ease forwards;
      }
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(50px); }
        to { opacity: 1; transform: translateY(0); }
      }
      body.loaded { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  function showNotification(message, type) {
    const level = type || 'info';
    document.querySelectorAll('.notification').forEach((n) => n.remove());
    const notification = document.createElement('div');
    notification.className = `notification notification-${level}`;
    const iconMap = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    notification.innerHTML = `
      <i class="fas fa-${iconMap[level] || 'info-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(function () { notification.classList.add('show'); }, 100);
    setTimeout(function () {
      notification.classList.remove('show');
      setTimeout(function () { notification.remove(); }, 300);
    }, 3200);
  }

  function saveSession(token, user) {
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(user));
  }

  function getToken() {
    return localStorage.getItem('hms_token');
  }

  const API_BASE_URL = 'http://localhost:3000/api';

  async function apiCall(endpoint, method = 'GET', body = null) {
    console.log(`API Call: ${method} ${endpoint}`, body);
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API call failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  function initMainPage() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function () {
        navLinks.classList.toggle('active');
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (navLinks) navLinks.classList.remove('active');
      });
    });

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
      if (!navbar) return;
      if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }
    });

    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', function () {
      let current = '';
      sections.forEach(function (section) {
        if (scrollY >= section.offsetTop - 200) current = section.getAttribute('id') || '';
      });
      navItems.forEach(function (item) {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) item.classList.add('active');
      });
    });

    const mouse3dElements = document.querySelectorAll('.mouse-3d');
    document.addEventListener('mousemove', function (e) {
      mouse3dElements.forEach(function (element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 20;
        const rotateY = (rect.width / 2 - x) / 20;
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('animate-in');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
    document.querySelectorAll('.service-card, .doctor-card, .info-item').forEach(function (el) {
      observer.observe(el);
    });

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        showNotification('Message sent successfully!', 'success');
        contactForm.reset();
      });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        showNotification('Subscribed successfully!', 'success');
        newsletterForm.reset();
      });
    }

    window.addEventListener('scroll', function () {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.floating-card');
      parallaxElements.forEach(function (element, index) {
        const speed = 0.5 + index * 0.1;
        element.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });

    function animateNumbers() {
      document.querySelectorAll('.stat-number').forEach(function (stat) {
        const target = stat.innerText;
        if (!/^\d/.test(target)) return;
        const numericValue = parseInt(target.replace(/\D/g, ''), 10);
        const suffix = target.replace(/[\d]/g, '');
        let current = 0;
        const increment = numericValue / 50;
        const timer = setInterval(function () {
          current += increment;
          if (current >= numericValue) {
            stat.innerText = target;
            clearInterval(timer);
          } else {
            stat.innerText = Math.floor(current) + suffix;
          }
        }, 30);
      });
    }

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      const heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumbers();
            heroObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      heroObserver.observe(heroSection);
    }

    const doctorsGrid = document.querySelector('.doctors-grid');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (doctorsGrid && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', function () {
        const card = doctorsGrid.querySelector('.doctor-card-3d');
        if (card) {
          const scrollAmount = card.offsetWidth + parseFloat(getComputedStyle(doctorsGrid).gap || 0);
          doctorsGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      });
      nextBtn.addEventListener('click', function () {
        const card = doctorsGrid.querySelector('.doctor-card-3d');
        if (card) {
          const scrollAmount = card.offsetWidth + parseFloat(getComputedStyle(doctorsGrid).gap || 0);
          doctorsGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      });
    }

    window.addEventListener('load', function () {
      document.body.classList.add('loaded');
    });

    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
      footerYear.innerHTML = `&copy; ${new Date().getFullYear()} MediCare Plus. All rights reserved.`;
    }
  }

  function initAuth() {
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
      registrationForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = {
          fullName: document.getElementById('fullName').value.trim(),
          age: document.getElementById('age').value,
          gender: document.getElementById('gender').value,
          phone: document.getElementById('phone').value.trim(),
          email: document.getElementById('email').value.trim(),
          address: document.getElementById('address').value.trim(),
          medicalHistory: document.getElementById('medicalHistory').value.trim(),
        };
        if (!/^[0-9]{10}$/.test(formData.phone)) {
          showNotification('Please enter a valid 10-digit phone number', 'error');
          return;
        }
        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        try {
          const data = await apiCall('/auth/register', 'POST', formData);
          showNotification(data.message || 'Registration successful!', 'success');
          setTimeout(function () {
            if (typeof showPage === 'function') showPage('login');
            else window.location.href = 'index.html';
          }, 1400);
        } catch (error) {
          showNotification(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Register Now</span><div class="btn-3d-bg"></div>';
        }
      });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const phone = document.getElementById('loginPhone').value.trim();
        if (!/^[0-9]{10}$/.test(phone)) {
          showNotification('Please enter a valid 10-digit phone number', 'error');
          return;
        }
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
        try {
          const data = await apiCall('/auth/send-otp', 'POST', { phone: phone });
          if (data.devOTP) showNotification(`DEV MODE - Your OTP: ${data.devOTP}`, 'info');
          else showNotification('OTP sent to your phone!', 'success');
          localStorage.setItem('loginPhone', phone);
          setTimeout(function () {
            if (typeof showPage === 'function') showPage('otp');
            if (typeof startOTPTimer === 'function') startOTPTimer();
          }, 800);
        } catch (error) {
          showNotification(error.message || 'Failed to send OTP. Are you registered?', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send OTP</span><div class="btn-3d-bg"></div>';
        }
      });
    }

    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
      const otpInputs = document.querySelectorAll('.otp-input');
      otpInputs.forEach(function (input, index) {
        input.addEventListener('input', function (e) {
          if (e.target.value.length === 1 && index < otpInputs.length - 1) otpInputs[index + 1].focus();
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !e.target.value && index > 0) otpInputs[index - 1].focus();
        });
      });

      otpForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        let otp = '';
        document.querySelectorAll('.otp-input').forEach(function (input) { otp += input.value; });
        if (otp.length !== 6) {
          showNotification('Please enter the complete 6-digit OTP', 'error');
          return;
        }
        const phone = localStorage.getItem('loginPhone');
        if (!phone) {
          showNotification('Session expired. Please login again.', 'error');
          return;
        }
        const submitBtn = otpForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        try {
          const data = await apiCall('/auth/verify-otp', 'POST', { phone: phone, otp: otp });
          saveSession(data.token, data.user);
          showNotification('Login successful! Redirecting to dashboard...', 'success');
          setTimeout(function () { window.location.href = 'dashboard-patient.html'; }, 1200);
        } catch (error) {
          showNotification(error.message || 'Invalid OTP. Please try again.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Verify OTP</span><div class="btn-3d-bg"></div>';
        }
      });
    }

    document.querySelectorAll('.role-btn').forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.preventDefault();
        const role = btn.textContent.trim().toLowerCase();
        const staffId = prompt(`Enter your ${role} Staff ID:`);
        if (!staffId) return;
        const password = prompt('Enter your password:');
        if (!password) return;
        try {
          const data = await apiCall('/auth/staff-login', 'POST', { staffId: staffId, password: password });
          saveSession(data.token, data.user);
          showNotification(`Welcome, ${data.user.fullName}!`, 'success');
          const dashboards = {
            admin: 'dashboard-admin.html',
            doctor: 'dashboard-doctor.html',
            reception: 'dashboard-reception.html',
            pharma: 'dashboard-pharma.html',
            labs: 'dashboard-labs.html',
          };
          setTimeout(function () {
            window.location.href = dashboards[data.user.role] || 'index.html';
          }, 1000);
        } catch (error) {
          showNotification(error.message || 'Login failed. Check your credentials.', 'error');
        }
      });
    });
  }

  function initSharedDashboardNav() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (navItems.length && sections.length) {
      navItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.preventDefault();
          const targetSection = item.getAttribute('data-section');
          navItems.forEach(function (nav) { nav.classList.remove('active'); });
          item.classList.add('active');
          sections.forEach(function (section) {
            section.classList.remove('active');
            if (section.id === targetSection) section.classList.add('active');
          });
          if (window.innerWidth <= 1024 && sidebar) sidebar.classList.remove('active');
        });
      });
    }

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
      });
      document.addEventListener('click', function (e) {
        if (window.innerWidth <= 1024 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove('active');
        }
      });
    }
  }

  function initPatientDashboard() {
    async function loadPatientData() {
      try {
        const patientData = await apiCall('/patients/profile', 'GET');
        if (!patientData || !patientData.user) return;
        
        const patientName = document.getElementById('patientName');
        const userName = document.getElementById('userName');
        const profileName = document.getElementById('profileName');
        const detailName = document.getElementById('detailName');
        const detailAge = document.getElementById('detailAge');
        const detailGender = document.getElementById('detailGender');
        const detailPhone = document.getElementById('detailPhone');
        const detailEmail = document.getElementById('detailEmail');
        const detailAddress = document.getElementById('detailAddress');
        const detailMedical = document.getElementById('detailMedical');
        
        const patientFullName = patientData.user.fullName;

        if (patientName) patientName.textContent = patientFullName.split(' ')[0];
        if (userName) userName.textContent = patientFullName;
        if (profileName) profileName.textContent = patientFullName;
        if (detailName) detailName.textContent = patientFullName;
        if (detailAge) detailAge.textContent = patientData.age || 'N/A';
        if (detailGender) detailGender.textContent = patientData.gender ? patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1) : 'N/A';
        if (detailPhone) detailPhone.textContent = patientData.user.phone || 'N/A';
        if (detailEmail) detailEmail.textContent = patientData.email || 'Not provided';
        if (detailAddress) detailAddress.textContent = patientData.address || 'Not provided';
        if (detailMedical) detailMedical.textContent = patientData.medicalHistory || 'None';
      } catch (error) {
        console.error('Failed to load patient data:', error);
      }
    }

    window.openModal = function (modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    window.closeModal = function (modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    };

    document.querySelectorAll('.modal').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      });
    });

    window.viewPrescription = function (id) {
      const details = document.getElementById('prescriptionDetails');
      if (!details) return;
      const prescriptions = {
        1: { doctor: 'Dr. Sarah Johnson', specialty: 'Cardiologist', date: 'April 10, 2026', diagnosis: 'Hypertension', medications: ['Amlodipine 5mg - Once daily (morning)', 'Losartan 50mg - Once daily (evening)', 'Aspirin 75mg - Once daily (after lunch)'], instructions: 'Monitor blood pressure daily. Avoid high-sodium foods. Follow up in 2 weeks.', nextVisit: 'April 24, 2026' },
        2: { doctor: 'Dr. Michael Chen', specialty: 'Neurologist', date: 'April 8, 2026', diagnosis: 'Migraine', medications: ['Sumatriptan 50mg - As needed (at onset of migraine)', 'Propranolol 40mg - Twice daily (morning and evening)', 'Magnesium 400mg - Once daily'], instructions: 'Avoid triggers (stress, lack of sleep, certain foods). Keep a migraine diary.', nextVisit: 'May 8, 2026' },
        3: { doctor: 'Dr. Emily Davis', specialty: 'General Physician', date: 'April 5, 2026', diagnosis: 'Common Cold', medications: ['Paracetamol 500mg - Three times daily (after meals)', 'Cetirizine 10mg - Once daily (before bedtime)', 'Vitamin C 500mg - Twice daily'], instructions: 'Rest well. Stay hydrated. Avoid cold beverages.', nextVisit: 'April 12, 2026' },
      };
      const p = prescriptions[id];
      if (!p) return;
      details.innerHTML = `
        <div class="prescription-full">
          <div class="prescription-full-header">
            <div class="doctor-info-large"><div class="doctor-avatar-large"><i class="fas fa-user-md"></i></div><div><h4>${p.doctor}</h4><p class="specialty">${p.specialty}</p></div></div>
            <p class="prescription-date"><i class="fas fa-calendar"></i> ${p.date}</p>
          </div>
          <div class="prescription-full-body">
            <div class="prescription-section"><h5><i class="fas fa-stethoscope"></i> Diagnosis</h5><p>${p.diagnosis}</p></div>
            <div class="prescription-section"><h5><i class="fas fa-pills"></i> Medications</h5><ul class="medications-list">${p.medications.map(function (med) { return `<li>${med}</li>`; }).join('')}</ul></div>
            <div class="prescription-section"><h5><i class="fas fa-clipboard-list"></i> Instructions</h5><p>${p.instructions}</p></div>
            <div class="prescription-section"><h5><i class="fas fa-calendar-check"></i> Next Visit</h5><p><strong>${p.nextVisit}</strong></p></div>
          </div>
        </div>
      `;
      window.openModal('prescriptionModal');
    };

    window.downloadPrescription = function () {
      showNotification('Downloading prescription...', 'success');
      setTimeout(function () { showNotification('Prescription downloaded successfully!', 'success'); }, 1200);
    };
    window.viewReport = function () {
      showNotification('Opening lab report...', 'info');
      setTimeout(function () { showNotification('Lab report opened in new window', 'success'); }, 1000);
    };
    window.downloadReport = function () {
      showNotification('Downloading lab report...', 'success');
      setTimeout(function () { showNotification('Lab report downloaded successfully!', 'success'); }, 1200);
    };
    window.downloadReceipt = function () {
      showNotification('Downloading receipt...', 'success');
      setTimeout(function () { showNotification('Receipt downloaded successfully!', 'success'); }, 1200);
    };
    window.payBill = function (id) {
      window.currentPaymentBillId = id;
      const amountElement = document.getElementById('modalPayAmount');
      if (amountElement) {
        // Fallbacks since bills in HTML are currently hardcoded
        amountElement.innerText = id === 1 ? '₹1,800' : '₹2,200';
      }
      
      window.openModal('paymentModal');
    };

    window.confirmPayment = async function() {
      const btn = document.getElementById('confirmPaymentBtn');
      if(btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      }
      
      showNotification('Processing payment securely...', 'info');
      
      setTimeout(function () { 
        showNotification('Payment successful! Bill marked as paid.', 'success'); 
        window.closeModal('paymentModal');
        if(btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment';
        }
      }, 2000);
    };

    document.addEventListener('DOMContentLoaded', function () {
      loadPatientData();
    });
    setTimeout(function () { showNotification('You have a new lab report available!', 'info'); }, 3000);
  }

  function initDoctorDashboard() {
    const orderLabTests = document.getElementById('orderLabTests');
    const labTestsSection = document.getElementById('labTestsSection');
    if (orderLabTests && labTestsSection) {
      orderLabTests.addEventListener('change', function () {
        labTestsSection.style.display = orderLabTests.checked ? 'block' : 'none';
      });
    }

    const prescriptionFile = document.getElementById('prescriptionFile');
    const filePreview = document.getElementById('filePreview');
    window.removeFile = function () {
      if (prescriptionFile) prescriptionFile.value = '';
      if (filePreview) filePreview.innerHTML = '';
    };
    if (prescriptionFile && filePreview) {
      prescriptionFile.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        filePreview.innerHTML = `
          <div class="uploaded-file">
            <i class="fas fa-file-image"></i>
            <p>${file.name}</p>
            <button type="button" class="btn-icon" onclick="removeFile()"><i class="fas fa-times"></i></button>
          </div>
        `;
      });
    }

    window.addMedication = function () {
      const medicationsList = document.getElementById('medicationsList');
      if (!medicationsList) return;
      const row = document.createElement('div');
      row.className = 'medication-item';
      row.innerHTML = `
        <div class="form-row">
          <div class="form-group-3d"><label>Medication Name</label><input type="text" placeholder="e.g., Paracetamol 500mg" class="med-name"></div>
          <div class="form-group-3d"><label>Dosage</label><input type="text" placeholder="e.g., 1 tablet" class="med-dosage"></div>
          <div class="form-group-3d">
            <label>Frequency</label>
            <select class="med-frequency">
              <option value="">Select</option><option value="once">Once daily</option><option value="twice">Twice daily</option><option value="thrice">Three times daily</option><option value="as-needed">As needed</option>
            </select>
          </div>
        </div>
        <div class="form-group-3d"><label>Instructions</label><input type="text" placeholder="e.g., After meal, Before bed" class="med-instructions"></div>
        <button type="button" class="btn-icon" onclick="this.parentElement.remove()" style="margin-top: 0.5rem;"><i class="fas fa-trash"></i></button>
      `;
      medicationsList.appendChild(row);
    };

    const patientIdInput = document.getElementById('patientId');
    const patientNameInput = document.getElementById('patientName');
    if (patientIdInput && patientNameInput) {
      patientIdInput.addEventListener('blur', async function () {
        const patientId = patientIdInput.value;
        if (!patientId) return;
        try {
          const data = await apiCall(`/patients/${patientId}`);
          patientNameInput.value = data.user.fullName;
          showNotification(`Patient found: ${data.user.fullName}`, 'success');
        } catch (error) {
          showNotification('Patient ID not found', 'error');
          patientNameInput.value = '';
        }
      });
    }

    const prescriptionForm = document.getElementById('prescriptionForm');
    if (prescriptionForm) {
      prescriptionForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const meds = [];
        document.querySelectorAll('.medication-item').forEach(function (item) {
          const med = {
            name: item.querySelector('.med-name') ? item.querySelector('.med-name').value : '',
            dosage: item.querySelector('.med-dosage') ? item.querySelector('.med-dosage').value : '',
            frequency: item.querySelector('.med-frequency') ? item.querySelector('.med-frequency').value : '',
            instructions: item.querySelector('.med-instructions') ? item.querySelector('.med-instructions').value : '',
          };
          if (med.name) meds.push(med);
        });
        if (!meds.length) {
          showNotification('Please add at least one medication', 'error');
          return;
        }
        showNotification('Sending prescription to pharma...', 'info');
        
        try {
          const diagnosis = document.getElementById('diagnosis').value;
          await apiCall('/prescriptions', 'POST', {
            patientId: patientIdInput.value,
            diagnosis,
            medications: meds
          });
          showNotification('Prescription sent successfully to pharmacy!', 'success');
          prescriptionForm.reset();
          if (filePreview) filePreview.innerHTML = '';
          if (window.loadDoctorPrescriptions) window.loadDoctorPrescriptions();
        } catch (error) {
          showNotification(error.message || 'Error saving prescription', 'error');
        }
      });
    }

    window.loadDoctorPatients = async function() {
      const tbody = document.getElementById('doctorPatientsTableBody');
      if (!tbody) return;
      try {
        const patients = await apiCall('/patients');
        tbody.innerHTML = '';
        if (patients.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No patients found</td></tr>';
          return;
        }
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>
              <div class="test-info">
                <i class="fas fa-user"></i>
                <div>
                  <strong>${patient.user ? patient.user.fullName : 'N/A'}</strong>
                  <p>${patient.user ? patient.user.phone : 'N/A'}</p>
                </div>
              </div>
            </td>
            <td>${patient.patientId}</td>
            <td>${patient.gender || 'N/A'}</td>
            <td>${new Date(patient.createdAt).toLocaleDateString()}</td>
            <td><span class="status-badge completed">Active</span></td>
            <td>
              <button class="btn-icon" onclick="createPrescriptionFor('${patient.patientId}')">
                <i class="fas fa-file-prescription"></i>
              </button>
            </td>
          `;
          tbody.appendChild(row);
        });
      } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error loading patients</td></tr>';
      }
    };

    window.loadDoctorPrescriptions = async function() {
      const grid = document.getElementById('doctorPrescriptionsGrid');
      const recentBody = document.getElementById('doctorRecentPrescriptions');
      if (!grid && !recentBody) return;
      
      try {
        const prescriptions = await apiCall('/prescriptions');
        if (grid) {
          grid.innerHTML = '';
          if (prescriptions.length === 0) {
            grid.innerHTML = '<p>No prescriptions found.</p>';
          } else {
            prescriptions.forEach(rx => {
              const div = document.createElement('div');
              div.className = 'prescription-card card-3d-hover';
              div.innerHTML = `
                <div class="prescription-header">
                  <div class="doctor-info">
                    <div class="doctor-avatar"><i class="fas fa-user"></i></div>
                    <div>
                      <h4>${rx.patient && rx.patient.user ? rx.patient.user.fullName : 'Unknown'}</h4>
                      <p class="specialty">Patient ID: ${rx.patient ? rx.patient.patientId : 'N/A'}</p>
                    </div>
                  </div>
                  <span class="status-badge ${rx.status === 'completed' ? 'completed' : 'processing'}">${rx.status}</span>
                </div>
                <div class="prescription-body">
                  <p class="diagnosis"><strong>Diagnosis:</strong> ${rx.diagnosis}</p>
                  <p class="date"><i class="fas fa-calendar"></i> ${new Date(rx.createdAt).toLocaleDateString()}</p>
                  <div class="prescription-preview">
                    <p><strong>Medications:</strong></p>
                    <ul>
                      ${rx.medications.map(m => `<li>${m.name} ${m.dosage} - ${m.frequency}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              `;
              grid.appendChild(div);
            });
          }
        }
        
        if (recentBody) {
          recentBody.innerHTML = '';
          if (prescriptions.length === 0) {
            recentBody.innerHTML = '<p style="text-align:center; padding: 1rem;">No recent prescriptions</p>';
          } else {
            prescriptions.slice(0, 3).forEach(rx => {
              const div = document.createElement('div');
              div.className = 'prescription-item';
              div.innerHTML = `
                <div class="prescription-icon"><i class="fas fa-user"></i></div>
                <div class="prescription-details">
                  <h4>${rx.patient && rx.patient.user ? rx.patient.user.fullName : 'Unknown'}</h4>
                  <p>${rx.diagnosis} - ${rx.medications.length} meds</p>
                  <span class="date">${new Date(rx.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="prescription-status status-${rx.status === 'completed' ? 'completed' : 'pending'}">
                  <i class="fas ${rx.status === 'completed' ? 'fa-check' : 'fa-clock'}"></i>
                </div>
              `;
              recentBody.appendChild(div);
            });
          }
        }
      } catch (error) {
        console.error('Failed to load prescriptions', error);
      }
    };
    
    // Initial load
    if (document.getElementById('doctorPatientsTableBody')) {
      window.loadDoctorPatients();
    }
    if (document.getElementById('doctorPrescriptionsGrid') || document.getElementById('doctorRecentPrescriptions')) {
      window.loadDoctorPrescriptions();
    }

    window.saveDraft = function () { showNotification('Draft saved successfully!', 'success'); };
    window.viewPatient = function (patientId) { showNotification(`Opening patient record: ${patientId}`, 'info'); };
    window.createPrescriptionFor = function (patientId) {
      document.querySelectorAll('.nav-item[data-section]').forEach(function (nav) { nav.classList.remove('active'); });
      const targetNav = document.querySelector('[data-section="create-prescription"]');
      if (targetNav) targetNav.classList.add('active');
      document.querySelectorAll('.dashboard-section').forEach(function (section) { section.classList.remove('active'); });
      const createSection = document.getElementById('create-prescription');
      if (createSection) createSection.classList.add('active');
      if (patientIdInput) {
        patientIdInput.value = patientId;
        patientIdInput.dispatchEvent(new Event('blur'));
      }
      showNotification(`Creating prescription for ${patientId}`, 'info');
    };
    window.viewPrescription = function () { showNotification('Opening prescription details...', 'info'); };
    window.editPrescription = function () { showNotification('Opening prescription editor...', 'info'); };
  }

  async function initPharmaDashboard() {
    const tableBody = document.getElementById('pharmaPrescriptionsTableBody');
    const pendingGrid = document.getElementById('pharmaPendingOrders');
    const completedGrid = document.getElementById('pharmaCompletedOrders');

    window.processOrder = async function(id) {
      showNotification('Processing order...', 'info');
      try {
        await apiCall(`/prescriptions/${id}/status`, 'PATCH', { status: 'processing' });
        showNotification('Order is now processing!', 'success');
        loadPharmaPrescriptions();
      } catch (error) {
        showNotification(error.message || 'Failed to update order', 'error');
      }
    };

    window.completeOrder = async function(id) {
      showNotification('Completing order...', 'info');
      try {
        await apiCall(`/prescriptions/${id}/status`, 'PATCH', { status: 'completed' });
        showNotification('Order completed!', 'success');
        loadPharmaPrescriptions();
      } catch (error) {
        showNotification(error.message || 'Failed to complete order', 'error');
      }
    };

    window.generateBill = function(billId) {
      showNotification(`Generating receipt for ${billId}...`, 'info');
      setTimeout(() => showNotification('Receipt sent to patient dashboard!', 'success'), 1500);
    };

    async function loadPharmaPrescriptions() {
      try {
        const prescriptions = await apiCall('/prescriptions');
        
        if (tableBody) {
          tableBody.innerHTML = '';
          if (prescriptions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No prescriptions found</td></tr>';
          } else {
            prescriptions.forEach(rx => {
              const medsList = rx.medications.map(m => m.name).join(', ');
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td>
                  <div class="test-info">
                    <i class="fas fa-user"></i>
                    <div>
                      <strong>${rx.patient && rx.patient.user ? rx.patient.user.fullName : 'Unknown'}</strong>
                      <p>${rx.patient ? rx.patient.patientId : 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td>${rx.doctor ? rx.doctor.fullName : 'Dr. Unknown'}</td>
                <td>${new Date(rx.createdAt).toLocaleDateString()}</td>
                <td>${medsList}</td>
                <td><span class="status-badge ${rx.status === 'completed' ? 'completed' : (rx.status === 'processing' ? 'processing' : 'pending')}">${rx.status}</span></td>
                <td>
                  ${rx.status === 'pending_pharma' ? `<button class="btn-icon" onclick="processOrder('${rx._id}')"><i class="fas fa-check"></i></button>` : ''}
                  ${rx.status === 'processing' ? `<button class="btn-icon" onclick="completeOrder('${rx._id}')"><i class="fas fa-check-double"></i></button>` : ''}
                  <button class="btn-icon" onclick="showNotification('Opening prescription ${rx._id}', 'info')"><i class="fas fa-eye"></i></button>
                </td>
              `;
              tableBody.appendChild(tr);
            });
          }
        }

        if (pendingGrid) {
          pendingGrid.innerHTML = '';
          const pending = prescriptions.filter(rx => rx.status !== 'completed');
          if (pending.length === 0) {
            pendingGrid.innerHTML = '<p style="padding: 1rem; text-align: center;">No pending orders</p>';
          } else {
            pending.forEach(rx => {
              const div = document.createElement('div');
              div.className = 'prescription-item';
              div.innerHTML = `
                <div class="prescription-icon"><i class="fas fa-pills"></i></div>
                <div class="prescription-details">
                  <h4>${rx.patient && rx.patient.user ? rx.patient.user.fullName : 'Unknown'} - ${rx.patient ? rx.patient.patientId : ''}</h4>
                  <p>${rx.medications.length} medications | ${rx.doctor ? rx.doctor.fullName : ''}</p>
                  <span class="date">Received: ${new Date(rx.createdAt).toLocaleDateString()}</span>
                </div>
                ${rx.status === 'pending_pharma' ? `<button class="btn-3d btn-small btn-primary" onclick="processOrder('${rx._id}')">Process</button>` : ''}
                ${rx.status === 'processing' ? `<button class="btn-3d btn-small btn-secondary" onclick="completeOrder('${rx._id}')">Complete</button>` : ''}
              `;
              pendingGrid.appendChild(div);
            });
          }
        }

        if (completedGrid) {
          completedGrid.innerHTML = '';
          const completed = prescriptions.filter(rx => rx.status === 'completed');
          if (completed.length === 0) {
            completedGrid.innerHTML = '<p style="padding: 1rem; text-align: center;">No completed orders</p>';
          } else {
            completed.slice(0, 5).forEach(rx => {
              const div = document.createElement('div');
              div.className = 'prescription-item';
              div.innerHTML = `
                <div class="prescription-icon"><i class="fas fa-check"></i></div>
                <div class="prescription-details">
                  <h4>${rx.patient && rx.patient.user ? rx.patient.user.fullName : 'Unknown'} - ${rx.patient ? rx.patient.patientId : ''}</h4>
                  <p>${rx.medications.length} medications | Dispensed</p>
                  <span class="date">Completed: ${new Date(rx.createdAt).toLocaleDateString()}</span>
                </div>
                <span class="badge badge-primary">Done</span>
              `;
              completedGrid.appendChild(div);
            });
          }
        }
      } catch (error) {
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error loading prescriptions</td></tr>';
      }
    }

    if (tableBody) {
      loadPharmaPrescriptions();
    }
  }

  async function initReceptionDashboard() {
    const patientsTableBody = document.getElementById('patientsTableBody');
    const patientForm = document.getElementById('patientForm');

    // Fetch and display patients
    async function loadPatients() {
      if (!patientsTableBody) return;
      try {
        const patients = await apiCall('/patients');
        patientsTableBody.innerHTML = '';
        if (patients.length === 0) {
          patientsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No patients found</td></tr>';
          return;
        }

        patients.forEach(patient => {
          const user = patient.user || {};
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>
                <div class="test-info">
                    <i class="fas fa-user"></i>
                    <div>
                        <strong>${user.fullName || 'N/A'}</strong>
                        <p>Gender: ${patient.gender || 'N/A'}</p>
                    </div>
                </div>
            </td>
            <td>${patient.patientId || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${new Date(patient.createdAt || Date.now()).toLocaleDateString()}</td>
            <td>
                <button class="btn-icon" onclick="showNotification('View/Edit patient ${patient.patientId}', 'info')"><i class="fas fa-edit"></i></button>
            </td>
          `;
          patientsTableBody.appendChild(row);
        });
      } catch (error) {
        showNotification(error.message || 'Failed to load patients', 'error');
        patientsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading patients</td></tr>';
      }
    }

    // Handle patient registration
    if (patientForm) {
      patientForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const gender = document.getElementById('gender').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const dob = document.getElementById('age').value; // We mapped age to dob in the UI for simplicity, backend accepts dob

        // Calculate an approximate DOB from age if user inputs age
        let dobString = new Date();
        dobString.setFullYear(dobString.getFullYear() - parseInt(dob, 10));
        
        const submitBtn = patientForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        
        try {
          // Register patient via auth route (which creates user and patient)
          const data = await apiCall('/auth/register', 'POST', {
            fullName,
            phone,
            password: phone, // Default password is phone number
            gender,
            dob: dobString.toISOString().split('T')[0],
            address
          });
          
          showNotification(`Patient registered successfully! ID: ${data.patient.patientId}`, 'success');
          patientForm.reset();
          loadPatients(); // Refresh table
        } catch (error) {
          showNotification(error.message || 'Failed to register patient', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Patient ID';
        }
      });
    }

    loadPatients();
  }

  function initLabsDashboard() {
    async function loadLabOrders() {
      try {
        const labOrders = await apiCall('/labs/all', 'GET');
        
        const testOrdersTbody = document.querySelector('#test-orders tbody');
        const reportsContainer = document.querySelector('#reports .card-body');
        
        if (testOrdersTbody) testOrdersTbody.innerHTML = '';
        if (reportsContainer) reportsContainer.innerHTML = '';
        
        let pendingCount = 0;
        let completedCount = 0;

        labOrders.forEach(order => {
          const patientName = order.patient && order.patient.user ? order.patient.user.fullName : 'Unknown Patient';
          const patientIdStr = order.patient ? order.patient.patientId : 'N/A';
          const doctorName = order.doctor ? order.doctor.fullName : 'Unknown Doctor';
          const testsList = order.testsOrdered.join(', ');

          if (order.status === 'pending_lab') {
            pendingCount++;
            if (testOrdersTbody) {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td><div class="test-info"><i class="fas fa-user"></i><div><strong>${patientName}</strong><p>${patientIdStr}</p></div></div></td>
                <td>${doctorName}</td>
                <td>${testsList}</td>
                <td><span class="badge badge-warning">Standard</span></td>
                <td><span class="status-badge pending">Pending</span></td>
                <td>
                  <button class="btn-icon" onclick="prepareUpload('${order._id}', '${patientIdStr}', '${testsList}')"><i class="fas fa-upload"></i></button>
                </td>
              `;
              testOrdersTbody.appendChild(tr);
            }
          } else if (order.status === 'completed') {
            completedCount++;
            if (reportsContainer) {
              const reportHtml = `
                <div class="prescription-item">
                  <div class="prescription-icon"><i class="fas fa-file-medical"></i></div>
                  <div class="prescription-details">
                    <h4>${patientName} - ${testsList}</h4>
                    <p>Completed: ${new Date(order.updatedAt).toLocaleDateString()}</p>
                    <span class="date">Order ID: ${order._id.substring(0, 8)}</span>
                  </div>
                  <button class="btn-icon" onclick="showNotification('Downloading report...', 'success')"><i class="fas fa-download"></i></button>
                </div>
              `;
              reportsContainer.insertAdjacentHTML('beforeend', reportHtml);
            }
          }
        });

        // Update stats
        const statCards = document.querySelectorAll('.stat-info h3');
        if (statCards.length >= 3) {
          statCards[0].textContent = pendingCount + completedCount; // Total (simplified)
          statCards[1].textContent = pendingCount;
          statCards[2].textContent = completedCount;
        }

      } catch (error) {
        console.error('Error loading lab orders:', error);
        showNotification('Failed to load lab orders', 'error');
      }
    }

    window.prepareUpload = function(orderId, patientId, testName) {
      document.querySelectorAll('.nav-item[data-section]').forEach(nav => nav.classList.remove('active'));
      const uploadNav = document.querySelector('[data-section="upload"]');
      if (uploadNav) uploadNav.classList.add('active');
      
      document.querySelectorAll('.dashboard-section').forEach(section => section.classList.remove('active'));
      const uploadSection = document.getElementById('upload');
      if (uploadSection) uploadSection.classList.add('active');

      const pIdInput = document.getElementById('patientId');
      if (pIdInput) pIdInput.value = patientId;

      const uploadForm = document.getElementById('uploadForm');
      if (uploadForm) {
        uploadForm.dataset.orderId = orderId;
      }
      
      showNotification('Ready to upload report', 'info');
    };

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
      uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const orderId = uploadForm.dataset.orderId;
        
        if (!orderId) {
          showNotification('Please select a pending test order first to upload a report.', 'error');
          return;
        }

        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        }

        try {
          // Simulate file upload delay, then update status
          await apiCall(`/labs/${orderId}`, 'PATCH', { status: 'completed', reportFileUrl: 'mock_url_path.pdf' });
          showNotification('Report uploaded and sent to patient successfully!', 'success');
          
          uploadForm.reset();
          uploadForm.dataset.orderId = '';
          const filePreview = document.getElementById('filePreview');
          if (filePreview) filePreview.innerHTML = '';
          
          loadLabOrders(); // Refresh lists
        } catch (error) {
          showNotification(error.message || 'Failed to upload report', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send to Patient';
          }
        }
      });
    }

    loadLabOrders();
  }

  async function initAdminDashboard() {
    const staffTableBody = document.getElementById('adminStaffTableBody');
    const staffForm = document.getElementById('staffForm');

    window.editStaff = function(staffId) {
      showNotification(`Editing staff: ${staffId}`, 'info');
    };

    window.generateReport = function(type) {
      showNotification(`Generating ${type} report...`, 'info');
      setTimeout(() => showNotification('Report downloaded successfully!', 'success'), 1500);
    };

    async function loadStaff() {
      if (!staffTableBody) return;
      try {
        const staff = await apiCall('/staff');
        staffTableBody.innerHTML = '';
        if (staff.length === 0) {
          staffTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No staff found</td></tr>';
          return;
        }

        const icons = { doctor: 'fa-user-md', reception: 'fa-concierge-bell', pharma: 'fa-pills', labs: 'fa-flask', admin: 'fa-user-shield' };

        staff.forEach(member => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <div class="test-info">
                <i class="fas ${icons[member.role] || 'fa-user'}"></i>
                <div>
                  <strong>${member.fullName}</strong>
                  <p>${member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
                </div>
              </div>
            </td>
            <td>${member.role.charAt(0).toUpperCase() + member.role.slice(1)}</td>
            <td>${member.staffId || 'N/A'}</td>
            <td><span class="status-badge completed">Active</span></td>
            <td>
              <button class="btn-icon" onclick="editStaff('${member.staffId}')"><i class="fas fa-edit"></i></button>
            </td>
          `;
          staffTableBody.appendChild(tr);
        });
      } catch (error) {
        staffTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading staff</td></tr>';
      }
    }

    if (staffForm) {
      staffForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const role = document.getElementById('staffRole').value;
        const fullName = document.getElementById('staffName') ? document.getElementById('staffName').value : 'New Staff';
        const submitBtn = staffForm.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        try {
          const data = await apiCall('/staff', 'POST', {
            fullName,
            role,
            password: 'password123'
          });
          
          showNotification(`Staff account created successfully! ID: ${data.staffId}`, 'success');
          staffForm.reset();
          loadStaff();
        } catch (error) {
          showNotification(error.message || 'Failed to create staff account', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
      });
    }

    if (staffTableBody) {
      loadStaff();
    }
  }

  injectNotificationStyles();
  window.showNotification = showNotification;
  window.apiCall = apiCall;

  if (document.getElementById('mainWebsite')) initMainPage();
  if (document.getElementById('registrationForm') || document.getElementById('loginForm') || document.getElementById('otpForm')) initAuth();
  if (document.getElementById('sidebar') && document.querySelector('.nav-item[data-section]')) initSharedDashboardNav();
  if (document.getElementById('prescriptionModal') && document.getElementById('detailMedical')) initPatientDashboard();
  if (document.getElementById('prescriptionForm') && !document.getElementById('uploadForm')) initDoctorDashboard();
  if (document.getElementById('uploadForm') && document.getElementById('reportFile')) initLabsDashboard();
  if (document.getElementById('patientForm') && document.getElementById('patientsTableBody')) initReceptionDashboard();
  if (document.getElementById('pharmaPrescriptionsTableBody')) initPharmaDashboard();
  if (document.getElementById('adminStaffTableBody')) initAdminDashboard();
})();
