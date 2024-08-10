import { Injectable } from '@nestjs/common';
import { MyClass } from 'rts-kit';

@Injectable()
export class AppService {
  getHello(): string {
    return new MyClass().hello();
  }
}
