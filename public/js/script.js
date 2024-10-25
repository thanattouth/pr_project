// Form validation and submission
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
    const password = formData.get('password');
    if (password.length < 8) {
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
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Registration successful! Please login.');
                form.reset();
                // Optionally redirect to login page
                // window.location.href = '/login.html';
            } else {
                alert(result.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    }
});

// Login form handler (if you have a separate login form)
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Login successful!');
                // Redirect to dashboard or home page
                // window.location.href = '/dashboard.html';
            } else {
                alert(result.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
}