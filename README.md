# Food Mart Online Grocery Store

An interactive online grocery store web application built with Node.js, Express, MySQL, and EJS. This platform allows users to browse products, search by categories, manage a shopping cart, and complete the checkout process.

![Food Mart Banner](public/images/logo.png)

## Features

- **Product Browsing**: Browse items by categories and subcategories
- **Search Functionality**: Search for products using keywords
- **Shopping Cart**: Add, remove, and update items in a session-based cart
- **Checkout Process**: Complete orders with delivery information
- **Order Confirmation**: Receive email confirmation after order placement
- **Admin Dashboard**: View and manage all customer orders
- **Responsive Design**: Mobile-friendly interface
- **Real-time Stock Checking**: Verifies product availability during checkout

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript, EJS (Embedded JavaScript templates)
- **Database**: MySQL
- **Session Management**: express-session
- **Email**: Nodemailer
- **Others**: UUID for session IDs, Font Awesome for icons

## Installation

### Prerequisites

- Node.js (v14+)
- MySQL (v5.7+)
- npm (v6+)
- XAMPP (optional, for easy MySQL management)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/food-mart.git
   cd food-mart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Start your MySQL server (via XAMPP or directly)
   - Create a new database named `grocery_store`
   - Import the SQL schema from `grocery_store_schema.sql`
   - Import sample data from `products.sql` (optional)

4. **Configure environment variables (optional)**
   - Create a `.env` file in the root directory
   - Add your configurations like database credentials and email settings

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the website**
   - Open your browser and navigate to `http://localhost:3000`

## Usage

### Customer View

1. **Browse Products**
   - View all products on the homepage
   - Filter products by categories using the navigation menu
   - Search for specific products using the search box

2. **Shopping Cart**
   - Add products to your cart
   - View cart by clicking the cart icon
   - Update quantities or remove items
   - Cart data persists for 20 minutes in the session

3. **Checkout Process**
   - Enter delivery details including:
     - Name
     - Email
     - Australian mobile number
     - Street address
     - City/suburb
     - State/territory
     - Postcode
   - Place your order
   - Receive confirmation email

### Admin View

1. **Access Admin Panel**
   - Navigate to `/admin/login`
   - Login with:
     - Email: admin@admin.com
     - Mobile: 1234567890

2. **View Orders**
   - See all orders with customer details
   - Filter orders by date range
   - Export orders as CSV

## Project Structure

```
/public
  /css
    - style.css (shared styles)
    - cart.css
    - checkout.css
    - admin.css
    - hero-banner.css
  /js
    - main.js (shared functionality)
    - cart.js
    - checkout.js
    - admin.js
  /images
    - logo.png
    - product images...
/views
  - home.ejs
  - cart.ejs
  - checkout.ejs
  - confirmation.ejs
  - admin-login.ejs
  - admin-dashboard.ejs
  - search-results.ejs
  - category.ejs
  - 404.ejs
  - error.ejs
  /partials
    - header.ejs
    - footer.ejs
- app.js (main server file)
- db.js (database connection)
- package.json
- grocery_store_schema.sql
- products.sql
```

## Database Schema

### Categories Table
Stores product categories with parent-child relationships
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INT DEFAULT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

### Items Table
Stores product information
```sql
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  unit VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Carts & Cart Items Tables
Temporary storage for session-based carts
```sql
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT,
  item_id INT,
  quantity INT NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id)
);
```

### Orders & Order Items Tables
Stores order information and purchased items
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  item_id INT,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id)
);
```

### Admin Table
Stores admin credentials
```sql
CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  mobile VARCHAR(20) NOT NULL
);
```

## Key Implementation Details

1. **Session-Based Cart**: Uses Express session to maintain cart state without user login
2. **Dynamic Category Handling**: Intelligent URL-to-category mapping for navigation
3. **Stock Validation**: Double-checks stock availability before order completion
4. **Responsive UI**: Mobile-friendly design with clean product presentation
5. **Form Validation**: Client and server-side validation of checkout information

## Limitations & Future Improvements

- User accounts and login functionality
- Payment gateway integration
- Order tracking and history
- Product reviews and ratings
- Wishlist functionality
- Enhanced admin capabilities (product management)

## Credits

- Icons: Font Awesome
- Image placeholders: Generated SVGs
- Font: Segoe UI, Tahoma, Geneva, Verdana, sans-serif

## License

This project is available for educational purposes. Feel free to use it as a reference for your own projects.

---

*This project was created as an assignment for Internet Programming.*
