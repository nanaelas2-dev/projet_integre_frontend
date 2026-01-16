import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../model/users.model";
import {UsersService} from "../services/users.service";
import {update} from "@angular-devkit/build-angular/src/tools/esbuild/angular/compilation/parallel-worker";

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit{
  updateForm! : FormGroup;
  u! : User;
  id! :any;
  constructor(private fb: FormBuilder, private activatedRoute: ActivatedRoute, private usersService: UsersService, private router : Router) {
  }
  ngOnInit() {
    this.updateForm = this.fb.group({
      id: this.fb.control(''),
      nom: this.fb.control(''),
      prenom: this.fb.control(''),
      email: this.fb.control(''),
      password: this.fb.control(''),
      cin: this.fb.control(''),
      tel: this.fb.control(''),
      statut: this.fb.control(''),
      description: this.fb.control('')
    })
    this.id= this.activatedRoute.snapshot.params['id'];
    this.usersService.getInscrite(this.id).subscribe(
      {
        next : value => {
          this.u=value;
          this.updateForm= this.fb.group({
            id: this.fb.control(this.id),
            nom: this.fb.control(this.u.nom),
            prenom: this.fb.control(this.u.prenom),
            email: this.fb.control(this.u.email),
            password: this.fb.control(''),
            cin: this.fb.control(this.u.cin),
            tel: this.fb.control(this.u.telephone),
            statut: this.fb.control(this.u.statut),
            description: this.fb.control(this.u.description)
          })
        },
        error : err => {
          console.log(err);
        }
      }
    );

  }
  updateUser():void{
    const formData: FormData = new FormData();
    formData.append('id', this.updateForm.value.id);
    formData.append('nom', this.updateForm.value.nom);
    formData.append('prenom', this.updateForm.value.prenom);
    formData.append('email', this.updateForm.value.email);
    formData.append('tel', this.updateForm.value.tel);
    formData.append('password', this.updateForm.value.password);
    formData.append('statut', this.updateForm.value.statut);
    formData.append('description', this.updateForm.value.description);
    formData.append('cin', this.updateForm.value.cin);

    this.usersService.updateUser(formData).subscribe(
      {
        next : value => {
          this.router.navigateByUrl('/admin/loadUsers');
        },
        error: err => {
          console.log(err);
        }
      }
    );
  }



}
