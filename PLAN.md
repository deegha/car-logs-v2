# Used Cars Listing — Build Plan

---

## Phase 1 — Database Schema

### Models

#### Seller

The person who lists a car. Has their own account.

| Field        | Type     | Notes                  |
| ------------ | -------- | ---------------------- |
| id           | Int PK   | Auto-increment         |
| firstName    | String   |                        |
| lastName     | String   |                        |
| email        | String   | Unique, used to log in |
| phone        | String   | Contact number         |
| passwordHash | String   | bcrypt hash            |
| status       | Enum     | ACTIVE \| SUSPENDED    |
| cars         | Car[]    | Relation               |
| createdAt    | DateTime |                        |
| updatedAt    | DateTime |                        |

#### Car

A vehicle listing submitted by a seller.

| Field        | Type       | Notes                                                   |
| ------------ | ---------- | ------------------------------------------------------- |
| id           | Int PK     |                                                         |
| title        | String     | Listing headline e.g. "2022 Camry XSE – 1 Owner"        |
| make         | String     | e.g. Toyota                                             |
| model        | String     | e.g. Camry                                              |
| year         | Int        | Manufacture year                                        |
| price        | Decimal    | Asking price                                            |
| mileage      | Int        | In kilometres                                           |
| color        | String?    |                                                         |
| fuelType     | Enum       | PETROL \| DIESEL \| HYBRID \| ELECTRIC \| PLUGIN_HYBRID |
| transmission | Enum       | AUTOMATIC \| MANUAL \| CVT                              |
| bodyType     | String?    | Sedan, SUV, Hatchback, Ute, etc.                        |
| engineSize   | String?    | e.g. "2.5L"                                             |
| description  | Text?      | Free text                                               |
| status       | Enum       | PENDING \| AVAILABLE \| SOLD \| RESERVED \| REJECTED    |
| featured     | Boolean    | Admin can pin to homepage                               |
| sellerId     | Int FK     | → Seller                                                |
| images       | CarImage[] | Relation                                                |
| createdAt    | DateTime   |                                                         |
| updatedAt    | DateTime   |                                                         |

Indexes: (make, model), year, price, status, sellerId

#### CarImage

| Field     | Type     | Notes                  |
| --------- | -------- | ---------------------- |
| id        | Int PK   |                        |
| url       | String   | Uploaded image URL     |
| alt       | String?  |                        |
| isPrimary | Boolean  | First/cover image      |
| order     | Int      | Display order          |
| carId     | Int FK   | → Car (cascade delete) |
| createdAt | DateTime |                        |

#### Admin

Separate table for admin users. No overlap with sellers.

| Field        | Type     | Notes       |
| ------------ | -------- | ----------- |
| id           | Int PK   |             |
| email        | String   | Unique      |
| passwordHash | String   | bcrypt hash |
| createdAt    | DateTime |             |

### Enums

```
CarStatus:    PENDING | AVAILABLE | SOLD | RESERVED | REJECTED
SellerStatus: ACTIVE | SUSPENDED
FuelType:     PETROL | DIESEL | HYBRID | ELECTRIC | PLUGIN_HYBRID
Transmission: AUTOMATIC | MANUAL | CVT
```

### Migration Steps

1. Update `prisma/schema.prisma` with all models above
2. `docker compose up -d` — start MySQL
3. `npm run db:migrate` — apply migration
4. `npm run db:seed` — create the first admin account

---

## Phase 2 — API Routes

### Public (no auth)

| Method | Path           | What it does                                                                                                       |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| GET    | /api/cars      | List AVAILABLE cars. Query params: `search`, `make`, `model`, `minYear`, `maxYear`, `minPrice`, `maxPrice`, `page` |
| GET    | /api/cars/[id] | Single car detail (AVAILABLE only)                                                                                 |

### Seller Auth

| Method | Path               | What it does               |
| ------ | ------------------ | -------------------------- |
| POST   | /api/auth/register | Create seller account      |
| POST   | /api/auth/login    | Set session cookie         |
| DELETE | /api/auth/logout   | Clear session cookie       |
| GET    | /api/auth/me       | Return current seller info |

