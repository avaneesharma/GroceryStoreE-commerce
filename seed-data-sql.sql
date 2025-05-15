-- Seed data for grocery store database

-- Clear existing data in the correct order to respect foreign keys
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM items;
DELETE FROM categories;
DELETE FROM admin;

-- Reset auto increment
ALTER TABLE items AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE carts AUTO_INCREMENT = 1;
ALTER TABLE cart_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE admin AUTO_INCREMENT = 1;

-- Insert admin user
INSERT INTO admin (email, mobile) VALUES ('admin@admin.com', '1234567890');

-- Insert parent categories
INSERT INTO categories (name, parent_id) VALUES 
('Frozen', NULL),
('Fresh', NULL),
('Dairy', NULL),
('Beverages', NULL),
('Home', NULL),
('Pet Food', NULL);

-- Insert subcategories for Frozen
INSERT INTO categories (name, parent_id) VALUES 
('Frozen Vegetables', 1),
('Frozen Meat', 1);

-- Insert subcategories for Fresh
INSERT INTO categories (name, parent_id) VALUES 
('Fresh Fruits', 2),
('Fresh Vegetables', 2);

-- Insert subcategories for Dairy
INSERT INTO categories (name, parent_id) VALUES 
('Liquid', 3),
('Cheese', 3),
('Frozen', 3),
('Cream', 3);

-- Insert subcategories for Beverages
INSERT INTO categories (name, parent_id) VALUES 
('Soft Drinks', 4),
('Juices', 4);

-- Insert subcategories for Home
INSERT INTO categories (name, parent_id) VALUES 
('Cleaning Supplies', 5),
('Kitchen Items', 5);

-- Insert subcategories for Pet Food
INSERT INTO categories (name, parent_id) VALUES 
('Dog Food', 6),
('Cat Food', 6);

-- Insert Items: Fresh Vegetables
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(10, 'Tomato', 'Fresh red tomatoes.', '/images/tomato.jpg', '1kg', 2.50, 100),
(10, 'Carrots', 'Fresh orange carrots.', '/images/carrots.jpg', '500g', 1.20, 0),
(10, 'Onions', 'Fresh red onions', '/images/onion.jpg', '1kg', 1.80, 75),
(10, 'Potatoes', 'Fresh russet potatoes.', '/images/potato.jpg', '2kg', 3.50, 85),
(10, 'Lettuce', 'Fresh green lettuce.', '/images/lettuce.jpg', '1 head', 1.99, 50);

-- Insert Items: Fresh Fruits
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(9, 'Apple', 'Fresh red apples.', '/images/apple.jpg', '1kg', 3.20, 120),
(9, 'Banana', 'Fresh yellow bananas.', '/images/banana.jpg', '1kg', 2.50, 150),
(9, 'Orange', 'Fresh navel oranges.', '/images/orange.jpg', '1kg', 3.50, 90),
(9, 'Grapes', 'Fresh green grapes.', '/images/grapes.jpg', '500g', 4.20, 65),
(9, 'Strawberries', 'Fresh strawberries.', '/images/strawberries.jpg', '250g', 3.99, 30);

-- Insert Items: Frozen Vegetables
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(7, 'Frozen Peas', 'Frozen green peas.', '/images/frozen-peas.jpg', '500g', 2.75, 100),
(7, 'Frozen Corn', 'Frozen sweet corn.', '/images/frozen-corn.jpg', '500g', 2.50, 120),
(7, 'Frozen Broccoli', 'Frozen broccoli florets.', '/images/frozen-broccoli.jpg', '400g', 3.20, 80),
(7, 'Frozen Mixed Vegetables', 'Frozen mixed vegetables.', '/images/frozen-mixed-veg.jpg', '750g', 4.50, 65);

-- Insert Items: Frozen Meat
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(8, 'Frozen Chicken Breast', 'Frozen boneless chicken breast.', '/images/frozen-chicken.jpg', '1kg', 9.99, 50),
(8, 'Frozen Ground Beef', 'Frozen ground beef.', '/images/frozen-beef.jpg', '500g', 6.50, 40),
(8, 'Frozen Fish Fillets', 'Frozen white fish fillets.', '/images/frozen-fish.jpg', '400g', 8.25, 35);

-- Insert Items: Dairy - Liquid
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(11, 'Milk', 'Fresh whole milk.', '/images/milk.jpg', '1L', 1.80, 200),
(11, 'Almond Milk', 'Unsweetened almond milk.', '/images/almond-milk.jpg', '1L', 3.50, 75),
(11, 'Soy Milk', 'Plain soy milk.', '/images/soy-milk.jpg', '1L', 2.99, 60);

