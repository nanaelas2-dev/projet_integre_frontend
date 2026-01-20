import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Categorie, Publication, PublicationRequest } from '../models/publication';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/publications';

  createPublication(request: PublicationRequest): Observable<Publication> {
    // Create the FormData object
    const formData = new FormData();

    // Append simple fields
    formData.append('utilisatriceId', request.utilisatriceId.toString());
    formData.append('description', request.description);
    formData.append('categorie', request.categorie);

    //  Append the File (if it exists)
    if (request.fichier) {
      formData.append('file', request.fichier);
    }

    // Append the Link (if it exists)
    if (request.lien) {
      formData.append('lien', request.lien);
    }

    return this.http.post<Publication>(this.apiUrl, formData);
  }

  // Get All Publications (For the Feed)
  getAllPublications(): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.apiUrl);
  }

  // Get by Category (For Feed Filters)
  getPublicationsByCategorie(categorie: Categorie): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}/categorie/${categorie}`);
  }

  // Get only the logged-in user's publications for dashboard
  getByUser(userId: number): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}/utilisatrice/${userId}`);
  }

  // Update
  updatePublication(id: number, request: PublicationRequest): Observable<Publication> {
    return this.http.put<Publication>(`${this.apiUrl}/${id}`, request);
  }

  // Delete
  deletePublication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