### Seller (requires seller session)

| Method | Path                  | What it does                        |
| ------ | --------------------- | ----------------------------------- |
| POST   | /api/cars             | Submit a new listing (→ PENDING)    |
| GET    | /api/seller/cars      | List own cars (all statuses)        |
| PATCH  | /api/seller/cars/[id] | Edit own listing (if still PENDING) |
| DELETE | /api/seller/cars/[id] | Delete own listing                  |

### Admin Auth

| Method | Path                   | What it does        |
| ------ | ---------------------- | ------------------- |
| POST   | /api/admin/auth/login  | Set admin session   |
| DELETE | /api/admin/auth/logout | Clear admin session |

### Admin (requires admin session)

| Method | Path                    | What it does                               |
| ------ | ----------------------- | ------------------------------------------ |
| GET    | /api/admin/cars         | All cars, all statuses, filterable         |
| PATCH  | /api/admin/cars/[id]    | Approve / reject / feature / update status |
| DELETE | /api/admin/cars/[id]    | Hard delete                                |
| GET    | /api/admin/sellers      | All sellers                                |
| PATCH  | /api/admin/sellers/[id] | Suspend / re-activate seller               |

---

## Phase 3 — Components

### UI Primitives (`src/components/ui/`)

Small, fully theme-aware building blocks.

| Component | Purpose                                         |
| --------- | ----------------------------------------------- |
| Button    | Primary / secondary / ghost / danger variants   |
| Input     | Text input with label, helper text, error state |
| Select    | Styled dropdown                                 |
| Textarea  | Multi-line input                                |
| Badge     | Small coloured chip (status, fuel type, etc.)   |
| Spinner   | Loading indicator                               |
| FormField | Wrapper: label + input + error message          |

### Layout Components (`src/components/layout/`)

| Component | Purpose                                                  |
| --------- | -------------------------------------------------------- |
| Header    | Logo, main nav, search bar, Login / "My Listings" button |
| Footer    | Links, copyright                                         |

### Car Components (`src/components/cars/`)

| Component       | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| CarCard         | Grid card — cover image, title, price, make/year/km badges  |
| CarGrid         | Responsive grid wrapper, handles empty & loading states     |
| CarImageGallery | Large main image + scrollable thumbnail strip               |
| CarSpecsTable   | Key specs in a two-column table (fuel, trans, engine, etc.) |
| StatusBadge     | Colour-coded pill per CarStatus                             |

### Search & Filter Components (`src/components/filters/`)

| Component   | Purpose                                                  |
| ----------- | -------------------------------------------------------- |
| SearchBar   | Controlled input, submits to /cars?search=               |
| FilterPanel | Sidebar/drawer: make, model, year range, price range     |
| FilterChips | Active filter pills shown above results, click to remove |

### Seller Components (`src/components/seller/`)

| Component      | Purpose                                        |
| -------------- | ---------------------------------------------- |
| AddCarForm     | Multi-step: Details → Specs → Images → Review  |
| SellerCarCard  | Like CarCard but with Edit / Delete actions    |
| SellerCarTable | Compact table view of own listings with status |

### Auth Components (`src/components/auth/`)

| Component    | Purpose                                       |
| ------------ | --------------------------------------------- |
| LoginForm    | Email + password, error display               |
| RegisterForm | First name, last name, email, phone, password |

### Admin Components (`src/components/admin/`)

| Component        | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| AdminCarTable    | All listings, sortable, with Approve/Reject/Delete |
| AdminSellerTable | All sellers with Suspend/Activate                  |
| AdminNav         | Sidebar nav for admin section                      |

---

## Phase 4 — Pages

