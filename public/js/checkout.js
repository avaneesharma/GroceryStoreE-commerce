// checkout.js - Checkout page functionality

document.addEventListener('DOMContentLoaded', function() {
  const checkoutForm = document.getElementById('checkout-form');
  
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Validate form
      if (validateCheckoutForm()) {
        // Submit form if validation passes
        submitCheckout();
      }
    });
    
    // Add input validation on blur
    const inputs = checkoutForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateInput(this);
      });
    });
  }
});

// Validate checkout form
function validateCheckoutForm() {
  const form = document.getElementById('checkout-form');
  let isValid = true;
  
  // Customer name validation
  const nameInput = form.querySelector('input[name="customerName"]');
  if (!validateInput(nameInput)) {
    isValid = false;
  }
  
  // Email validation
  const emailInput = form.querySelector('input[name="email"]');
  if (!validateInput(emailInput)) {
    isValid = false;
  }
  
  // Mobile validation
  const mobileInput = form.querySelector('input[name="mobile"]');
  if (!validateInput(mobileInput)) {
    isValid = false;
  }
  
  // Street address validation
  const streetInput = form.querySelector('input[name="street"]');
  if (!validateInput(streetInput)) {
    isValid = false;
  }
  
  // City validation
  const cityInput = form.querySelector('input[name="city"]');
  if (!validateInput(cityInput)) {
    isValid = false;
  }
  
  // State validation
  const stateSelect = form.querySelector('select[name="state"]');
  if (!validateInput(stateSelect)) {
    isValid = false;
  }
  
  // Postcode validation
  const postcodeInput = form.querySelector('input[name="postcode"]');
  if (!validateInput(postcodeInput)) {
    isValid = false;
  }
  
  return isValid;
}

// Validate individual input
function validateInput(input) {
  const value = input.value.trim();
  const name = input.name;
  let isValid = true;
  let errorMessage = '';
  
  // Clear previous error
  const errorElement = input.parentElement.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
  
  // Remove error class
  input.classList.remove('input-error');
  
  // Required field validation
  if (value === '') {
    isValid = false;
    errorMessage = 'This field is required';
  } else {
    // Specific validations based on input name
    switch (name) {
      case 'email':
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
        
      case 'mobile':
        // Australian mobile number validation (allowing formatting characters)
        const mobileRegex = /^(?:\+?61|0)[4](?:[ -]?[0-9]){8}$/;
        if (!mobileRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid Australian mobile number (starting with 04)';
        }
        break;
        
      case 'postcode':
        // Australian postcode validation
        const postcodeRegex = /^[0-9]{4}$/;
        if (!postcodeRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid 4-digit Australian postcode';
        }
        break;
        
      case 'street':
        // Simple street validation - just make sure it's not too short
        if (value.length < 5) {
          isValid = false;
          errorMessage = 'Please enter a complete street address';
        }
        break;
        
      case 'city':
        // City/suburb validation
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'Please enter a valid city or suburb';
        }
        break;
        
      case 'state':
        // State validation - already handled by required check
        break;
    }
  }
  
  // Show error message if validation failed
  if (!isValid) {
    input.classList.add('input-error');
    
    // Create error message element
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = errorMessage;
    error.style.color = '#dc3545';
    error.style.fontSize = '0.85em';
    error.style.marginTop = '5px';
    
    // Add error after the input
    input.parentElement.appendChild(error);
  }
  
  return isValid;
}

// Submit checkout form
function submitCheckout() {
  const form = document.getElementById('checkout-form');
  const formData = new FormData(form);
  const formObject = {};
  
  // Convert FormData to object
  formData.forEach((value, key) => {
    formObject[key] = value;
  });
  
  // Combine address fields into a single address string
  formObject.address = `${formObject.street}, ${formObject.city}, ${formObject.state} ${formObject.postcode}`;
  if (formObject.deliveryNotes) {
    formObject.address += `\nDelivery Notes: ${formObject.deliveryNotes}`;
  }
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';
  
  // Submit order
  fetch('/checkout/place-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formObject)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Show success message and redirect to confirmation page
      showNotification('Order placed successfully!');
      window.location.href = `/order/confirmation/${data.orderId}`;
    } else {
      // Reset button state
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      
      // Show error message
      if (data.outOfStockItems) {
        // Show out of stock items
        showOutOfStockError(data.outOfStockItems);
      } else {
        showNotification(data.message || 'Failed to place order.', 'error');
      }
    }
  })
  .catch(error => {
    console.error('Error placing order:', error);
    
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    
    showNotification('Failed to place order. Please try again.', 'error');
  });
}

// Show out of stock error
function showOutOfStockError(items) {
  // Create error message
  let message = 'Some items in your cart are no longer available:';
  items.forEach(item => {
    message += `<br>- ${item.name} (${item.available} available, ${item.requested} requested)`;
  });
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '1000';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'error-modal';
  modal.style.backgroundColor = 'white';
  modal.style.padding = '20px';
  modal.style.borderRadius = '5px';
  modal.style.maxWidth = '500px';
  modal.style.width = '90%';
  
  // Create modal content
  modal.innerHTML = `
    <h3 style="color: #dc3545; margin-top: 0;">Order Cannot Be Placed</h3>
    <p>${message}</p>
    <div style="text-align: right; margin-top: 20px;">
      <button id="return-to-cart" style="background-color: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Return to Cart</button>
    </div>
  `;
  
  // Add modal to overlay
  overlay.appendChild(modal);
  
  // Add overlay to body
  document.body.appendChild(overlay);
  
  // Add click event to return to cart button
  document.getElementById('return-to-cart').addEventListener('click', function() {
    window.location.href = '/cart';
  });
}

// Show notification message
function showNotification(message, type = 'success') {
  // Check if notification container exists
  let notificationContainer = document.querySelector('.notification-container');
  
  // If not, create it
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Add styles
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Style notification
  notification.style.padding = '10px 15px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';
  
  if (type === 'success') {
    notification.style.backgroundColor = '#28a745';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#dc3545';
    notification.style.color = 'white';
  }
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}