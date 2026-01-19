import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Inscription } from './components/inscription/inscription';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/authGuard';
import { adminGuard } from './guards/adminGuard';
import { guestGuard } from './guards/guestGuard';
import { Chat } from './components/chat/chat';
import { PublicationCreate } from './components/publication-create/publication-create';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Zone Public
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'inscription',
    component: Inscription,
    canActivate: [guestGuard],
  },

  // Zone Membres
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'publications/add',
    component: PublicationCreate,
    canActivate: [authGuard],
  },
  {
    path: 'chat',
    component: Chat,
    canActivate: [authGuard],
  },

  // Zone Admin
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, adminGuard],
  },
];
