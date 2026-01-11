import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./components/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-orders/:id',
    loadComponent: () => import('./components/my-order-details/my-order-details.component').then(m => m.MyOrderDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'products',
        loadComponent: () => import('./components/admin/products/products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./components/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./components/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/admin/categories/categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'categories/new',
        loadComponent: () => import('./components/admin/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () => import('./components/admin/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'purchase-orders',
        loadComponent: () => import('./components/admin/purchase-orders/purchase-orders.component').then(m => m.AdminPurchaseOrdersComponent)
      },
      {
        path: 'purchase-orders/:id',
        loadComponent: () => import('./components/admin/purchase-order-details/purchase-order-details.component').then(m => m.PurchaseOrderDetailsComponent)
      },
      {
        path: '',
        redirectTo: '/admin/products',
        pathMatch: 'full'
      }
    ]
  }
];
