import { Component, inject, OnInit, signal } from '@angular/core';
import { Categorie, Publication } from '../../models/publication';
import { PublicationService } from '../../services/publicationService';
import { AuthService } from '../../services/authService';
import { PublicationCard } from '../publication-card/publication-card';

@Component({
  selector: 'app-feed',
  imports: [PublicationCard],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class FeedComponent implements OnInit {
  private pubService = inject(PublicationService);
  private authService = inject(AuthService);

  categories = Object.values(Categorie);

  publications = signal<Publication[]>([]);
  isLoading = signal(false);
  currentFilter = signal<string>('ALL');

  currentUserId = 0;

  ngOnInit() {
    // 1. Get Logged In User ID (For Card ownership check)
    const user = this.authService.currentUser();
    if (user) this.currentUserId = user.id;

    // 2. Load Initial Data
    this.loadAll();
  }

  filter(cat: string | Categorie) {
    this.currentFilter.set(cat as string);
    if (cat === 'ALL') {
      this.loadAll();
    } else {
      this.loadByCategory(cat as Categorie);
    }
  }

  loadAll() {
    this.isLoading.set(true);
    this.pubService.getAllPublications().subscribe({
      next: (data) => {
        this.publications.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadByCategory(cat: Categorie) {
    this.isLoading.set(true);
    this.pubService.getPublicationsByCategorie(cat).subscribe({
      next: (data) => {
        this.publications.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  removePublication(id: number) {
    this.publications.update((list) => list.filter((p) => p.id !== id));
  }
}
