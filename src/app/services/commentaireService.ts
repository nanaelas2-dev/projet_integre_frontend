import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commentaire, CreateCommentaireRequest } from '../models/commentaire';

@Injectable({
  providedIn: 'root'
})
export class CommentaireService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  getByPublication(idPublication: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/publications/${idPublication}/commentaires`);
  }

  create(request: CreateCommentaireRequest): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.apiUrl}/commentaires`, request);
  }

  delete(idCommentaire: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commentaires/${idCommentaire}`);
  }
}
