import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Inscription } from './components/inscription/inscription';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
