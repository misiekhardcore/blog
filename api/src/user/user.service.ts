import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { User } from './entities/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  create(user: User): Observable<User> {
    return from(this.userRepo.save(user));
  }

  findOne(id: number): Observable<User> {
    return from(this.userRepo.findOne({ where: { id } }));
  }

  findAll(): Observable<User[]> {
    return from(this.userRepo.find());
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepo.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    return from(this.userRepo.update(id, user));
  }
}