-- Insert Items: Dairy - Cheese
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(12, 'Cheddar Cheese', 'Sharp cheddar cheese.', '/images/cheese.jpg', '250g', 4.50, 80),
(12, 'Mozzarella', 'Fresh mozzarella cheese.', '/images/mozzarella.jpg', '200g', 3.99, 65),
(12, 'Parmesan', 'Grated parmesan cheese.', '/images/parmesan.jpg', '100g', 3.75, 50);

-- Insert Items: Dairy - Frozen
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(13, 'Vanilla Ice Cream', 'Creamy vanilla ice cream.', '/images/ice-cream.jpg', '500ml', 5.99, 0),
(13, 'Chocolate Ice Cream', 'Rich chocolate ice cream.', '/images/chocolate-ice-cream.jpg', '500ml', 5.99, 40),
(13, 'Strawberry Ice Cream', 'Sweet strawberry ice cream.', '/images/strawberry-ice-cream.jpg', '500ml', 5.99, 35);

-- Insert Items: Dairy - Cream
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(14, 'Whipping Cream', 'Fresh whipping cream.', '/images/whipping-cream.jpg', '250ml', 2.75, 45),
(14, 'Sour Cream', 'Thick sour cream.', '/images/sour-cream.jpg', '200ml', 2.25, 55),
(14, 'Cooking Cream', 'Light cooking cream.', '/images/cooking-cream.jpg', '300ml', 2.99, 40);

-- Insert Items: Beverages - Soft Drinks
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(15, 'Cola', 'Refreshing cola.', '/images/cola.jpg', '2L', 1.99, 150),
(15, 'Lemon Soda', 'Fizzy lemon-flavored soda.', '/images/lemon-soda.jpg', '1.5L', 1.75, 120),
(15, 'Orange Soda', 'Sweet orange-flavored soda.', '/images/orange-soda.jpg', '1.5L', 1.75, 110);

-- Insert Items: Beverages - Juices
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(16, 'Orange Juice', 'Fresh orange juice.', '/images/orange-juice.jpg', '1L', 3.50, 80),
(16, 'Apple Juice', 'Sweet apple juice.', '/images/apple-juice.jpg', '1L', 3.25, 75),
(16, 'Mixed Fruit Juice', 'Blend of various fruits.', '/images/mixed-juice.jpg', '1L', 3.75, 65);

-- Insert Items: Home - Cleaning Supplies
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(17, 'All-Purpose Cleaner', 'Effective all-purpose cleaner.', '/images/all-purpose-cleaner.jpg', '750ml', 3.99, 60),
(17, 'Dish Soap', 'Concentrated dish soap.', '/images/dish-soap.jpg', '500ml', 2.50, 75),
(17, 'Laundry Detergent', 'Effective laundry detergent.', '/images/laundry-detergent.jpg', '2L', 7.99, 50);

-- Insert Items: Home - Kitchen Items
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(18, 'Kitchen Sponges', 'Pack of kitchen sponges.', '/images/kitchen-sponges.jpg', '5-pack', 2.25, 100),
(18, 'Aluminum Foil', 'Strong aluminum foil.', '/images/aluminum-foil.jpg', '30m', 3.50, 85),
(18, 'Food Storage Containers', 'Set of plastic food containers.', '/images/storage-containers.jpg', '3-pack', 6.99, 40);

-- Insert Items: Pet Food - Dog Food
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(19, 'Dry Dog Food', 'Nutritious dry dog food.', '/images/dry-dog-food.jpg', '5kg', 15.99, 30),
(19, 'Wet Dog Food', 'Tasty wet dog food.', '/images/wet-dog-food.jpg', '400g', 2.50, 45),
(19, 'Dog Treats', 'Delicious dog treats.', '/images/dog-treats.jpg', '250g', 4.99, 60);

-- Insert Items: Pet Food - Cat Food
INSERT INTO items (category_id, name, description, image, unit, price, stock) VALUES
(20, 'Dry Cat Food', 'Premium dry cat food.', '/images/dry-cat-food.jpg', '3kg', 12.99, 25),
(20, 'Wet Cat Food', 'Gourmet wet cat food.', '/images/wet-cat-food.jpg', '300g', 2.25, 50),
(20, 'Cat Treats', 'Tasty cat treats.', '/images/cat-treats.jpg', '100g', 3.75, 40);
