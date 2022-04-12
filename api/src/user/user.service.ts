import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { User, UserRole } from './entities/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        return from(
          this.userRepo.save({ ...user, password: passwordHash }),
        ).pipe(
          map((user: User) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...rest } = user;
            return rest;
          }),
          catchError((err) => throwError(() => new Error(err))),
        );
      }),
    );
  }

  findOne(id: number): Observable<User> {
    return from(this.userRepo.findOne({ where: { id } })).pipe(
      map((user: User) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user;
        return rest;
      }),
      catchError((err) => throwError(() => new Error(err))),
    );
  }

  findAll(): Observable<User[]> {
    return from(this.userRepo.find()).pipe(
      map((users: User[]) => {
        users.forEach((u) => delete u.password);
        return users;
      }),
      catchError((err) => throwError(() => new Error(err))),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepo.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.role;
    return from(this.userRepo.update(id, user));
  }

  updateRole(id: number, role: UserRole): Observable<any> {
    return from(this.userRepo.update(id, { role }));
  }

  login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user)
          return this.authService
            .generateJwt(user)
            .pipe(map((jwt: string) => jwt));
        throw Error('Wrong credentials');
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return this.findByEmail(email).pipe(
      switchMap((user: User) =>
        this.authService.comparePasswords(password, user.password).pipe(
          map((matched: boolean) => {
            if (matched) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { password, ...rest } = user;
              return rest;
            }
            throw Error;
          }),
        ),
      ),
    );
  }

  findByEmail(email: string): Observable<User> {
    return from(this.userRepo.findOne({ where: { email } }));
  }
}
