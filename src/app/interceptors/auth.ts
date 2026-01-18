import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: authToken,
      },
    });

    return next(authReq);
  }

  // Si pas de données, on laisse passer la requête telle quelle (ex: login, inscription)
  return next(req);
};
