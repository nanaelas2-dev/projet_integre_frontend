import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {UsersComponent} from "./users/users.component";
import {LoadUsersComponent} from "./load-users/load-users.component";
import {LoadUsersAttenteComponent} from "./load-users-attente/load-users-attente.component";
import {AdminTemplateComponent} from "./admin-template/admin-template.component";
import {AuthGuard} from "./guards/auth.guard";
import {AuthorizationGuard} from "./guards/authorization.guard";
import {InscriptionComponent} from "./inscription/inscription.component";
import {UserTemplateComponent} from "./user-template/user-template.component";
import {UpdateUserComponent} from "./update-user/update-user.component";

const routes: Routes = [
  {path: "", component: LoginComponent},
  {path: "login", component: LoginComponent},
  {path: "inscription", component: InscriptionComponent},
  {path: "inscrit", component: UserTemplateComponent,
    canActivate : [AuthGuard]
  },
  {path: "admin", component: AdminTemplateComponent,
    canActivate : [AuthGuard],
    children: [
      {path: "users", component: UsersComponent},
      {path: "loadUsers", component: LoadUsersComponent,
      canActivate: [AuthorizationGuard], data: {role: "administrateur"}
      },
      {path: "loadUserAttente", component: LoadUsersAttenteComponent,
        canActivate: [AuthorizationGuard], data: {role: "administrateur"}
      },
      {path:"users", component: UsersComponent},
      {path: "updateUser/:id", component: UpdateUserComponent,
        canActivate: [AuthorizationGuard], data: {role: "administrateur"}
      }
    ]},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
