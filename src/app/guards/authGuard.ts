import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService';

// Prevents anonymous users from entering private pages without being logged in.
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // On vérifie le signal d'authentification
  if (authService.isAuthenticated()) {
    return true;
  }

  // Sinon, dehors !
  return router.createUrlTree(['/login']);
};
