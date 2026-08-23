import { Routes } from '@angular/router';
import { RegisterComponent } from './features/account/register/register.component';
import { LoginComponent } from './features/account/login/login.component';
import { ShopListComponent } from './features/shop/shop-list/shop-list.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';
import { ProductFormComponent } from './features/shop/product-form/product-form.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
   { path: '', redirectTo: '/shop', pathMatch: 'full' },

  { path: 'shop', component: ShopListComponent },
  { path: 'shop/:id', component: ProductDetailsComponent },

  { path: 'products/new', component: ProductFormComponent, canActivate: [authGuard] },
{ path: 'products/edit/:id', component: ProductFormComponent, canActivate: [authGuard] },

  { path: 'account/login', component: LoginComponent },
  { path: 'account/register', component: RegisterComponent },
];
