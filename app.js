// app.js - Main server file
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Create Express app
const app = express();

// Import database connection
const db = require('./db');

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up session
app.use(session({
  secret: 'grocery-store-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 20 // 20 minutes
  }
}));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper function to get cart count - used across routes
app.use((req, res, next) => {
  res.locals.getCartCount = () => {
    if (req.session.cart && req.session.cart.items) {
      return req.session.cart.items.reduce((total, item) => total + item.quantity, 0);
    }
    return 0;
  };
  
  // Make cart count available to all templates
  res.locals.cartCount = res.locals.getCartCount();
  next();
});

// Helper function to process items (convert price to number)
function processItems(items) {
  return items.map(item => {
    // Convert price to a number
    if (item.price !== undefined) {
      item.price = parseFloat(item.price);
    }
    return item;
  });
}

// Define route handlers
// Home and category routes
app.get('/', async (req, res) => {
  try {
    // Fetch all items from database
    const [items] = await db.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.name ASC
    `);
    
    // Process items to ensure price is a number
    const processedItems = processItems(items);
    
    // Render home page with items
    res.render('home', {
      items: processedItems
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).render('error', {
      error: 'Failed to load products'
    });
  }
});

// Category routes
app.get('/category/:categorySlug', async (req, res) => {
  const categorySlug = req.params.categorySlug;
  
  try {
    // Fetch all categories with their parent relationships
    const [allCategories] = await db.query(`
      SELECT c.id, c.name, c.parent_id, 
             p.name as parent_name,
             p.id as parent_id_value
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY c.parent_id IS NULL DESC, c.name
    `);
    
    // Create a map of category names to categories for easier lookup
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat;
    });
    
    // Create arrays of main categories and subcategories
    const mainCategories = allCategories.filter(cat => cat.parent_id === null);
    const subCategories = allCategories.filter(cat => cat.parent_id !== null);
    
    // Variables to track what we find
    let targetCategory = null;
    let displayName = '';
    let categoryIds = [];
    
    // Step 1: Try to match as a main category by converting entire slug to a name
    const mainCategoryName = categorySlug.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    // Check if this matches a main category
    const mainCategory = mainCategories.find(cat => 
      cat.name.toLowerCase() === mainCategoryName.toLowerCase());
    
    if (mainCategory) {
      // Found a match for a main category
      targetCategory = mainCategory;
      displayName = mainCategory.name;
      
      // Get subcategories of this main category
      const childCategories = subCategories.filter(sub => 
        sub.parent_id === mainCategory.id);
      
      // Include both main category and subcategories
      categoryIds = [mainCategory.id, ...childCategories.map(child => child.id)];
    } else {
      // Step 2: Try all possible ways of splitting the slug to match main + sub
      const parts = categorySlug.split('-');
      let bestMatch = null;
      
      // Try different split points
      for (let i = 1; i < parts.length; i++) {
        // Create potential main category name from first i parts
        const potentialMainName = parts.slice(0, i)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        
        // Try to find this main category
        const potentialMain = mainCategories.find(cat => 
          cat.name.toLowerCase() === potentialMainName.toLowerCase());
        
        if (potentialMain) {
          // Create potential subcategory name from remaining parts
          const potentialSubName = parts.slice(i)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
          
          // Try to find this subcategory under the potential main category
          const potentialSub = subCategories.find(sub => 
            sub.parent_id === potentialMain.id && 
            sub.name.toLowerCase() === potentialSubName.toLowerCase());
          
          if (potentialSub) {
            bestMatch = {
              main: potentialMain,
              sub: potentialSub
            };
            break; // Found an exact match, stop searching
          }
          
          // If no exact match, try combined name (e.g., "Frozen Vegetables")
          const combinedName = potentialMain.name + ' ' + potentialSubName;
          const combinedMatch = subCategories.find(sub => 
            sub.parent_id === potentialMain.id &&
            sub.name.toLowerCase().includes(potentialSubName.toLowerCase()));
          
          if (combinedMatch) {
            bestMatch = {
              main: potentialMain,
              sub: combinedMatch
            };
            // Don't break - continue looking for a better match
          }
        }
      }
      
      // If we found a main + sub match
      if (bestMatch) {
        targetCategory = bestMatch.sub;
        displayName = `${bestMatch.main.name} - ${bestMatch.sub.name.replace(bestMatch.main.name, '').trim() || bestMatch.sub.name}`;
        categoryIds = [bestMatch.sub.id];
      }
    }
    
    // If we couldn't find a matching category, return 404
    if (categoryIds.length === 0) {
      return res.status(404).render('404', { title: 'Category Not Found' });
    }
    
    // Fetch items for the identified categories
    const [items] = await db.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      JOIN categories c ON i.category_id = c.id
      WHERE c.id IN (${categoryIds.join(',')})
      ORDER BY i.name ASC
    `);
    
    const processedItems = processItems(items);
    
    res.render('category', {
      categoryName: displayName,
      items: processedItems
    });
    
  } catch (error) {
    console.error('Error fetching category items:', error);
    res.status(500).render('error', {
      error: 'Failed to load category products'
    });
  }
});

