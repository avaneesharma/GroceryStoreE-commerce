// main.js - Shared functionality across the site

document.addEventListener('DOMContentLoaded', function() {
    // Add click event listeners to subcategory links
    const subcategoryLinks = document.querySelectorAll('.subnav-content a');
    subcategoryLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        
        const category = this.getAttribute('data-category');
        const categoryUrl = `/category/${category}`;
        window.location.href = categoryUrl;
      });
    });
    
    // Add event listener for the Home link to show all products
    const homeLink = document.querySelector('.navbar > a');
    if (homeLink) {
      homeLink.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = '/';
      });
    }
    
    // Disable add to cart buttons for out of stock items
    const outOfStockItems = document.querySelectorAll('.out-of-stock');
    outOfStockItems.forEach(item => {
      const button = item.nextElementSibling;
      if (button) {
        button.classList.add('disabled');
        button.disabled = true;
      }
    });
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.item-card button:not(.disabled)');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const itemCard = this.closest('.item-card');
        const itemId = itemCard.getAttribute('data-id');
        
        // Show loading state
        this.textContent = 'Adding...';
        this.disabled = true;
        
        fetch('/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemId: itemId, quantity: 1 })
        })
        .then(response => response.json())
        .then(data => {
          // Reset button state
          this.textContent = 'Add to Cart';
          this.disabled = false;
          
          if (data.success) {
            // Update cart count
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
              cartCount.textContent = data.cartCount;
            }
            
            // Show notification
            showNotification('Item added to cart!');
            
            // If cart container is visible, update it
            updateCart();
          } else {
            showNotification(data.message || 'Something went wrong!', 'error');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          this.textContent = 'Add to Cart';
          this.disabled = false;
          showNotification('Failed to add item to cart.', 'error');
        });
      });
    });
    
    // Cart toggle button functionality
    const cartButton = document.querySelector('.cart-button button');
    if (cartButton) {
      cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        toggleCart();
      });
    }
    
    // Search form validation
    const searchForm = document.querySelector('.search-box form');
    if (searchForm) {
      searchForm.addEventListener('submit', function(event) {
        const searchInput = this.querySelector('input[name="q"]');
        if (!searchInput.value.trim()) {
          event.preventDefault();
          searchInput.focus();
        }
      });
    }
  });
  
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
  
  // Toggle cart visibility
  function toggleCart() {
    // Check if cart container exists
    let cartContainer = document.querySelector('.cart-container');
    
    if (cartContainer) {
      // If it exists, toggle visibility
      if (cartContainer.style.display === 'none' || cartContainer.style.display === '') {
        cartContainer.style.display = 'block';
        updateCart(); // Update cart contents
      } else {
        cartContainer.style.display = 'none';
      }
    } else {
      // If it doesn't exist, create it and fetch cart data
      cartContainer = document.createElement('div');
      cartContainer.className = 'cart-container';
      document.body.appendChild(cartContainer);
      
      // Show loading state
      cartContainer.innerHTML = '<div class="cart-loading">Loading cart...</div>';
      cartContainer.style.display = 'block';
      
      updateCart();
    }
  }
  
  // Update cart contents
  function updateCart() {
    const cartContainer = document.querySelector('.cart-container');
    if (!cartContainer) return;
    
    fetch('/cart/get')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          renderCart(data.cart);
        } else {
          cartContainer.innerHTML = `
            <div class="cart-header">
              <h3>Shopping Cart</h3>
              <button class="close-cart">&times;</button>
            </div>
            <div class="empty-cart-message">${data.message || 'Could not load cart.'}</div>
          `;
          
          // Add event listener to close button
          const closeButton = cartContainer.querySelector('.close-cart');
          if (closeButton) {
            closeButton.addEventListener('click', function() {
              cartContainer.style.display = 'none';
            });
          }
        }
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
        cartContainer.innerHTML = `
          <div class="cart-header">
            <h3>Shopping Cart</h3>
            <button class="close-cart">&times;</button>
          </div>
          <div class="empty-cart-message">Failed to load cart.</div>
        `;
        
        // Add event listener to close button
        const closeButton = cartContainer.querySelector('.close-cart');
        if (closeButton) {
          closeButton.addEventListener('click', function() {
            cartContainer.style.display = 'none';
          });
        }
      });
  }
  
