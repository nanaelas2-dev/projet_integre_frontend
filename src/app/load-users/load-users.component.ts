import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {UsersService} from "../services/users.service";
import {User} from "../model/users.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-load-users',
  templateUrl: './load-users.component.html',
  styleUrl: './load-users.component.css'
})
export class LoadUsersComponent implements OnInit{
  public users : any;
  public dataSource:any;
  public displayedColumns: string[]= ['id', 'nom', 'prenom', 'email', 'cin', 'statut', 'telephone', 'modifier', 'supprimer'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort! : MatSort;
  constructor( private usersService : UsersService, private router: Router) {

  }
  ngOnInit() {
    //this.http.get(environment.backendHost+"/inscrites")
    this.usersService.getAllInscrites()
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
  modifier(user: User):void{
    this.router.navigateByUrl('/admin/updateUser/'+ user.id);
  }

  supprimer(user:User):void{
    let id=user.id;
    this.usersService.supprimer(user.id).subscribe(
      {
        next : value => {
          this.users = this.users.filter((u: User) => u.id !== id);

          // 2. Réassigner complètement le dataSource
          this.dataSource = new MatTableDataSource(this.users);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: err => {
          console.log(err);
        }
      }
    )
  }

}
