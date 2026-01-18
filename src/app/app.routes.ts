import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Inscription } from './components/inscription/inscription';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'admin', component: AdminDashboard },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Zone Membres (Protégée par Auth)
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },

  // Zone Admin (Protégée par Auth ET Admin)
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, adminGuard],
  },
];
