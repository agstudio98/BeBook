# Software Requirements Specification (SRS) - BeBook

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to provide a detailed overview of the BeBook system, its requirements, and its functionalities. This document is intended for developers, stakeholders, and testers.

### 1.2 Scope
BeBook is a MERN-based platform for managing a literary community. It includes features for catalog browsing, booking library services, purchasing products, participating in forums, and managing user profiles.

## 2. Overall Description
### 2.1 Product Perspective
BeBook is a standalone web application designed to digitalize the library and bookstore experience, providing a modern interface for book lovers.

### 2.2 User Classes and Characteristics
- **Guest:** Can browse products, sucursales, and forum topics.
- **Client:** Authenticated user who can book services, purchase items, and post in forums.
- **Admin:** Power user who can manage the catalog, users, and system settings.

## 3. Functional Requirements
### 3.1 User Management
- **REQ-1:** The system shall allow users to register and login using email/password or Google OAuth.
- **REQ-2:** Users shall be able to update their profiles, including avatars and subscription plans.

### 3.2 Catalog & E-commerce
- **REQ-3:** The system shall display a searchable catalog of books and academic materials.
- **REQ-4:** Users shall be able to add items to a shopping cart and place orders.

### 3.3 Community & Forums
- **REQ-5:** The system shall provide a forum for literary discussions.
- **REQ-6:** Users shall be able to create topics and reply to existing threads.

### 3.4 Branch & Booking Management
- **REQ-7:** The system shall display library branches (sucursales) with geospatial search.
- **REQ-8:** Users shall be able to book reading rooms or events at specific branches.

## 4. Non-Functional Requirements
- **Performance:** Pages shall load in less than 2 seconds under normal conditions.
- **Security:** All user data and tokens shall be handled securely using JWT and encryption.
- **Scalability:** The architecture shall support an increasing number of concurrent users and products.
- **Availability:** The system shall be available 24/7 with minimal downtime for maintenance.
