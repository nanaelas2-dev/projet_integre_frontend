import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Inscription } from './components/inscription/inscription';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'admin', component: AdminDashboard },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
