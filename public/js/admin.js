// admin.js - Admin panel functionality

document.addEventListener('DOMContentLoaded', function() {
    // Admin login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const mobile = formData.get('mobile');
        
        // Validate inputs
        let isValid = true;
        let errorMessage = '';
        
        if (!email || email.trim() === '') {
          isValid = false;
          errorMessage = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          isValid = false;
          errorMessage = 'Please enter a valid email';
        }
        
        if (!mobile || mobile.trim() === '') {
          isValid = false;
          errorMessage = errorMessage ? errorMessage + '<br>Mobile number is required' : 'Mobile number is required';
        }
        
        // Show error or submit form
        const errorContainer = document.getElementById('login-error');
        if (!isValid && errorContainer) {
          errorContainer.innerHTML = errorMessage;
          errorContainer.style.display = 'block';
          return;
        } else if (errorContainer) {
          errorContainer.style.display = 'none';
        }
        
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Logging in...';
        
        // Submit login request
        fetch('/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            mobile: mobile
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Redirect to dashboard
            window.location.href = '/admin/dashboard';
          } else {
            // Show error message
            if (errorContainer) {
              errorContainer.innerHTML = data.message || 'Invalid credentials';
              errorContainer.style.display = 'block';
            }
            
            // Reset button
            submitButton.disabled = false;
            submitButton.innerHTML = 'Login';
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          
          // Show error message
          if (errorContainer) {
            errorContainer.innerHTML = 'Login failed. Please try again.';
            errorContainer.style.display = 'block';
          }
          
          // Reset button
          submitButton.disabled = false;
          submitButton.innerHTML = 'Login';
        });
      });
    }
    
    // Order details toggle
    const orderToggles = document.querySelectorAll('.order-toggle');
    orderToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const orderId = this.getAttribute('data-order-id');
        const orderDetails = document.getElementById(`order-details-${orderId}`);
        
        if (orderDetails) {
          // Toggle visibility
          if (orderDetails.style.display === 'none' || orderDetails.style.display === '') {
            orderDetails.style.display = 'block';
            this.innerHTML = 'Hide Details &uarr;';
          } else {
            orderDetails.style.display = 'none';
            this.innerHTML = 'View Details &darr;';
          }
        }
      });
    });
    
    // Date range filter
    const dateFilterForm = document.getElementById('date-filter-form');
    if (dateFilterForm) {
      dateFilterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        // Validate dates
        if (!startDate || !endDate) {
          alert('Please select both start and end dates');
          return;
        }
        
        // Redirect with query parameters
        window.location.href = `/admin/dashboard?startDate=${startDate}&endDate=${endDate}`;
      });
      
      // Reset filter button
      const resetFilterButton = document.getElementById('reset-filter');
      if (resetFilterButton) {
        resetFilterButton.addEventListener('click', function() {
          window.location.href = '/admin/dashboard';
        });
      }
    }
    
    // Log out button
    const logoutButton = document.getElementById('admin-logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        fetch('/admin/logout', {
          method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = '/admin/login';
          }
        })
        .catch(error => {
          console.error('Logout error:', error);
        });
      });
    }
  });
  
  // Export orders to CSV
  function exportOrders() {
    // Get current filter parameters
    const urlParams = new URLSearchParams(window.location.search);
    const startDate = urlParams.get('startDate') || '';
    const endDate = urlParams.get('endDate') || '';
    
    // Redirect to export endpoint
    window.location.href = `/admin/export?startDate=${startDate}&endDate=${endDate}`;
  }