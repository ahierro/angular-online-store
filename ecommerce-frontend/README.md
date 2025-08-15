# Ecommerce Frontend (Angular 18)

- Start backend API: `http://localhost:8080` (see repo: https://github.com/ahierro/simple-online-store-java)
- Dev server: `npm start` at `http://localhost:4200`
- Proxy: All `/api` calls are proxied to `http://localhost:8080`

Features
- Login (JWT). Roles: ADMIN, normal user
- Products: browse, search, filter by category, detail
- Admin: CRUD categories and products
- Orders: user can create purchase orders from cart; admin can patch status

Commands
- Install: `npm i`
- Start: `npm start`
- Build prod: `npm run build`