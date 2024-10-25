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
        // Here you would typically send the data to your server
        // For demonstration, we'll store in localStorage
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'), // In real app, never store passwords in localStorage
            photoUrl: URL.createObjectURL(photo)
        };
                
        // Store user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
                
        alert('Registration successful!');
        form.reset();
    }
});