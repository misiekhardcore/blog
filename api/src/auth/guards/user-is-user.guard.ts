import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { User } from 'src/user/entities/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserIsUserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const { id } = request.user as User;
    return of(+params.id === +id);
  }
}
