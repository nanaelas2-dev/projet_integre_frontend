import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // On vérifie le signal d'authentification
  if (authService.isAuthenticated()) {
    return true;
  }

  // Sinon, dehors !
  return router.createUrlTree(['/login']);
};
