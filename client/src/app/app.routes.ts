import { Routes } from '@angular/router';
import { RegisterComponent } from './features/account/register/register.component';
import { LoginComponent } from './features/account/login/login.component';
import { ShopListComponent } from './features/shop/shop-list/shop-list.component';

export const routes: Routes = [
    { path: 'account/login', component: LoginComponent },
  { path: 'account/register', component: RegisterComponent },
  { path: 'shop', component: ShopListComponent },
  { path: '', redirectTo: 'shop', pathMatch: 'full' }
];
