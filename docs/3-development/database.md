# Database Schema - BeBook MongoDB

## 1. Overview
BeBook uses **MongoDB** as its database, with **Mongoose** for object data modeling (ODM).

## 2. Main Collections

### 2.1 User
Stores user profile information, credentials (hashed), subscription status, and payment methods.
- **Key Fields:** `name`, `email`, `password`, `isAdmin`, `subscription`, `paymentMethods`.

### 2.2 Product
Stores items available in the catalog (Books, Notes, Products).
- **Key Fields:** `name`, `author`, `price`, `category`, `type`, `countInStock`, `isFree`, `rating`.

### 2.3 Order
Records purchases made by users.
- **Key Fields:** `user`, `orderItems`, `shippingAddress`, `paymentMethod`, `totalPrice`, `isPaid`.

### 2.4 Sucursal
Stores geospatial information about library branches.
- **Key Fields:** `name`, `address`, `location` (GeoJSON Point), `province`, `services`.

### 2.5 ForumTopic & ForumReply
Manages the community discussion threads.
- **Key Fields (Topic):** `title`, `content`, `user`, `category`.
- **Key Fields (Reply):** `topic`, `user`, `content`.

### 2.6 Booking
Manages reservations for rooms or events at branches.
- **Key Fields:** `user`, `sucursal`, `date`, `timeSlot`, `status`.

### 2.7 Comentario
Stores user reviews and ratings for products and branches.
- **Key Fields:** `user`, `product`, `sucursal`, `text`, `rating`.

## 3. Indexing
- **Geospatial Index:** `sucursalSchema.index({ location: '2dsphere' })` for distance-based searches.
- **Unique Indexes:** `userSchema.index({ email: 1 }, { unique: true })`.
