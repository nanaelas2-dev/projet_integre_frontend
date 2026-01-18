import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // On récupère l'utilisateur courant depuis le signal
  const user = authService.currentUser();

  // On vérifie le rôle
  if (user && user.role === 'ADMINISTRATEUR') {
    return true;
  }

  // Si pas admin, on redirige vers le dashboard standard
  alert('Accès refusé : Zone réservée aux administrateurs.');
  return router.createUrlTree(['/dashboard']);
};
