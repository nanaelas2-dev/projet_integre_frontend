import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public authService = inject(AuthService);

  handleLogout() {
    this.authService.logout();
  }
}
