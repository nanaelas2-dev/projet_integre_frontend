import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';
import { tap } from 'rxjs';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // On utilise un Signal pour stocker l'état de l'utilisateur
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Restore state immediately when service starts
    this.restoreSession();
  }

  private restoreSession() {
    const storedUser = localStorage.getItem('user_data');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        // If data is corrupted, clear it
        this.logout();
      }
    }
  }

  login(credentials: any) {
    // On fabrique le badge manuellement pour cette PREMIÈRE requête
    // Note : credentials contient {email: "...", password: "..."} venant du formulaire
    const basicAuth = 'Basic ' + btoa(credentials.email + ':' + credentials.password);

    const headers = new HttpHeaders({
      Authorization: basicAuth,
    });

    // on envoie une requete au backend, tap permet de d'effectuer une action (side effect), sans modifier
    // la donnée elle-meme.
    // Ici, on l'utilise pour mettre à jour notre signal, et sauvegarder l'info dans le localstorage
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, {}, { headers }).pipe(
      tap((user) => {
        this.currentUser.set(user); // On met à jour le signal
        this.isAuthenticated.set(true);

        // 2. On stocke UNIQUEMENT le badge crypté
        localStorage.setItem('auth_token', basicAuth);
        // On stocke le token ou les infos dans le localStorage
        localStorage.setItem('user_data', JSON.stringify(user));
      }),
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
