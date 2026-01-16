import {Component, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {MatTableDataSource} from "@angular/material/table";
import {User} from "../model/users.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-load-users-attente',
  templateUrl: './load-users-attente.component.html',
  styleUrl: './load-users-attente.component.css'
})
export class LoadUsersAttenteComponent {
  public users : any;
  public dataSource:any;
  public displayedColumns: string[]= ['id', 'nom', 'prenom', 'email', 'cin', 'statut', 'telephone', 'approuver', 'rejeter'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort! : MatSort;
  constructor(private http: HttpClient, private router: Router) {

  }
  ngOnInit() {
    this.http.get(environment.backendHost+"/administrateur/inscriptions")
      .subscribe({
        next : data => {
          this.users=data;
          this.dataSource=new MatTableDataSource(this.users)
          this.dataSource.paginator= this.paginator;
          this.dataSource.sort=this.sort;
        },
        error : err => {
          console.log(err);
        }
      })

  }
  approuverUser(element:User){
    let id= element.id;
    this.http.get(environment.backendHost+"/administrateur/approuver/"+id)
      .subscribe({
        next : value => {
          this.users = this.users.filter((u: User) => u.id !== id);
          this.dataSource.data = this.users;
        },
        error: err => {
          console.log(err);
        }
      });
    //this.router.navigateByUrl("/admin/loadUserAttente")

  }
  rejeterUser(element: User)
  {
    let id= element.id;
    this.http.get(environment.backendHost+"/administrateur/rejeter/"+id)
      .subscribe({
        next : value => {
          this.users = this.users.filter((u: User) => u.id !== id);
          this.dataSource.data = this.users;
        },
        error: err => {
          console.log(err);
        }
      });
    //this.router.navigateByUrl("/admin/loadUserAttente")

  }

}
