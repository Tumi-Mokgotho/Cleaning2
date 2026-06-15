// script.js
// ========== WAIT FOR DOM TO LOAD ==========
document.addEventListener('DOMContentLoaded', function() {
  initFaqAccordion();
  initDatePicker();
  initQuoteForm();
  initMobileMenu();
  initSmoothScrolling();
  initActiveNavHighlight();
  initScrollAnimations();
});

// ========== FAQ ACCORDION ==========
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });
}

// ========== DATE PICKER ==========
function initDatePicker() {
  const dateInput = document.getElementById('serviceDate');
  if (!dateInput) return;

  flatpickr(dateInput, {
    dateFormat: "Y-m-d",
    altFormat: "F j, Y",
    altInput: true,
    minDate: "today",
    maxDate: new Date().fp_incr(90),
    disableMobile: "true",
    placeholder: "Preferred cleaning date",
    onChange: function(selectedDates, dateStr) {
      if (dateStr) {
        dateInput.parentElement.classList.add('selected');
      }
    }
  });
}

// ========== WHATSAPP INTEGRATION ==========
const OWNER_WHATSAPP = "27796499879";

function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '27' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('27') && cleaned.length === 9) {
    cleaned = '27' + cleaned;
  }
  return cleaned;
}

function sendWhatsAppMessage(number, message) {
  const formatted = formatPhoneNumber(number);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${formatted}?text=${encoded}`, '_blank');
}

function sendCustomerConfirmation(data) {
  const message = `*SparkClean - Booking Confirmation*

Hi ${data.name} 👋

Thank you for requesting a quote!

*Your Details:*
• Service: ${data.service}
• Preferred Date: ${data.date || 'To be confirmed'}
• Phone: ${data.phone}

We'll contact you within 5 hours with a custom quote via WhatsApp.

Need help? Reply to this chat.

SparkClean Team ✨`;

  sendWhatsAppMessage(data.phone, message);
}

function sendOwnerNotification(data) {
  const message = `*NEW QUOTE REQUEST* 🔥

Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email || 'Not provided'}
Service: ${data.service}
Date: ${data.date || 'Not specified'}

Please respond within 5 hours.
SparkClean System`;

  sendWhatsAppMessage(OWNER_WHATSAPP, message);
}

// ========== QUOTE FORM ==========
function initQuoteForm() {
  const form = document.getElementById('quoteForm');
  const submitBtn = document.getElementById('submitBtn');
  const msgDiv = document.getElementById('quoteMessage');

  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('serviceType').value;
    const dateInput = document.getElementById('serviceDate');
    const date = dateInput._flatpickr ? dateInput._flatpickr.selectedDates[0] ? 
                 dateInput._flatpickr.input.value : '' : '';

    if (!name) return showMessage('Please enter your full name', 'error', msgDiv);
    if (!phone) return showMessage('Please enter your WhatsApp number', 'error', msgDiv);
    if (!service) return showMessage('Please select a service', 'error', msgDiv);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      return showMessage('Please enter a valid phone number', 'error', msgDiv);
    }

    showLoading(true, submitBtn);

    const customerData = { name, email, phone, service, date };

    try {
      sendCustomerConfirmation(customerData);
      await new Promise(r => setTimeout(r, 700));
      sendOwnerNotification(customerData);

      showMessage(`
        <strong>✅ Request Sent Successfully!</strong><br><br>
        A confirmation has been sent to your WhatsApp.<br>
        We'll reply with your custom quote within 5 hours.
      `, 'success', msgDiv);

      form.reset();
      if (dateInput._flatpickr) dateInput._flatpickr.clear();

    } catch (err) {
      console.error(err);
      showMessage('⚠️ Something went wrong. Please try again or WhatsApp us directly.', 'error', msgDiv);
    } finally {
      showLoading(false, submitBtn);
    }
  });
}

function showMessage(html, type, msgDiv) {
  if (!msgDiv) return;
  msgDiv.innerHTML = html;
  msgDiv.className = `quote-message ${type}-message`;
  
  if (type === 'success') {
    setTimeout(() => {
      msgDiv.innerHTML = '';
      msgDiv.className = 'quote-message';
    }, 12000);
  }
}

function showLoading(isLoading, btn) {
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-paper-plane"></i> Request Quote`;
  }
}

// ========== NAVIGATION & UX ==========
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav?.classList.contains('active')) {
          mobileNav.classList.remove('active');
        }
      }
    });
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    const icon = toggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });
}

function initActiveNavHighlight() {
  const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
  const elements = document.querySelectorAll('.service-card, .price-card, .why-item, .before-after-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    observer.observe(el);
  });
}