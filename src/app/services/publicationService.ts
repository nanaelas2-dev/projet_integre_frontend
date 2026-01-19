import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Publication, PublicationRequest } from '../models/publication';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/publications';

  createPublication(request: PublicationRequest): Observable<Publication> {
    return this.http.post<Publication>(this.apiUrl, request);
  }
}
