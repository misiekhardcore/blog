import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { catchError, from, map, Observable } from 'rxjs';
import { User } from './entities/user.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => {
        throw new BadRequestException(err.message);
      }),
    );
  }

  @Post('login')
  login(@Body() user: User): Observable<{ access_token: string }> {
    return this.userService
      .login(user)
      .pipe(map((jwt: string) => ({ access_token: jwt })));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<User> {
    return from(this.userService.findOne(+id));
  }

  @Get()
  findAll(): Observable<User[]> {
    return from(this.userService.findAll());
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return from(this.userService.deleteOne(+id));
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<User> {
    return from(this.userService.updateOne(+id, user));
  }
}
