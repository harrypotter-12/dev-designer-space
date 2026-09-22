/**
 * Contact Form Handler
 * Handles form submission with validation and AJAX
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.querySelector('#contact-form button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : 'Send Message';

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    async function handleContactFormSubmit(event) {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Client-side validation
        if (!validateForm(data)) {
            return;
        }

        // Update button state
        setSubmitButtonState(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Contact API unavailable');
            }

            showMessage('Thank you! Your message has been sent successfully.', 'success');
            contactForm.reset();
        } catch (error) {
            const subject = encodeURIComponent('Portfolio message from ' + data.name);
            const body = encodeURIComponent(data.name + ' <' + data.email + '>\n\n' + data.message);
            window.location.href = 'mailto:jashanpreetkaur2904@gmail.com?subject=' + subject + '&body=' + body;
            showMessage('Your email app is opening with this message.', 'success');
            contactForm.reset();
        } finally {
            setSubmitButtonState(false);
        }
    }

    function validateForm(data) {
        // Clear previous errors
        clearErrors();

        let isValid = true;

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            showFieldError('name', 'Please enter a valid name (at least 2 characters)');
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            showFieldError('message', 'Please enter a message (at least 10 characters)');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        // Remove existing error
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error class to field
        field.classList.add('error');

        // Create and add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#ff4757';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';

        field.parentNode.appendChild(errorElement);
    }

    function clearErrors() {
        // Remove error classes
        document.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });

        // Remove error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });

        // Hide general message
        const messageContainer = document.getElementById('form-message');
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }

    function showMessage(message, type) {
        let messageContainer = document.getElementById('form-message');
        
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'form-message';
            contactForm.appendChild(messageContainer);
        }

        messageContainer.textContent = message;
        messageContainer.className = `form-message ${type}`;
        messageContainer.style.display = 'block';
        messageContainer.style.padding = '1rem';
        messageContainer.style.marginTop = '1rem';
        messageContainer.style.borderRadius = '0.5rem';
        messageContainer.style.textAlign = 'center';

        if (type === 'success') {
            messageContainer.style.backgroundColor = '#2ed573';
            messageContainer.style.color = 'white';
        } else {
            messageContainer.style.backgroundColor = '#ff4757';
            messageContainer.style.color = 'white';
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }

    function setSubmitButtonState(isLoading) {
        if (!submitButton) return;

        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            submitButton.style.opacity = '1';
        }
    }

    function playSound(soundId) {
        const audio = document.getElementById(soundId);
        if (audio) {
            try {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (error) {
                console.log('Audio error:', error);
            }
        }
    }

    // Add CSS for error styling
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: #ff4757 !important;
            box-shadow: 0 0 0 2px rgba(255, 71, 87, 0.2) !important;
        }
        
        .form-message {
            transition: all 0.3s ease;
        }
        
        .form-message.success {
            animation: slideInSuccess 0.3s ease;
        }
        
        .form-message.error {
            animation: slideInError 0.3s ease;
        }
        
        @keyframes slideInSuccess {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInError {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}); 