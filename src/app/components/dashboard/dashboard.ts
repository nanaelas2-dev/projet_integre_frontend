import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authService';
import { Chat } from '../chat/chat';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [Chat, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public authService = inject(AuthService);

  handleLogout() {
    this.authService.logout();
  }
}
