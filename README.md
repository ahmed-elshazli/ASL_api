# 🏢 Real Estate Marketplace Backend

## 📌 Overview

**Real Estate Marketplace Backend** is a real estate management system built using:

- NestJS  
- MongoDB + Mongoose  
- JWT Authentication  
- Cloud Storage (Cloudinary / AWS S3)  
- Advanced Query Builder  

The system allows managing:

- 👤 Users  
- 🏗 Developers  
- 🏢 Projects  
- 🏠 Units  
- 🖼 Images Upload  

---

## 🚀 Features

### 👤 Authentication
- JWT Access Token
- Refresh Token support
- Role Based Authorization

---

### 🏗 Developers Management
- Create Developer  
- Update Developer  
- Delete Developer  
- Get Developers List  
- Search + Filter + Pagination  

---

### 🏢 Projects Management
Projects belong to Developers and support:
- Multiple images upload  
- Cascade image deletion  

---

### 🏠 Units Management
Units contain:

- Unit Code  
- Type  
- Purpose  
- Area  
- Phase  
- Floor  
- Apartment Number  
- Price  
- Status  
- Size (SQM)  
- Bedrooms  
- Bathrooms  
- Images  

---

### 🔎 Advanced Query System
Supports:

- Filtering  
- Searching  
- Sorting  
- Pagination  
- Field Selection  

---

## 🏗 Architecture
src/
├ auth
├ users
├ developers
├ projects
├ units
└ common
├ query-builder
├ storage


## 🔥 Technologies Used

- NestJS  
- MongoDB  
- Mongoose  
- JWT  
- Multer  
- Cloudinary / AWS S3  
- TypeScript  

---

## 📦 Installation

### Clone Project
```bash
git clone repository-url
cd project-name
npm install
npm run start:dev
