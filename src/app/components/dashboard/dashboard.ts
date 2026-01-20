import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/authService';
import { RouterLink } from '@angular/router';
import { PublicationCard } from '../publication-card/publication-card';
import { PublicationService } from '../../services/publicationService';
import { Publication } from '../../models/publication';
import { Chat } from '../chat/chat';
import { Friends } from '../friends/friends';
import { FriendService } from '../../services/friendService';
import { FeedComponent } from '../feed/feed';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, PublicationCard, Chat, Friends, FeedComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private pubService = inject(PublicationService);
  private authService = inject(AuthService);
  private friendService = inject(FriendService);

  // Signals
  publications = signal<Publication[]>([]);
  isLoading = signal(true);
  activeTab = signal<'profile' | 'feed'>('profile');

  // Expose auth service for template
  auth = this.authService;
  friends = this.friendService.friends;

  // Helper for template
  currentUserId = 0;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.currentUserId = user.id;
      this.loadPublications(user.id);
      this.friendService.loadFriends();
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

  setTab(tab: 'profile' | 'feed') {
    this.activeTab.set(tab);
  }

  // Handle the 'deleted' event from the child card
  removePublication(idToDelete: number) {
    this.publications.update((oldList) => oldList.filter((p) => p.id !== idToDelete));
  }

  logout() {
    this.authService.logout();
  }
}