```
src/app/
│
├── page.tsx
│   Home — hero with search bar, featured listings grid, stats strip
│
├── cars/
│   ├── page.tsx
│   │   Listings — FilterPanel (sidebar) + SearchBar + CarGrid + Pagination
│   │   URL params: ?search= &make= &model= &minYear= &maxYear= &minPrice= &maxPrice= &page=
│   │
│   └── [id]/
│       └── page.tsx
│           Car Detail — CarImageGallery, full specs, description,
│                        seller contact info, related listings
│
├── sell/
│   └── page.tsx
│       Add Your Car — AddCarForm (redirects to /auth/login if not logged in),
│                      success screen showing "pending approval"
│
├── auth/
│   ├── login/
│   │   └── page.tsx      Seller login — LoginForm, link to register
│   └── register/
│       └── page.tsx      Seller registration — RegisterForm (firstName, lastName,
│                                                email, phone, password)
│
├── seller/
│   ├── layout.tsx         Checks seller session → redirects to /auth/login if missing
│   │
│   └── dashboard/
│       └── page.tsx       Seller home — greeting, SellerCarTable (own listings),
│                                        "Add New Listing" button
│
└── admin/
    ├── layout.tsx          Checks admin session → redirects to /admin/login if missing
    │
    ├── login/
    │   └── page.tsx        Admin login form
    │
    └── dashboard/
        ├── page.tsx        Overview — counts by status, recent pending listings
        ├── listings/
        │   └── page.tsx    AdminCarTable — all cars, filter by status, approve/reject/delete
        └── sellers/
            └── page.tsx    AdminSellerTable — all sellers, suspend/activate
```

---

## Phase 5 — Auth & Middleware

- **Sessions**: HTTP-only cookie holding a signed JWT (no external library — built with the
  Node.js `crypto` module or `jose`).
- **Middleware** (`src/middleware.ts`): Intercepts `/seller/*` and `/admin/*` routes.
  Reads cookie, verifies JWT, redirects if invalid.
- **Two separate session types**: seller session and admin session (different JWT claims).

---

## Build Order

```
Step  1  — Update Prisma schema (Seller + Admin models, updated Car, new enums)
Step  2  — Run migration + write seed script for admin user
Step  3  — Auth utilities: hash password, sign/verify JWT, set/read cookie
Step  4  — Middleware: protect /seller/* and /admin/* routes
Step  5  — API: seller auth (register, login, logout, me)
Step  6  — API: admin auth (login, logout)
Step  7  — API: public car routes (list with filters+search, single)
Step  8  — API: seller car routes (create, list own, edit, delete)
Step  9  — API: admin car routes (list all, approve/reject, delete)
Step 10  — API: admin seller routes (list all, suspend/activate)
Step 11  — UI primitives (Button, Input, Select, Textarea, Badge, Spinner, FormField)
Step 12  — Header + Footer
Step 13  — CarCard + CarGrid + StatusBadge
Step 14  — FilterPanel + SearchBar + FilterChips
Step 15  — Listings page /cars (with all filters wired up)
Step 16  — Car detail page /cars/[id]
Step 17  — Seller auth pages /auth/login and /auth/register
Step 18  — Seller dashboard /seller/dashboard
Step 19  — Add listing page /sell (AddCarForm, multi-step)
Step 20  — Admin login /admin/login
Step 21  — Admin dashboard /admin/dashboard
Step 22  — Admin listings /admin/dashboard/listings
Step 23  — Admin sellers /admin/dashboard/sellers
```

---

## File Structure (final)

```
used-cars-listing/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── cars/
│   │   ├── sell/
│   │   ├── auth/
│   │   ├── seller/
│   │   └── admin/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── cars/
│   │   ├── filters/
│   │   ├── seller/
│   │   ├── auth/
│   │   └── admin/
│   ├── config/
│   │   └── theme.ts
│   ├── lib/
│   │   ├── db.ts          (Prisma singleton)
│   │   └── auth.ts        (JWT sign/verify, password hash)
│   ├── middleware.ts
│   ├── styles/
│   │   └── themes/
│   │       ├── default.css
│   │       ├── midnight.css
│   │       └── sport.css
│   ├── types/
│   │   └── index.ts       (shared TypeScript types)
│   └── generated/
│       └── prisma/        (auto-generated, gitignored)
├── docker-compose.yml
├── .env
├── .env.example
├── .prettierrc
├── PLAN.md                ← this file
└── package.json
```
