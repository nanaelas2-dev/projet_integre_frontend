import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  GuardResult,
  MaybeAsync, Router,
  RouterStateSnapshot
} from '@angular/router';
import {AuthService} from "../services/auth.service";
import {Injectable} from "@angular/core";
@Injectable()
export class AuthorizationGuard{
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    if(this.authService.isAuthenticated)
    {
      let requiredRole = route.data['role'];
      let userRole = this.authService.role;
      if(userRole===requiredRole)
      {
        return true;
      }
      return false;

    }
    else{
      this.router.navigateByUrl("/login")
      return false;
    }

  }

}
