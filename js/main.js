// Golf News - Main JavaScript
// Form validation, scroll animations, and user interactions

(function() {
    'use strict';

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initEmailForm();
        initContactForm();
        initScrollAnimations();
    });

    /**
     * Initialize Scroll Animations with Intersection Observer
     */
    function initScrollAnimations() {
        // Check if browser supports Intersection Observer
        if (!('IntersectionObserver' in window)) {
            // Fallback: just show all elements
            document.querySelectorAll('.fade-in-scroll').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionally unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with fade-in-scroll class
        document.querySelectorAll('.fade-in-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Initialize Email Signup Form with Secure Serverless Function
     */
    function initEmailForm() {
        const emailForm = document.getElementById('emailForm');
        if (!emailForm) return;

        emailForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            const resultElement = document.getElementById('emailResult');

            // Validate email
            if (!validateEmail(email)) {
                showError(emailInput, 'Please enter a valid email address');
                return false;
            }

            // Clear any previous errors
            clearError(emailInput);

            // Disable submit button
            const submitButton = emailForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Subscribing...';

            try {
                // Submit to Vercel serverless function
                // This keeps your API key secure on the server
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });

                const data = await response.json();

                if (data.success) {
                    showEmailResult(resultElement, data.message || 'Success! You\'ve been added to our launch list.', 'success');
                    emailForm.reset();
                } else {
                    showEmailResult(resultElement, data.error || 'Oops! Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                showEmailResult(resultElement, 'Network error. Please check your connection and try again.', 'error');
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });

        // Real-time validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !validateEmail(email)) {
                    showError(this, 'Please enter a valid email address');
                } else {
                    clearError(this);
                }
            });

            emailInput.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    clearError(this);
                }
            });
        }
    }

    /**
     * Show result message for email signup
     */
    function showEmailResult(element, message, type) {
        element.textContent = message;
        element.className = `form-result ${type}`;
        element.style.display = 'block';

        // Scroll to result
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide message after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    /**
     * Initialize Contact Form with Web3Forms
     */
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('contact-email');
            const messageInput = document.getElementById('message');
            const resultElement = document.getElementById('contactResult');

            // Validate inputs
            let isValid = true;

            if (!nameInput.value.trim()) {
                showError(nameInput, 'Name is required');
                isValid = false;
            } else {
                clearError(nameInput);
            }

            if (!validateEmail(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(emailInput);
            }

            if (!messageInput.value.trim()) {
                showError(messageInput, 'Message is required');
                isValid = false;
            } else {
                clearError(messageInput);
            }

            if (!isValid) return;

            // Disable submit button
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            // Submit form via serverless function (keeps API key secure)
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        message: messageInput.value.trim()
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showResult(resultElement, 'Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                } else {
                    showResult(resultElement, data.error || 'Oops! Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                showResult(resultElement, 'Network error. Please check your connection and try again.', 'error');
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });

        // Real-time validation for contact form fields
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('contact-email');
        const messageInput = document.getElementById('message');

        [nameInput, emailInput, messageInput].forEach(input => {
            if (!input) return;

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    clearError(this);
                }
            });

            input.addEventListener('blur', function() {
                const value = this.value.trim();
                if (!value) {
                    showError(this, `${this.name.charAt(0).toUpperCase() + this.name.slice(1)} is required`);
                } else if (this.type === 'email' && !validateEmail(value)) {
                    showError(this, 'Please enter a valid email address');
                } else {
                    clearError(this);
                }
            });
        });
    }

    /**
     * Validate email format
     */
    function validateEmail(email) {
        return emailRegex.test(email);
    }

    /**
     * Show error message for input field
     */
    function showError(input, message) {
        input.classList.add('error');
        input.style.borderColor = '#D32F2F';

        // Remove existing error message
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#D32F2F';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.fontFamily = "'Inter', sans-serif";
        errorDiv.style.fontWeight = '500';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    /**
     * Clear error message from input field
     */
    function clearError(input) {
        input.classList.remove('error');
        input.style.borderColor = '';

        const errorMessage = input.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Show result message for contact form
     */
    function showResult(element, message, type) {
        element.textContent = message;
        element.className = `form-result ${type}`;
        element.style.display = 'block';

        // Scroll to result
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide message after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    /**
     * Smooth scroll for anchor links
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /**
     * Add ripple effect to buttons (enhancement)
     */
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

})();