// Search routes
app.get('/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.redirect('/');
  }
  
  try {
    // Search items
    const [items] = await db.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.name LIKE ? OR i.description LIKE ?
      ORDER BY i.name ASC
    `, [`%${query}%`, `%${query}%`]);
    
    // Process items to ensure price is a number
    const processedItems = processItems(items);
    
    // Render search results
    res.render('search-results', {
      query: query,
      items: processedItems
    });
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).render('error', {
      error: 'Failed to search products'
    });
  }
});

// Cart routes
// Initialize cart
function initializeCart(req) {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      total: 0
    };
  }
  return req.session.cart;
}

// Calculate cart total
function calculateCartTotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Cart page
app.get('/cart', (req, res) => {
  const cart = initializeCart(req);
  
  res.render('cart', {
    cart: cart
  });
});

// Get cart data (AJAX)
app.get('/cart/get', (req, res) => {
  const cart = initializeCart(req);
  
  res.json({
    success: true,
    cart: cart
  });
});

// Add item to cart
app.post('/cart/add', async (req, res) => {
  const { itemId, quantity = 1 } = req.body;
  const cart = initializeCart(req);
  
  try {
    // Get item details from database
    const [items] = await db.query('SELECT * FROM items WHERE id = ?', [itemId]);
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    const item = items[0];
    
    // Check if item is in stock
    if (item.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Item is out of stock'
      });
    }
    
    // Check if item is already in cart
    const existingItemIndex = cart.items.findIndex(cartItem => cartItem.id == item.id);
    
    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item to cart
      cart.items.push({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        unit: item.unit,
        image: item.image || '/images/placeholder.jpg',
        quantity: parseInt(quantity)
      });
    }
    
    // Recalculate cart total
    cart.total = calculateCartTotal(cart.items);
    
    // Save cart to session
    req.session.cart = cart;
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cartCount: res.locals.getCartCount()
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// Update cart item
app.post('/cart/update', (req, res) => {
  const { itemId, quantity } = req.body;
  const cart = initializeCart(req);
  
  // Find item in cart
  const itemIndex = cart.items.findIndex(item => item.id == itemId);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }
  
  // Update quantity
  cart.items[itemIndex].quantity = parseInt(quantity);
  
  // Recalculate cart total
  cart.total = calculateCartTotal(cart.items);
  
  // Save cart to session
  req.session.cart = cart;
  
  res.json({
    success: true,
    message: 'Cart updated',
    cartCount: res.locals.getCartCount(),
    itemPrice: cart.items[itemIndex].price,
    total: cart.total
  });
});

// Remove item from cart
app.post('/cart/remove', (req, res) => {
  const { itemId } = req.body;
  const cart = initializeCart(req);
  
  // Remove item from cart
  cart.items = cart.items.filter(item => item.id != itemId);
  
  // Recalculate cart total
  cart.total = calculateCartTotal(cart.items);
  
  // Save cart to session
  req.session.cart = cart;
  
  res.json({
    success: true,
    message: 'Item removed from cart',
    cartCount: res.locals.getCartCount(),
    total: cart.total
  });
});

// Clear cart
app.post('/cart/clear', (req, res) => {
  // Reset cart
  req.session.cart = {
    items: [],
    total: 0
  };
  
  res.json({
    success: true,
    message: 'Cart cleared'
  });
});

// Checkout routes
app.get('/checkout', (req, res) => {
  // Check if cart exists and has items
  if (!req.session.cart || !req.session.cart.items || req.session.cart.items.length === 0) {
    return res.render('checkout', {
      cart: null
    });
  }
  
  res.render('checkout', {
    cart: req.session.cart
  });
});


// Place order
app.post('/checkout/place-order', async (req, res) => {
  // Check if cart exists and has items
  if (!req.session.cart || !req.session.cart.items || req.session.cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Your cart is empty'
    });
  }
  
  const { customerName, email, mobile, address } = req.body;
  const cart = req.session.cart;
  
  // Validate input
  if (!customerName || !email || !mobile || !address) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  try {
    // Begin transaction
    await db.query('START TRANSACTION');
    
    // Check if all items are in stock
    const outOfStockItems = [];
    
    // IMPORTANT: Re-check stock levels for all items in the cart
    for (const cartItem of cart.items) {
      const [items] = await db.query('SELECT * FROM items WHERE id = ?', [cartItem.id]);
      
      if (items.length === 0) {
        // Item not found
        outOfStockItems.push({
          name: cartItem.name,
          available: 0,
          requested: cartItem.quantity
        });
        continue;
      }
      
      const item = items[0];
      
      if (item.stock < cartItem.quantity) {
        // Not enough stock
        outOfStockItems.push({
          name: item.name,
          available: item.stock,
          requested: cartItem.quantity
        });
      }
    }
    
    // If any items are out of stock, return error and redirect to cart
    if (outOfStockItems.length > 0) {
      // Rollback transaction
      await db.query('ROLLBACK');
      
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock',
        outOfStockItems: outOfStockItems
      });
    }
    
    // Create order
    const [orderResult] = await db.query(`
      INSERT INTO orders (customer_name, address, mobile, email)
      VALUES (?, ?, ?, ?)
    `, [customerName, address, mobile, email]);
    
    const orderId = orderResult.insertId;
    
    // Add order items and update stock levels
    for (const cartItem of cart.items) {
      // Add to order_items
      await db.query(`
        INSERT INTO order_items (order_id, item_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderId, cartItem.id, cartItem.quantity, cartItem.price]);
      
      // Update item stock
      await db.query(`
        UPDATE items
        SET stock = stock - ?
        WHERE id = ?
      `, [cartItem.quantity, cartItem.id]);
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Send confirmation email
    try {
      const transporter = req.app.locals.transporter;
      
      let emailHtml = `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order, ${customerName}!</p>
        <p>Your order #${orderId} has been received and is being processed.</p>
        <h2>Order Details</h2>
        <table border="1" cellpadding="10" cellspacing="0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      for (const item of cart.items) {
        emailHtml += `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      }
      
      emailHtml += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" align="right"><strong>Total:</strong></td>
              <td><strong>$${cart.total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        <h2>Shipping Information</h2>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Mobile:</strong> ${mobile}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Thank you for shopping with Food Mart Grocery Store!</p>
      `;
      
      // Send email
      await transporter.sendMail({
        from: '"Food Mart Grocery Store" <noreply@foodmart.com>',
        to: email,
        subject: `Order Confirmation #${orderId}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue with order processing even if email fails
    }
    
    // Clear cart
    req.session.cart = {
      items: [],
      total: 0
    };
    
    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error placing order:', error);
    
    // Rollback transaction on error
    await db.query('ROLLBACK');
    
    res.status(500).json({
      success: false,
      message: 'Failed to place order'
    });
  }
});

