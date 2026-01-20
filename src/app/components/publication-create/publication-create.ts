import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicationService } from '../../services/publicationService';
import { Router, RouterLink } from '@angular/router';
import { Categorie, PublicationRequest } from '../../models/publication';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-publication-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './publication-create.html',
  styleUrl: './publication-create.css',
})
export class PublicationCreate {
  private fb = inject(FormBuilder);
  private publicationService = inject(PublicationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Convert Enum to Array
  categories = Object.values(Categorie);

  // Initialize Form
  pubForm = this.fb.group({
    categorie: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    lien: [''],
  });

  // Signals for UI Logic
  mode = signal<'FILE' | 'LINK'>('FILE'); // Track which tab is open
  selectedFile = signal<File | null>(null);

  setMode(mode: 'FILE' | 'LINK') {
    this.mode.set(mode);
    // Reset data when switching tabs so we don't send both
    if (mode === 'FILE') this.pubForm.patchValue({ lien: '' });
    if (mode === 'LINK') this.selectedFile.set(null);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  onSubmit() {
    if (this.pubForm.valid) {
      // used non-null assertion (!), to mention to type script that i already checked that the user cannot be null
      // because we check for authentification with the authGuard
      const currentUser = this.authService.currentUser()!;

      const formValue = this.pubForm.value;

      const request: PublicationRequest = {
        utilisatriceId: currentUser.id,
        description: formValue.description!,
        categorie: formValue.categorie as Categorie,
        fichier: this.selectedFile(),
        lien: formValue.lien || null,
      };

      this.publicationService.createPublication(request).subscribe({
        next: () => {
          alert('Publication ajoutée avec succès !');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la création.');
        },
      });
    }
  }
}
