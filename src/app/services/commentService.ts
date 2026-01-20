import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commentaire, CommentaireRequest } from '../models/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  // Add comment
  addComment(request: CommentaireRequest): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.apiUrl}/commentaires`, request);
  }

  // Get comments for a publication
  getCommentsByPublication(publicationId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/publications/${publicationId}/commentaires`);
  }

  // Delete comment
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commentaires/${commentId}`);
  }
}
