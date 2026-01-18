import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Users } from '../../services/usersService';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription {
  private fb = inject(FormBuilder);
  private usersService = inject(Users);
  private router = inject(Router);

  registerForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telephone: ['', Validators.pattern('^[0-9]{10}$')], // Validation format tel
    cin: ['', Validators.required],
    description: [''],
  });

  handleRegister() {
    if (this.registerForm.valid) {
      this.usersService.register(this.registerForm.value as any).subscribe({
        next: () => {
          alert('Inscription envoyée ! Un admin doit valider votre profil.');
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          console.error(err);
          alert("Erreur lors de l'inscription.");
        },
      });
    }
  }
}
