# 🏋️ GearUp

**A full-stack multi-vendor e-commerce marketplace for sports gear and equipment.**

GearUp connects independent vendors with customers looking for quality sports equipment, apparel, and accessories — all under one platform, with a full admin moderation workflow, real-time notifications, and secure payment processing.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [User Roles & Workflow](#-user-roles--workflow)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## 🎯 Overview

GearUp is a production-style e-commerce platform built to demonstrate a complete, real-world application architecture — from a normalized relational database and a secure, role-based API, to a responsive single-page frontend with a full checkout and payment flow.

Unlike a typical single-vendor storefront, GearUp is built as a **marketplace**: any registered vendor can list products, which go through an admin approval workflow before appearing in the public store. Admins retain full oversight of products, orders, and platform activity through a dedicated analytics dashboard.

---

## ✨ Key Features

### 🛍️ Storefront
- Product catalog with search, multi-select filtering (brand/type), sorting, and pagination
- Product detail pages with live stock availability
- Persistent shopping cart (works for guests and logged-in users)
- Coupon/promo code support via Stripe

### 🔐 Accounts & Security
- Cookie-based authentication with ASP.NET Core Identity
- Role-based access control (**Customer**, **Vendor**, **Admin**)
- Route guards on the frontend enforcing role-based navigation
- Server-side authorization enforced independently of the UI

### 💳 Checkout & Payments
- Multi-step checkout (address → delivery → review → payment)
- Real Stripe integration using Stripe Elements (PCI-compliant, card data never touches the server)
- Stripe Webhooks for authoritative payment confirmation
- Automatic stock deduction and cart clearing on successful order

### 🏪 Vendor Dashboard
- Vendors manage their own product listings (create, edit, delete)
- Live status tracking: Pending / Approved / Rejected
- Product image upload with preview

### 🛠️ Admin Dashboard
- Platform-wide analytics: revenue, orders, products, vendors
- Interactive revenue chart (Chart.js)
- Product moderation queue (approve / reject / suspend)
- Full order management with refund capability
- Product and order search & filtering

### 🔔 Real-Time
- Live order confirmation notifications via SignalR (no page refresh needed)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **ASP.NET Core 9 (.NET)** | Web API |
| **Entity Framework Core** | ORM / Data access |
| **SQL Server** | Relational database |
| **ASP.NET Core Identity** | Authentication (cookie-based) |
| **Redis** | Shopping cart storage & response caching |
| **Stripe.net** | Payments, coupons, webhooks |
| **SignalR** | Real-time notifications |
| **Specification Pattern + Generic Repository** | Clean, reusable data querying |

### Frontend
| Technology | Purpose |
|---|---|
| **Angular 19** | SPA framework (standalone components, signals) |
| **Tailwind CSS v4** | Utility-first styling |
| **RxJS** | Reactive state & HTTP handling |
| **Stripe.js** | Client-side payment collection |
| **Chart.js** | Admin analytics visualization |
| **@microsoft/signalr** | Real-time client connection |

### Architecture Pattern
**Clean Architecture** — the backend is split into three layers with a strict dependency rule (outer layers depend on inner layers, never the reverse):

```
Core            → Entities, Interfaces, Specifications (no external dependencies)
Infrastructure  → Data access, EF Core, Redis, Stripe, file/blob services
API             → Controllers, DTOs, Middleware, SignalR hubs
```

---

## 🏗️ Architecture

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│   Angular SPA    │ ────────────────────────▶│    ASP.NET Core API   │
│  (Tailwind CSS)   │◀──────────────────────── │   (Clean Architecture) │
└─────────────────┘      Cookie Auth          └───────────┬───────────┘
                                                            │
                        ┌───────────────────────────────────┼───────────────────────┐
                        ▼                                    ▼                       ▼
                ┌───────────────┐                  ┌─────────────────┐     ┌─────────────────┐
                │   SQL Server   │                  │      Redis       │     │  Stripe API      │
                │ (Products,     │                  │ (Cart storage,   │     │ (Payments,       │
                │  Orders, Users)│                  │  Response cache)  │     │  Coupons,        │
                └───────────────┘                  └─────────────────┘     │  Webhooks)        │
                                                                              └─────────────────┘
```

---

## 📁 Project Structure

```
GearUp/
├── GearUp.Core/              # Entities, interfaces, specifications — no external dependencies
│   ├── Entities/
│   ├── Interfaces/
│   └── Specifications/
│
├── GearUp.Infrastructure/    # Data access, external service implementations
│   ├── Data/                 # DbContext, migrations, seed data
│   └── Services/             # CartService, PaymentService, CouponService...
│
├── GearUp.API/                # Presentation layer
│   ├── Controllers/
│   ├── DTOs/
│   ├── Extensions/
│   ├── Middleware/
│   └── SignalR/
│
└── client/                   # Angular frontend
    └── src/app/
        ├── core/              # Guards, interceptors, models, shared services
        ├── shared/            # Reusable UI components (spinner, dialogs, pipes)
        ├── layout/            # Header, footer
        └── features/          # Feature modules: shop, cart, checkout, account,
                                # orders, vendor, admin
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS) & Angular CLI
- SQL Server (LocalDB or full instance)
- Redis (locally via Docker/Memurai, or a cloud instance)
- A [Stripe](https://stripe.com) account (test mode is sufficient)

### Backend Setup

```bash
cd GearUp.API

# Configure your connection strings and Stripe keys
# in appsettings.Development.json (see Environment Variables below)

dotnet ef database update -p ../GearUp.Infrastructure -s .
dotnet run
```

The API will be available at `https://localhost:{port}` with Swagger UI at `/swagger`.

### Frontend Setup

```bash
cd client
npm install
ng serve
```

The app will be available at `http://localhost:4200`.

### Stripe Webhooks (local development)

```bash
stripe login
stripe listen --forward-to https://localhost:{port}/api/payments/webhook
```

---

## 🔑 Environment Variables

**Backend** (`appsettings.Development.json`):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=GearUpDb;...",
    "Redis": "localhost:6379"
  },
  "StripeSettings": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_...",
    "WhSecret": "whsec_..."
  }
}
```

**Frontend** (`src/environments/environment.development.ts`):

```typescript
export const environment = {
  production: false,
  baseUrl: 'https://localhost:{port}/api',
  apiBaseUrl: 'https://localhost:{port}',
  stripePublicKey: 'pk_test_...'
};
```

---

## 👥 User Roles & Workflow

| Role | Capabilities |
|---|---|
| **Customer** | Browse products, manage cart, checkout, view order history |
| **Vendor** | All customer capabilities, plus: manage own product listings via a dedicated dashboard |
| **Admin** | Full platform oversight: approve/reject/suspend products, view all orders, issue refunds, view revenue analytics, publish official store products |

**Product lifecycle:**
```
Vendor creates product → Status: Pending
        ↓
Admin reviews in dashboard
        ↓
   Approve ──────────▶ Status: Approved → visible in public store
   Reject  ──────────▶ Status: Rejected → hidden, vendor notified via dashboard
```

**Order lifecycle:**
```
Cart → Checkout → Stripe Payment Intent created
        ↓
Payment confirmed (verified server-side against Stripe)
        ↓
Order created (Status: PaymentReceived) → Stock deducted → Cart cleared
        ↓
Stripe Webhook (safety net, in case client confirmation is interrupted)
```

---

## 📸 Screenshots

> _Add screenshots of the storefront, product details, checkout flow, vendor dashboard, and admin dashboard here before publishing._

---

## 🔮 Future Improvements

- Product reviews & ratings
- Wishlist / favorites
- Email notifications (order confirmation, vendor approval)
- Advanced price-range filtering
- Multi-image product galleries
- Full CI/CD pipeline with automated tests
- Cloud deployment (Azure App Service + Azure SQL + Blob Storage + Vercel)

---

## 📄 License

This project was built for educational/portfolio purposes.

---

## 👤 Author

Built with ❤️ as a full-stack learning project covering Clean Architecture, real payment integration, and multi-role e-commerce workflows end-to-end.
