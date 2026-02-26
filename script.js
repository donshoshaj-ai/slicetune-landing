// ========================================
// SliceTune Landing Page - Main JavaScript
// ========================================

// ========================================
// CONFIGURATION - Formspree Integration
// ========================================
// Production Formspree endpoint for SliceTune waitlist
// Form ID: xykdogol
const FORM_ENDPOINT = 'https://formspree.io/f/xykdogol';

// ========================================
// Wait for DOM to be fully loaded
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initSmoothScrolling();
    initWaitlistForm();
});

// ========================================
// Smooth Scrolling for Anchor Links
// ========================================
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just '#'
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Waitlist Form Handling
// ========================================
function initWaitlistForm() {
    console.log('initWaitlistForm called');
    const form = document.getElementById('waitlist-form');
    const submitBtn = document.getElementById('submit-btn');
    const responseDiv = document.getElementById('form-response');
    
    console.log('Form element:', form);
    console.log('Submit button:', submitBtn);
    
    if (!form) return;
    
    // Form submit handler
    form.addEventListener('submit', async function(e) {
        console.log('Form submit event fired!');
        e.preventDefault();
        console.log('Default prevented');
        
        // Clear previous status
        hideFormResponse();
        
        // Check honeypot (spam protection)
        const honeypot = document.getElementById('bot-field');
        if (honeypot && honeypot.value) {
            // Silent fail for bots
            showFormResponse('success', 'Thank you for joining!');
            form.reset();
            return;
        }
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Prepare form data
        const formData = {
            email: document.getElementById('email').value.trim(),
            printerModel: document.getElementById('printer-model').value,
            printUse: document.getElementById('print-use').value,
            biggestIssue: document.getElementById('biggest-issue').value.trim(),
            printFrequency: document.getElementById('print-frequency').value,
            timestamp: new Date().toISOString()
        };
        
        // Set submitting state
        setSubmittingState(true);
        
        // Submit to endpoint
        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                // Success
                showFormResponse('success', 'Thank you for joining!');
                form.reset();
                clearAllErrors();
                
                // Optional: Track signup event
                // trackWaitlistSignup(formData);
            } else {
                // Server error
                throw new Error('Server returned an error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormResponse('error', 'Something went wrong. Please try again or email us directly.');
        } finally {
            setSubmittingState(false);
        }
    });
    
    // Clear errors on input
    const fields = ['email', 'printer-model', 'print-use', 'print-frequency'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                clearFieldError(fieldId);
            });
            field.addEventListener('change', function() {
                clearFieldError(fieldId);
            });
        }
    });
}

// ========================================
// Form Validation
// ========================================
function validateForm() {
    let isValid = true;
    
    // Clear all previous errors
    clearAllErrors();
    
    // Email validation
    const email = document.getElementById('email');
    const emailValue = email.value.trim();
    if (!emailValue) {
        setFieldError('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        setFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Printer model validation
    const printerModel = document.getElementById('printer-model');
    if (!printerModel.value) {
        setFieldError('printer-model', 'Please select your printer model');
        isValid = false;
    }
    
    // Print use validation
    const printUse = document.getElementById('print-use');
    if (!printUse.value) {
        setFieldError('print-use', 'Please select how you print');
        isValid = false;
    }
    
    // Print frequency validation
    const printFrequency = document.getElementById('print-frequency');
    if (!printFrequency.value) {
        setFieldError('print-frequency', 'Please select print frequency');
        isValid = false;
    }
    
    return isValid;
}

// ========================================
// Email Validation Helper
// ========================================
function isValidEmail(email) {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// UI State Helpers
// ========================================
function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}-error`);
    
    if (field) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        
        if (errorSpan) {
            errorSpan.textContent = message;
            field.setAttribute('aria-describedby', `${fieldId}-error`);
        }
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}-error`);
    
    if (field) {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }
    
    if (errorSpan) {
        errorSpan.textContent = '';
    }
}

function clearAllErrors() {
    const fields = ['email', 'printer-model', 'print-use', 'print-frequency'];
    fields.forEach(fieldId => {
        clearFieldError(fieldId);
    });
}

function setSubmittingState(isSubmitting) {
    const submitBtn = document.getElementById('submit-btn');
    
    if (!submitBtn) return;
    
    if (isSubmitting) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn--loading');
        submitBtn.setAttribute('aria-busy', 'true');
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn--loading');
        submitBtn.removeAttribute('aria-busy');
    }
}

function showFormResponse(type, message) {
    const responseDiv = document.getElementById('form-response');
    
    if (!responseDiv) return;
    
    // Clear previous classes
    responseDiv.className = 'form__response';
    
    // Add appropriate class
    if (type === 'success') {
        responseDiv.classList.add('form__response--success');
    } else if (type === 'error') {
        responseDiv.classList.add('form__response--error');
    }
    
    // Set message and show
    responseDiv.textContent = message;
    responseDiv.style.display = 'block';
    
    // Scroll to response smoothly
    setTimeout(() => {
        responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function hideFormResponse() {
    const responseDiv = document.getElementById('form-response');
    if (responseDiv) {
        responseDiv.style.display = 'none';
        responseDiv.textContent = '';
        responseDiv.className = 'form__response';
    }
}

// ========================================
// TODO: Analytics Tracking (Optional)
// ========================================
// function trackWaitlistSignup(formData) {
//     // Example: Google Analytics
//     // gtag('event', 'waitlist_signup', {
//     //     'printer_model': formData.printerModel,
//     //     'print_use': formData.printUse
//     // });
//     
//     // Example: Custom analytics
//     // analytics.track('Waitlist Signup', {
//     //     printerModel: formData.printerModel,
//     //     printUse: formData.printUse,
//     //     printFrequency: formData.printFrequency
//     // });
// }
