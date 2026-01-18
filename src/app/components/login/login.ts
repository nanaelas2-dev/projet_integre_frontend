import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  handleLogin() {
    if (this.loginForm.valid) {
      // On s'abonne à l'Observable pour déclencher la requête
      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          console.log('Connexion réussie !', user);

          // Redirection intelligente selon le rôle calculé par le signal
          if (user.role === "ADMINISTRATEUR") {
            this.router.navigateByUrl('/admin');
          } else {
            this.router.navigateByUrl('/dashboard');
          }
        },
        error: (err) => {
          console.error('Erreur de connexion', err);
          alert('Identifiants incorrects ou compte non validé.');
        },
      });
    }
  }
}
