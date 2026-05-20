# CalmSkin Front-End

The customer-facing and administrative front-end web application for the **CalmSkin** e-commerce platform. 

[![Angular Version](https://img.shields.io/badge/Angular-21.2.0-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev/)
[![Tailwind CSS Version](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Bun Package Manager](https://img.shields.io/badge/Bun-Package_Manager-F9F1E7?style=flat-square&logo=bun&logoColor=black)](https://bun.sh/)

---

## Overview

CalmSkin-fe is a modern skincare e-commerce client interface built with **Angular 21** Standalone architecture and **Tailwind CSS v4**. It uses **Angular Signals** for local and shared state management, providing a fast and responsive user experience. The application serves two primary user paths: a public customer storefront and a dedicated back-office administration panel.

---

## Features

### 🛍️ 1. Customer Storefront
* **Product Catalog:** Browse skincare products sorted by skin types or categories (e.g., acne care, anti-aging, sensitive skin).
* **SEO-friendly Routing:** Clean URL paths utilizing route parameters and product slugs (e.g., `/products/tinh-chat-phuc-hoi-da-nhay-cam`).
* **Reactive Shopping Cart:** Built using Angular Signals to compute totals, taxes, and quantities instantly without manual page refreshes.
* **Checkout Workflow:** Shipping address form with validation, integration with user address books, and order placement sequence.
* **User Profile & Loyalty Tracking:**
  * Member tier tracking with dynamic progress bars.
  * Point ledgers showing detailed point accretion and usage history.
  * Dynamic address book management (add, edit, delete, and set default shipping addresses).
* **Bilingual Localization (i18n):** Complete Vietnamese (`vi`) and English (`en`) support driven by a custom `LanguageService` with local storage persistence.

### 🛡️ 2. Security & Core Services
* **Route Protection:** Guards (`authGuard` and `adminGuard`) protect private customer pages and administrative panels from unauthorized access.
* **Token Interceptor:** An HTTP interceptor automatically appends JWT tokens to outgoing requests targeting the backend microservices.

### 📊 3. Administrative Portal (Back-Office)
A high-contrast workspace layout designed specifically for business operations:
* **Dashboard:** Visual representation of orders, inventory levels, and transactional summaries.
* **Product CRUD:** Management interface to create, update, delete, and upload metadata for skincare items.
* **Order Approval Pipeline:** Interface to review, approve, or transition order statuses.
* **Stock Control:** Direct interface with the inventory service to adjust stock levels and monitor depletion thresholds.

---

## Technology Stack

* **Framework:** Angular 21.2.0 (Standalone Components, Routing, reactive Signals)
* **Styling:** Tailwind CSS v4.0 (Utility-first compilation and modern variables)
* **Reactivity:** RxJS v7.8 for asynchronous API operations
* **Testing:** Vitest v4.0 for fast unit and component testing
* **Package Manager:** Bun / NPM


## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (`>= 20.x`) or [Bun](https://bun.sh/) (`>= 1.1`) installed.

### 1. Install Dependencies
```bash
# Clone the repository
git clone https://github.com/Lakeserl/CalmSkin-fe.git
cd CalmSkin-fe

# Install packages using npm
npm install

# Or using bun
bun install
```

### 2. Start Development Server
Run the local dev server at `http://localhost:4200/`:
```bash
npm run start

# Or using bun
bun run start
```

### 3. Run Tests
Execute the unit test suites with Vitest:
```bash
npm run test

# Or using bun
bun run test
```

### 4. Build for Production
Compile the project assets to the `dist/` directory:
```bash
npm run build

# Or using bun
bun run build
```


