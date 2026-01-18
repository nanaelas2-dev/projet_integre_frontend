import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';
import { tap } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  // On utilise un Signal pour stocker l'état de l'utilisateur
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  login(credentials: any) {
    // on envoie une requete au backend, tap permet de d'effectuer une action (side effect), sans modifier
    // la donnée elle-meme.
    // Ici, on l'utilise pour mettre à jour notre signal, et sauvegarder l'info dans le localstorage
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((user) => {
        this.currentUser.set(user); // On met à jour le signal
        this.isAuthenticated.set(true);
        // On stocke le token ou les infos dans le localStorage
        localStorage.setItem('user_data', JSON.stringify(user));
      }),
    );
  }
}
