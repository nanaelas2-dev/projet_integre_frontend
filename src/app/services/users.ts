import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private http = inject(HttpClient);

  register(userData: User) {
    // On envoie l'objet User complet au format JSON
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }
}
