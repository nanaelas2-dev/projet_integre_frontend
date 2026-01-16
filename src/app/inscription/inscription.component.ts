import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {UsersService} from "../services/users.service";

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.css'
})
export class InscriptionComponent implements OnInit {

  userFormGroup! : FormGroup
  constructor(private fb: FormBuilder, private activatedRoute: ActivatedRoute, private usersService: UsersService, private router: Router) {
  }
  ngOnInit() {
    this.userFormGroup = this.fb.group({
      nom: this.fb.control(''),
      prenom: this.fb.control(''),
      email: this.fb.control(''),
      password: this.fb.control(''),
      cin: this.fb.control(''),
      tel: this.fb.control(''),
      statut: this.fb.control(''),
      description: this.fb.control('')
    })
  }

  saveUser(){
    const formData: FormData = new FormData();
    formData.append('nom', this.userFormGroup.value.nom);
    formData.append('prenom', this.userFormGroup.value.prenom);
    formData.append('email', this.userFormGroup.value.email);
    formData.append('tel', this.userFormGroup.value.tel);
    formData.append('password', this.userFormGroup.value.password);
    formData.append('statut', this.userFormGroup.value.statut);
    formData.append('description', this.userFormGroup.value.description);
    formData.append('cin', this.userFormGroup.value.cin);

    this.usersService.saveDemandeInscription(formData).subscribe(
      {
        next : value => {
          alert('Demande enregistrée avec succès');


        },
        error : err => {
          console.log(err);
        }
      }
    )

  }

}
