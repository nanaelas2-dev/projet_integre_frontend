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
      const currentUser = this.authService.currentUser();

      if (!currentUser) {
        alert('Erreur: Utilisateur non connecté');
        return;
      }

      const formValue = this.pubForm.value;

      const request: PublicationRequest = {
        utilisatriceId: currentUser.id,
        description: formValue.description!.trim(),
        categorie: formValue.categorie as Categorie,
        fichier: this.selectedFile(),
        lien: formValue.lien || null,
      };

      console.log('Sending publication request:', JSON.stringify(request));

      this.publicationService.createPublication(request).subscribe({
        next: (response) => {
          console.log('Publication created:', response);
          alert('Publication ajoutée avec succès !');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error creating publication:', err);
          alert(`Erreur lors de la création: ${err.status} - ${err.error?.message || err.message || 'Unknown error'}`);
        },
      });
    }
  }
}
