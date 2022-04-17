import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { catchError, from, map, Observable } from 'rxjs';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from './entities/user.interface';
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
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Observable<Pagination<User>> {
    return this.userService.paginate({ limit: +limit, page: +page });
    // return from(this.userService.findAll());
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return from(this.userService.deleteOne(+id));
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<User> {
    return from(this.userService.updateOne(+id, user));
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() role: UserRole,
  ): Observable<User> {
    return from(this.userService.updateRole(+id, role));
  }
}
