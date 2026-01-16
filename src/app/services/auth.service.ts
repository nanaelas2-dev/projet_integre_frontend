import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public users:any= {
    admin: {password: '123', role: 'administrateur'},
    user1: {password: '123', role: 'inscrit'}

  }

  public email: any;
  public isAuthenticated : boolean=false;
  public role: any;

  constructor(private router: Router, private http:HttpClient) { }

 /* public login(email : string, password: string): boolean{
    if(this.users[email] && this.users[email]['password']==password){
      this.email=email;
      this.isAuthenticated=true;
      this.role=this.users[email]['role'];
      return true;
    }
    else{
      return false;
    }
  }*/
  public login(formData: any, callback: (success: boolean) => void): void{
    this.http.post(environment.backendHost+'/login', formData,  {
      responseType: 'text'}).subscribe(
      {
        next :(response: string)=>{
          if(response=="administrateur" || response=="inscrit")
          {
            this.isAuthenticated=true;
            this.email=formData.email;
            this.role=response;
            callback(true);
          }
          else{
            callback(false);
          }
    },
        error:err => {
          console.log(err);
          callback(false);
        }
      }
    )

  }
  logout()
  {
    this.isAuthenticated=false;
    this.role=undefined;
    this.email=undefined;
    this.router.navigateByUrl("/login")
  }

  getRole(): string{
    return this.role;
  }
}
