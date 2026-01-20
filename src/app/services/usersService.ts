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

  // Récupérer les chercheuses en attente
  getPendingUsers() {
    return this.http.get<User[]>(`${environment.apiUrl}/admin/pending`);
  }

  // Approuver une chercheuse (On utilise PUT pour une modification)
  approveUser(userId: number) {
    return this.http.put(`${environment.apiUrl}/admin/approve/${userId}`, {});
  }

  // Rejeter une chercheuse (On utilise DELETE pour la supprimer)
  rejectUser(userId: number) {
    return this.http.delete(`${environment.apiUrl}/admin/reject/${userId}`);
  }

  // Get all users for chat
  getAllUsers() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }
}
