form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    
    const response = await fetch('/register', {
        method: 'POST',
        body: formData,
    });
    
    if (response.ok) {
        alert('Registration successful!');
        form.reset();
    } else {
        alert('Registration failed.');
    }
});
