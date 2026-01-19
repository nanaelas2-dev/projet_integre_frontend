import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/authService';
import { RouterLink } from '@angular/router';
import { PublicationCard } from '../publication-card/publication-card';
import { PublicationService } from '../../services/publicationService';
import { Publication } from '../../models/publication';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, PublicationCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private pubService = inject(PublicationService);
  private authService = inject(AuthService);

  // Signals
  publications = signal<Publication[]>([]);
  isLoading = signal(true);

  // Helper for template
  currentUserId = 0;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.currentUserId = user.id;
      this.loadPublications(user.id);
    }
  }

  loadPublications(userId: number) {
    this.pubService.getByUser(userId).subscribe({
      next: (data) => {
        this.publications.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  // Handle the 'deleted' event from the child card
  removePublication(idToDelete: number) {
    // Filter the array signal to remove the deleted ID
    // "Keep every publication where the ID is NOT the one we just deleted"
    // This avoids the call of the full reload with loadPublications
    this.publications.update((oldList) => oldList.filter((p) => p.id !== idToDelete));
  }
}
