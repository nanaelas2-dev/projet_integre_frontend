import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. On récupère les données de connexion stockées dans le navigateur
  const userData = localStorage.getItem('user_data');

  if (userData) {
    const user = JSON.parse(userData);

    // 2. On crée le badge "Basic Auth" (Email:Password encodé en Base64)
    // Note: btoa est une fonction JS native pour l'encodage
    const basicAuth = 'Basic ' + btoa(user.email + ':' + user.password);

    // 3. On clone la requête pour y ajouter le Header
    // (Les requêtes sont immuables, on ne peut pas les modifier directement)
    const authReq = req.clone({
      setHeaders: {
        Authorization: basicAuth,
      },
    });

    return next(authReq);
  }

  // Si pas de données, on laisse passer la requête telle quelle (ex: login, inscription)
  return next(req);
};
