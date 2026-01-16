import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {UsersService} from "../services/users.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  public loginForm! : FormGroup;
  constructor( private fb: FormBuilder, private authService: AuthService, private router: Router, private usersService: UsersService) {
  }
  ngOnInit() : void{
    this.loginForm=this.fb.group({
      email : this.fb.control(''),
      password : this.fb.control('')
    })
  }

 /* login():void{
    let email= this.loginForm.value.email;
    let password= this.loginForm.value.password;
    let auth:boolean = this.authService.login(email, password);
    if(auth==true)
    {
      this.router.navigateByUrl("/admin")
    }
  }*/
  login():void{
    const formData: FormData = new FormData();
    formData.append('email', this.loginForm.value.email);
    formData.append('password', this.loginForm.value.password);
    this.authService.login(formData, (success: boolean) => {
      // Ce code s'exécutera quand la réponse arrivera
      if (success) {
        console.log('Connexion réussie');

        // Redirection selon le rôle
        if (this.authService.getRole() === 'administrateur') {
          this.router.navigateByUrl('/admin');
        } else  {
          this.router.navigateByUrl('inscrit');
        }

      } else {
        console.log('Échec de connexion');

      }
    });

  }


}
