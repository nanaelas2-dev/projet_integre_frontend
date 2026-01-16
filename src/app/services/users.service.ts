import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {User} from "../model/users.model";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private  http: HttpClient) { }


  public getAllInscrites(): Observable<Array<User>>{
    return this.http.get<Array<User>>(environment.backendHost+"/inscrites");
  }

  public saveDemandeInscription(formData: any):Observable<User>{
    return this.http.post<User>(environment.backendHost + '/inscription', formData);
  }

  /*public login(formData: any): Observable<string>{
    return this.http.post(environment.backendHost+'/login', formData,  {
      responseType: 'text'});
  }*/

  public supprimer(id:any):Observable<void>{
    return this.http.get<void>(environment.backendHost + '/supprimer/'+id);
  }

  public getInscrite(id:any): Observable<User>{
    return this.http.get<User>(environment.backendHost+"/inscrite/"+id);
  }

  public updateUser(formData: any):Observable<User>{
    return this.http.post<User>(environment.backendHost + '/update', formData);
  }




}
