# API Documentation - BeBook REST API

## 1. Authentication & Users
- `POST /api/users/login` - Authenticate user & get token.
- `POST /api/users` - Register a new user.
- `POST /api/users/google` - Authenticate with Google OAuth.
- `GET /api/users/profile` - Get current user profile (Protected).
- `PUT /api/users/profile` - Update user profile (Protected).

## 2. Products (Catalog)
- `GET /api/products` - Fetch all products with filtering/pagination.
- `GET /api/products/:id` - Fetch a single product by ID.
- `GET /api/products/categories` - Fetch all unique product categories.

## 3. Orders & Purchases
- `POST /api/orders` - Create a new order (Protected).
- `GET /api/orders/:id` - Get order by ID (Protected).
- `GET /api/orders/myorders` - Get logged-in user's orders (Protected).

## 4. Community (Forums)
- `GET /api/forum/topics` - Get all forum topics.
- `POST /api/forum/topics` - Create a new topic (Protected).
- `GET /api/forum/topics/:id` - Get topic details and replies.
- `POST /api/forum/replies` - Reply to a forum topic (Protected).

## 5. Branches (Sucursales)
- `GET /api/sucursales` - Get all branches with geospatial search.
- `GET /api/sucursales/:id` - Get branch details.
- `GET /api/sucursales/provinces` - Get unique provinces with branches.

## 6. Bookings
- `POST /api/bookings` - Create a new booking (Protected).
- `GET /api/bookings/mybookings` - Get logged-in user's bookings (Protected).

## 7. Comments & Reviews
- `POST /api/comentarios` - Add a review/comment (Protected).
- `GET /api/comentarios` - Get comments for a product or branch.
