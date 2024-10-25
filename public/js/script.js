const form = document.getElementById('registrationForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset errors
    document.querySelectorAll('.error').forEach(error => error.style.display = 'none');
    
    // Get form data
    const formData = new FormData(form);
    
    // Validate form
    let isValid = true;
    
    // Username validation
    if (formData.get('username').length < 3) {
        document.getElementById('usernameError').style.display = 'block';
        isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.get('email'))) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }
    
    // Password validation
    if (formData.get('password').length < 8) {
        document.getElementById('passwordError').style.display = 'block';
        isValid = false;
    }
    
    // Photo validation
    const photo = formData.get('photo');
    if (!photo || !photo.type.startsWith('image/')) {
        document.getElementById('photoError').style.display = 'block';
        isValid = false;
    }
    
    if (isValid) {
        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData // FormData automatically sets the correct Content-Type
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Registration successful!');
                form.reset();
            } else {
                alert(result.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    }
});