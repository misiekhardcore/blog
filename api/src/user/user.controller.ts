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
  Request,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Pagination } from 'nestjs-typeorm-paginate';
import * as path from 'path';
import { catchError, from, map, Observable, of } from 'rxjs';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from './entities/user.interface';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { join } from 'path';

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
    @Query('username') username?: string,
  ): Observable<Pagination<User>> {
    return this.userService.paginateFilterByUsername(
      { limit: +limit, page: +page },
      { username },
    );
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

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const filename =
            path.parse(file.originalname).name.replace(/\s/g, '') +
            '-' +
            Date.now();
          const extension = path.parse(file.originalname).ext;

          cb(null, filename + extension);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() { user }: { user: User },
  ): Observable<{ imagePath: string }> {
    return this.userService
      .updateOne(user.id, { profileImage: file.filename })
      .pipe(map((user) => ({ imagePath: user.profileImage })));
  }

  @Get('profile-image/:name')
  findProfilePicture(
    @Param('name') name: string,
    @Res() res,
  ): Observable<StreamableFile> {
    return of(res.sendFile(join(process.cwd(), 'uploads/avatars', name)));
  }
}
