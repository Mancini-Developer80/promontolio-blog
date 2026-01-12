# Promontolio: Full-Stack Blog CMS

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

**Promontolio** is a bespoke, full-stack Content Management System (CMS) developed for an Italian artisanal brand. Built with the **MVC (Model-View-Controller)** architecture, it provides a secure, role-based environment for managing high-fidelity blog content and media assets.

## Key Features

* **Role-Based Access Control (RBAC):** Secure authentication and authorization via **Passport.js**, distinguishing between Super-Admins, Content Creators, and public users.
* **Media Management Pipeline:** Integrated **Multer** and **Cloudinary** API for automated image uploading, optimization, and CDN delivery.
* **Custom Admin Dashboard:** A centralized UI for managing posts, categories, user roles, and comment moderation.
* **SEO-Optimized Architecture:** Semantic HTML, clean URL slugs, and dynamic meta-tag injection for maximum search engine visibility.
* **Responsive Styling:** A custom-built UI using **Sass (SCSS)** and EJS, ensuring a premium brand experience across all devices.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Frontend** | EJS (Embedded JavaScript), Sass |
| **Database** | MongoDB Atlas |
| **Authentication** | Passport.js (Local Strategy) |
| **Media Storage** | Cloudinary (CDN) |
| **Hosting** | Railway |

---

## Architecture

The project follows a strict **MVC pattern** to ensure scalability:
- **Models:** Define the data schema for Users, Posts, and Comments using Mongoose.
- **Views:** Server-rendered EJS templates styled with modular SCSS.
- **Controllers:** Business logic handling authentication, media processing, and CRUD operations.

---

## Enginnering Highlights

### Secure File Handling
To prevent server bloat, images are never stored locally. They are intercepted by Multer, uploaded directly to Cloudinary, and only the resulting secure URL is stored in the MongoDB document.

### Production Security
The app utilizes express-session for persistent login states and implements security middleware to protect against common vulnerabilities like CSRF and NoSQL injection.

