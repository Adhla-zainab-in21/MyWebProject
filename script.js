// 1. Core Logic (Runs everywhere)
document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Check & Apply ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Smooth Anchor Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            } else if (window.location.pathname.indexOf('index.html') === -1) {
                // If on another page and link is #services, go to index.html#services
                window.location.href = 'index.html' + targetId;
            }
        });
    });

    // --- Animations (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    const services = document.querySelectorAll('.service-card');
    services.forEach((service, index) => {
        service.style.opacity = 0;
        service.style.transform = 'translateY(50px)';
        service.style.transitionDelay = `${index * 100}ms`;
        observer.observe(service);
    });

    // --- Booking Logic Initialization (Only if Modal Exists) ---
    initBookingLogic();
});


/* --- Theme Toggle Function (Global) --- */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}


/* --- Booking Wizard Logic (Safeguarded) --- */
let selectedServices = new Map(); // Stores { "Service Name" => Price }
let currentStep = 1;
let modal, closeBtn;

function initBookingLogic() {
    modal = document.getElementById('bookingModal');
    closeBtn = document.querySelector('.close-modal');

    // Only proceed if modal exists (Home Page)
    if (!modal) return;

    // Attach Close Listeners
    if (closeBtn) closeBtn.onclick = closeModal;

    window.onclick = function (event) {
        if (event.target == modal) {
            closeModal();
        }
    }
}

// Toggle Service Selection
function toggleService(cardElement, name, price) {
    if (selectedServices.has(name)) {
        selectedServices.delete(name);
        cardElement.classList.remove('selected');
    } else {
        selectedServices.set(name, price);
        cardElement.classList.add('selected');
    }
    updateFloatingBar();
}

function updateFloatingBar() {
    const bar = document.getElementById('floating-book-bar');
    if (!bar) return;

    if (selectedServices.size > 0) {
        bar.classList.add('visible');

        // Calculate Total
        let total = 0;
        selectedServices.forEach(price => total += price);

        document.getElementById('selected-count').textContent = `${selectedServices.size} Service${selectedServices.size > 1 ? 's' : ''} Selected`;
        document.getElementById('selected-total').textContent = 'LKR ' + total.toLocaleString();
    } else {
        bar.classList.remove('visible');
    }
}

// Open Modal (Global, but checks init)
function openBooking() {
    if (!modal || selectedServices.size === 0) return;

    currentStep = 1;
    showStep(1);

    const dateInput = document.getElementById('booking-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    // Generate Summary List
    const summaryList = document.getElementById('modal-service-summary');
    if (summaryList) {
        summaryList.innerHTML = '';
        let total = 0;
        selectedServices.forEach((price, name) => {
            total += price;
            const item = document.createElement('div');
            item.className = 'summary-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.marginBottom = '5px';
            item.style.borderBottom = '1px solid #eee';
            item.style.paddingBottom = '5px';

            item.innerHTML = `
                <span style="font-size:0.9rem">${name}</span>
                <span style="font-weight:600; font-size:0.9rem">LKR ${price.toLocaleString()}</span>
            `;
            summaryList.appendChild(item);
        });

        const totalEl = document.getElementById('modal-total-price');
        if (totalEl) totalEl.textContent = 'LKR ' + total.toLocaleString();
    }

    modal.style.display = 'flex';
}

function closeModal() {
    if (modal) modal.style.display = 'none';
}

function nextStep(step) {
    if (step === 2) {
        const dateInput = document.getElementById('booking-date');
        if (dateInput && !dateInput.value) {
            alert("Please select a date.");
            return;
        }
    }
    currentStep = step;
    showStep(step);
}

function prevStep(step) {
    currentStep = step;
    showStep(step);
}

function showStep(step) {
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('step' + step);
    if (target) target.classList.add('active');
}

function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));

    // Safely handle event target
    const target = event.target.closest('.payment-option');
    if (target) target.classList.add('selected');

    const cardDetails = document.getElementById('card-details');
    if (cardDetails) {
        cardDetails.style.display = method === 'card' ? 'block' : 'none';
    }
}

function generateInvoice() {
    const pName = document.getElementById('patient-name');
    const pDate = document.getElementById('booking-date');
    const pMethod = document.querySelector('input[name="payment"]:checked');

    if (!pName || !pDate || !pMethod) return;

    const nameVal = pName.value;
    const dateVal = pDate.value;
    const methodVal = pMethod.value;

    // Calculate Totals
    let subTotal = 0;
    let serviceNames = [];
    selectedServices.forEach((price, name) => {
        subTotal += price;
        serviceNames.push(name);
    });

    const tax = subTotal * 0.05;
    const total = subTotal + tax;
    const combinedServices = serviceNames.join(', ');

    const invId = '#INV-' + Math.floor(Math.random() * 10000);

    const setObj = {
        'invoice-id': invId,
        'summ-invoice-id': invId,
        'summ-name': nameVal,
        'summ-service': combinedServices.length > 30 ? combinedServices.substring(0, 30) + '...' : combinedServices, // Truncate for display
        'summ-code': Math.floor(1000 + Math.random() * 9000), // Random 4-digit code
        'summ-date': dateVal,
        'summ-price': 'LKR ' + subTotal.toLocaleString(),
        'summ-tax': 'LKR ' + tax.toLocaleString(),
        'summ-total': 'LKR ' + total.toLocaleString()
    };

    for (const [id, txt] of Object.entries(setObj)) {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    }

    const stamp = document.getElementById('paid-stamp');
    if (stamp) {
        if (methodVal === 'card') {
            stamp.innerText = 'PAID';
            stamp.style.color = 'var(--success)';
            stamp.style.borderColor = 'var(--success)';
        } else {
            stamp.innerText = 'PAY AT LAB';
            stamp.style.color = 'var(--warning)';
            stamp.style.borderColor = 'var(--warning)';
        }

    }

    // --- Send to Backend API ---
    fetch('api/book_test.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: setObj['invoice-id'],
            verificationCode: setObj['summ-code'], // Send Verification Code
            patientName: nameVal,
            patientEmail: document.getElementById('patient-email')?.value, // Add email capture
            patientPhone: document.getElementById('patient-phone')?.value, // Add phone capture
            patientAge: document.getElementById('patient-age')?.value,
            patientGender: document.getElementById('patient-gender')?.value,
            patientAddress: document.getElementById('patient-address')?.value,
            testType: combinedServices, // Send all services as string
            price: total, // Send Final Total
            paymentMethod: methodVal,
            date: dateVal // Assuming YYYY-MM-DD from input type="date"
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Booking saved to database');
            } else {
                console.error('Error saving booking:', data.message);
                // Show the ACTUAL error message from the server
                alert(`Server Error: ${data.message}\n\nPlease show receipt at lab.`);
            }
        })
        .catch(error => {
            console.error('Network Error:', error);
            alert('Network Error: Could not connect to server. Please ensure XAMPP is running.');
        });

    nextStep(4);
}
