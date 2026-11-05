import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable({ scope: Scope.REQUEST })
export class RequestIdService {
  readonly id = randomUUID();
}
