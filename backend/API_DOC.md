# WapiBei Backend API — Mobile Integration Guide

Base URL (development): `http://localhost:5000`

Authentication
- Most protected endpoints require a Bearer JWT in `Authorization` header.
- Obtain token: POST `/api/auth/login` with `{ email, password }` -> returns `{ token, user }`.

Common headers
- `Authorization: Bearer <token>` (for protected routes)
- `Content-Type: application/json` for JSON bodies
- For file uploads use `multipart/form-data` and the provided `upload` middleware

Key endpoints

1) Auth
- POST `/api/auth/register` (multipart/form-data)
  - Fields: `email, password, nom, prenom, telephone, role, ville, pays` and optional `photo` file
  - Response: 201 with `{ message, userId, otp? }`

- POST `/api/auth/login` (application/json)
  - Body: `{ email, password }`
  - Response: `{ token, user }`

- POST `/api/auth/verify-otp` (application/json)
  - Body: `{ userId, code }` — verifies OTP and activates account

2) Products
- GET `/api/products`
  - Query: `page`, `limit`, `q` (search). If pagination/search present, response: `{ data: [...], total }`, otherwise array of products.
  - Product fields: `id, seller_id, nom/name, prix/price, quantity, unit, city, country, image, description, date`.

- GET `/api/products/:id` — product details (returns product and optional `seller` info).

- GET `/api/products/popularity?ids=1,2,3` — aggregated popularity metrics for multiple products (returns array of objects with `productId, sales, conversion, reviews, cartAdds, favorites, socialShares, restockCount`).

- GET `/api/products/:id/popularity` — aggregated metrics for single product.

3) Sellers
- GET `/api/sellers/:id` — seller profile (includes `products` and `boutique` if available).
- GET `/api/sellers/:id/products` — list products by seller.
- POST `/api/sellers/:id/products` (multipart/form-data) — create product (image upload supported).

4) Users
- GET `/api/users` (protected) — search users (`query` param)
- GET `/api/users/me/favorites` (protected) — returns `{ favorites: [productId,...] }`
- POST `/api/users/me/favorites` (protected) — body `{ favorites: [ids...] }` replaces list
- GET/POST `/api/users/me/privacy` (protected) — read/save privacy prefs

5) Messaging & Conversations
- GET `/api/conversations` (protected) — list conversations for user
- POST `/api/conversations` (protected) — create conversation `{ partner_id, title }`
- GET `/api/messages/:convId` (protected) — list messages for conversation
- POST `/api/messages` (protected) — create message (body fields include `conversationId, content, senderId?`, attachments optional)
- POST `/api/messages/upload` (protected, multipart) — upload attachment; returns `{ url }` (path under `/uploads/...`)

6) Notifications
- GET `/api/notifications` (protected) — list notifications for current user
- POST `/api/notifications` (protected) — create notification `{ userId, title, body, data }`

7) Testimonials
- GET `/api/testimonials` — public list of testimonials

File uploads & static files
- Uploaded files are served from backend at `/uploads`. Example: `http://localhost:5000/uploads/profile-photos/xyz.jpg`.
- Use `multipart/form-data` and the provided `upload` middleware for endpoints that accept files.

Notes for mobile developers
- Authentication: store JWT securely (secure storage / Keychain). Send `Authorization` header for protected requests.
- Pagination: frontend should use `page` and `limit` and handle `{ data, total }` when returned.
- Images: use full URL by prefixing with backend base, e.g. `${API_BASE}${product.image}`. If `image` field is already absolute, use as-is.
- Error handling: endpoints generally return JSON `{ message: 'Erreur ...' }` and proper HTTP status codes (401/403/404/500).
- Rate limits / retries: some aggregated endpoints may be heavy (popularity); cache results on mobile or call sparingly.

Example requests

Curl login
```
curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"secret"}'
```

Curl get products (search)
```
curl 'http://localhost:5000/api/products?page=1&limit=12&q=riz'
```

Fetching product image (mobile)
```
const imgUrl = `${API_BASE}${product.image}`; // e.g. http://localhost:5000/uploads/...
```

If you want, I can produce an OpenAPI (Swagger) spec file next, or add example SDK snippets (React Native fetch or Axios). Which one do you prefer? 