// Order confirmation page
app.get('/order/confirmation/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  
  try {
    // Get order details
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).render('error', {
        error: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    // Get order items
    const [orderItems] = await db.query(`
      SELECT oi.*, i.name, i.image, i.unit
      FROM order_items oi
      JOIN items i ON oi.item_id = i.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    // Process order items (convert price to number)
    const processedOrderItems = processItems(orderItems);
    
    // Calculate total
    const total = processedOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('confirmation', {
      order: order,
      orderItems: processedOrderItems,
      total: total
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).render('error', {
      error: 'Failed to load order details'
    });
  }
});

// Admin Login routes
app.get('/admin/login', (req, res) => {
  res.render('admin-login', {
    error: null
  });
});

// Admin login process
app.post('/admin/login', async (req, res) => {
  const { email, mobile } = req.body;
  
  try {
    // Check credentials
    const [admins] = await db.query(
      'SELECT * FROM admin WHERE email = ? AND mobile = ?',
      [email, mobile]
    );
    
    if (admins.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Set admin session
    req.session.adminAuthenticated = true;
    req.session.adminId = admins[0].id;
    
    res.json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Admin authentication middleware
function requireAdminAuth(req, res, next) {
  if (!req.session.adminAuthenticated) {
    return res.redirect('/admin/login');
  }
  next();
}

// Admin dashboard
app.get('/admin/dashboard', requireAdminAuth, async (req, res) => {
  // Get filter parameters
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
  
  // Initialize filters
  const filters = {
    startDate: startDate ? startDate.toISOString().split('T')[0] : null,
    endDate: endDate ? endDate.toISOString().split('T')[0] : null
  };
  
  try {
    // Build query for orders
    let query = `
      SELECT o.*, COUNT(oi.id) as itemCount, SUM(oi.quantity * oi.price) as total
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    const queryParams = [];
    
    // Add date filters if provided
    if (startDate || endDate) {
      query += ' WHERE ';
      
      if (startDate) {
        query += 'o.created_at >= ?';
        queryParams.push(startDate.toISOString().slice(0, 19).replace('T', ' '));
        
        if (endDate) {
          query += ' AND ';
        }
      }
      
      if (endDate) {
        // Set end of day for the end date
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query += 'o.created_at <= ?';
        queryParams.push(endOfDay.toISOString().slice(0, 19).replace('T', ' '));
      }
    }
    
    query += ' GROUP BY o.id ORDER BY o.created_at DESC';
    
    // Get orders
    const [orders] = await db.query(query, queryParams);
    
    // Process orders (convert total to number)
    const processedOrders = orders.map(order => {
      if (order.total !== undefined) {
        order.total = parseFloat(order.total);
      }
      return order;
    });
    
    // Get order items for each order
    for (const order of processedOrders) {
      const [items] = await db.query(`
        SELECT oi.*, i.name, i.unit
        FROM order_items oi
        JOIN items i ON oi.item_id = i.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      // Process items (convert price to number)
      order.items = processItems(items);
    }
    
    // Calculate summary
    const totalOrders = processedOrders.length;
    const totalRevenue = processedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const summary = {
      totalOrders,
      totalRevenue,
      avgOrderValue
    };
    
    res.render('admin-dashboard', {
      orders: processedOrders,
      summary,
      filters
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('admin-error', {
      error: 'Failed to load dashboard data'
    });
  }
});

// Admin logout
app.post('/admin/logout', (req, res) => {
  req.session.adminAuthenticated = false;
  req.session.adminId = null;
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});


// Fresh Produce route (combines fresh vegetables and fruits)
app.get('/fresh-produce', async (req, res) => {
  console.log('Fresh produce route accessed');
  try {
    // Get fresh vegetables and fruits categories directly by name
    const [freshVegetables] = await db.query(`
      SELECT id FROM categories 
      WHERE name = 'Fresh Vegetables'
    `);
    
    const [freshFruits] = await db.query(`
      SELECT id FROM categories 
      WHERE name = 'Fresh Fruits'
    `);
    
    
    // If no categories found, redirect to home
    if ((!freshVegetables || freshVegetables.length === 0) && 
        (!freshFruits || freshFruits.length === 0)) {
      console.log('No categories found, redirecting to home');
      return res.redirect('/');
    }
    
    // Build query based on what we found
    let categoryIds = [];
    if (freshVegetables && freshVegetables.length > 0) {
      categoryIds.push(freshVegetables[0].id);
    }
    if (freshFruits && freshFruits.length > 0) {
      categoryIds.push(freshFruits[0].id);
    }
    

    
    // Fetch items from both categories
    const [items] = await db.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE c.id IN (${categoryIds.join(',')})
      ORDER BY i.name ASC
    `);
    
    
    
    // Process items to ensure price is a number
    const processedItems = items.map(item => {
      if (item.price !== undefined) {
        item.price = parseFloat(item.price);
      }
      return item;
    });
    
    // Render category template
    res.render('category', {
      categoryName: 'Fresh Produce',
      categoryDescription: 'Browse our selection of fresh fruits and vegetables',
      items: processedItems
    });
  } catch (error) {
    console.error('Error fetching fresh produce:', error);
    res.status(500).render('error', {
      error: 'Failed to load fresh produce'
    });
  }
});

// 404 page
app.use((req, res, next) => {
  res.status(404).render('404', {
    title: 'Page Not Found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Something Went Wrong',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;