// Render cart contents
function renderCart(cart) {
  const cartContainer = document.querySelector('.cart-container');
  if (!cartContainer) return;
  
  if (!cart || !cart.items || cart.items.length === 0) {
    // Empty cart
    cartContainer.innerHTML = `
      <div class="cart-header">
        <h3>Shopping Cart</h3>
        <button class="close-cart">&times;</button>
      </div>
      <div class="empty-cart-message">Your cart is empty.</div>
      <div class="cart-actions">
        <button class="checkout-btn disabled" disabled>Checkout</button>
      </div>
    `;
  } else {
    // Cart with items
    let cartItemsHtml = '';
    let totalPrice = 0;
    
    cart.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;
      
      cartItemsHtml += `
        <div class="cart-item" data-id="${item.id}">
          
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-details">
              <span class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</span>
              <span class="cart-item-subtotal">$${itemTotal.toFixed(2)}</span>
            </div>
          </div>
          <div class="cart-item-actions">
            <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" max="99">
            <button class="remove-item">×</button>
          </div>
        </div>
      `;
    });
    
    cartContainer.innerHTML = `
      <div class="cart-header">
        <h3>Shopping Cart</h3>
        <button class="close-cart">&times;</button>
      </div>
      <div class="cart-items">
        ${cartItemsHtml}
      </div>
      <div class="cart-total">
        <span>Total:</span>
        <span>$${totalPrice.toFixed(2)}</span>
      </div>
      <div class="cart-actions">
        <button class="view-cart-btn">View Cart</button>
        <button class="checkout-btn">Checkout</button>
      </div>
      <div class="cart-footer">
        <button class="clear-cart">Clear Cart</button>
      </div>
    `;
  }
  
  // Add event listeners
  
  // Close button
  const closeButton = cartContainer.querySelector('.close-cart');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      cartContainer.style.display = 'none';
    });
  }
  
  // Quantity change
  const quantityInputs = cartContainer.querySelectorAll('.cart-item-quantity');
  quantityInputs.forEach(input => {
    input.addEventListener('change', function() {
      const cartItem = this.closest('.cart-item');
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
      
      updateCartItem(itemId, quantity);
    });
  });
  
  // Remove item buttons
  const removeButtons = cartContainer.querySelectorAll('.remove-item');
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const cartItem = this.closest('.cart-item');
      const itemId = cartItem.getAttribute('data-id');
      
      removeCartItem(itemId);
    });
  });
  
  // Clear cart button
  const clearButton = cartContainer.querySelector('.clear-cart');
  if (clearButton) {
    clearButton.addEventListener('click', function() {
      clearCart();
    });
  }
  
  // View Cart button
  const viewCartButton = cartContainer.querySelector('.view-cart-btn');
  if (viewCartButton) {
    viewCartButton.addEventListener('click', function() {
      window.location.href = '/cart';
    });
  }
  
  // Checkout button
  const checkoutButton = cartContainer.querySelector('.checkout-btn');
  if (checkoutButton && !checkoutButton.classList.contains('disabled')) {
    checkoutButton.addEventListener('click', function() {
      window.location.href = '/checkout';
    });
  }
}
  
  // Update cart item quantity
  function updateCartItem(itemId, quantity) {
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
        
        // Update cart display
        updateCart();
      } else {
        showNotification(data.message || 'Failed to update cart.', 'error');
      }
    })
    .catch(error => {
      console.error('Error updating cart:', error);
      showNotification('Failed to update cart.', 'error');
    });
  }
  
  // Remove item from cart
  function removeCartItem(itemId) {
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
        
        // Update cart display
        updateCart();
        
        showNotification('Item removed from cart.');
      } else {
        showNotification(data.message || 'Failed to remove item.', 'error');
      }
    })
    .catch(error => {
      console.error('Error removing item:', error);
      showNotification('Failed to remove item.', 'error');
    });
  }
  
  // Clear cart
  function clearCart() {
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
        
        // Update cart display
        updateCart();
        
        showNotification('Cart cleared.');
      } else {
        showNotification(data.message || 'Failed to clear cart.', 'error');
      }
    })
    .catch(error => {
      console.error('Error clearing cart:', error);
      showNotification('Failed to clear cart.', 'error');
    });
  }