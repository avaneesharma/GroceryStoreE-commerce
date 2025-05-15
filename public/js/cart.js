// cart.js - Cart page specific functionality

document.addEventListener('DOMContentLoaded', function() {
    // Cart page specific event listeners
    
    // Quantity change on cart page
    const quantityInputs = document.querySelectorAll('.cart-page-item-quantity');
    quantityInputs.forEach(input => {
      input.addEventListener('change', function() {
        const cartItem = this.closest('.cart-page-item');
        const itemId = cartItem.getAttribute('data-id');
        const quantity = parseInt(this.value);
        
        if (quantity < 1) {
          this.value = 1;
          return;
        }
        
        if (quantity > 99) {
          this.value = 99;
          return;
        }
        
        updateCartItem(itemId, quantity, true);
      });
    });
    
    // Remove item buttons on cart page
    const removeButtons = document.querySelectorAll('.cart-page-remove-item');
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-page-item');
        const itemId = cartItem.getAttribute('data-id');
        
        removeCartItem(itemId, true);
      });
    });
    
    // Clear cart button on cart page
    const clearButton = document.querySelector('.cart-page-clear');
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        clearCart(true);
      });
    }
    
    // Checkout button on cart page
    const checkoutButton = document.querySelector('.cart-page-checkout');
    if (checkoutButton && !checkoutButton.classList.contains('disabled')) {
      checkoutButton.addEventListener('click', function() {
        window.location.href = '/checkout';
      });
    }
  });
  
  // Update cart item quantity on cart page
  function updateCartItem(itemId, quantity, isCartPage = false) {
    fetch('/cart/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemId, quantity })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = data.cartCount;
        }
        
        if (isCartPage) {
          // Update subtotal and total
          const itemSubtotal = document.querySelector(`.cart-page-item[data-id="${itemId}"] .item-subtotal`);
          if (itemSubtotal && data.itemPrice) {
            const subtotal = (data.itemPrice * quantity).toFixed(2);
            itemSubtotal.textContent = `$${subtotal}`;
          }
          
          // Update total
          const totalElement = document.querySelector('.cart-page-total-amount');
          if (totalElement && data.total) {
            totalElement.textContent = `$${data.total.toFixed(2)}`;
          }
          
          showNotification('Cart updated.');
        } else {
          // Update cart display
          updateCart();
        }
      } else {
        showNotification(data.message || 'Failed to update cart.', 'error');
      }
    })
    .catch(error => {
      console.error('Error updating cart:', error);
      showNotification('Failed to update cart.', 'error');
    });
  }
  
  // Remove item from cart on cart page
  function removeCartItem(itemId, isCartPage = false) {
    fetch('/cart/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = data.cartCount;
        }
        
        if (isCartPage) {
          // Remove item from page
          const cartItem = document.querySelector(`.cart-page-item[data-id="${itemId}"]`);
          if (cartItem) {
            cartItem.remove();
          }
          
          // Update total
          const totalElement = document.querySelector('.cart-page-total-amount');
          if (totalElement && data.total) {
            totalElement.textContent = `$${data.total.toFixed(2)}`;
          }
          
          // Check if cart is empty
          const cartItems = document.querySelectorAll('.cart-page-item');
          if (cartItems.length === 0) {
            const cartContainer = document.querySelector('.cart-page-container');
            if (cartContainer) {
              cartContainer.innerHTML = `
                <div class="empty-cart-message">Your cart is empty.</div>
                <div class="cart-actions">
                  <a href="/" class="continue-shopping">Continue Shopping</a>
                </div>
              `;
            }
          }
          
          showNotification('Item removed from cart.');
        } else {
          // Update cart display
          updateCart();
        }
      } else {
        showNotification(data.message || 'Failed to remove item.', 'error');
      }
    })
    .catch(error => {
      console.error('Error removing item:', error);
      showNotification('Failed to remove item.', 'error');
    });
  }
  
  // Clear cart on cart page
  function clearCart(isCartPage = false) {
    fetch('/cart/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = '0';
        }
        
        if (isCartPage) {
          // Update page to show empty cart
          const cartContainer = document.querySelector('.cart-page-container');
          if (cartContainer) {
            cartContainer.innerHTML = `
              <div class="empty-cart-message">Your cart is empty.</div>
              <div class="cart-actions">
                <a href="/" class="continue-shopping">Continue Shopping</a>
              </div>
            `;
          }
          
          showNotification('Cart cleared.');
        } else {
          // Update cart display
          updateCart();
        }
      } else {
        showNotification(data.message || 'Failed to clear cart.', 'error');
      }
    })
    .catch(error => {
      console.error('Error clearing cart:', error);
      showNotification('Failed to clear cart.', 'error');
    });
  }
  
  // Show notification function (if not defined in main.js)
  function showNotification(message, type = 'success') {
    // Check if notification function exists in main.js
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
      return;
    }
    
    // If not defined in main.js, implement it here
    let notificationContainer = document.querySelector('.notification-container');
    
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
    
    // Add animation styles if they don't exist
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
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
    }
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }