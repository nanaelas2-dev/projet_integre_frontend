import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService';

// Prevents logged-in users from entering public pages (Login/Register)
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user IS logged in, we kick them OUT of the login page
  if (authService.isAuthenticated()) {
    const user = authService.currentUser();
    if (user?.role === 'ADMINISTRATEUR') {
      return router.createUrlTree(['/admin']);
    }

    // Default redirect
    return router.createUrlTree(['/dashboard']);
  }

  // If not logged in, allow them to see the login page
  return true;
};
