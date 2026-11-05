import { Injectable, Scope } from '@nestjs/common';
import { RequestIdService } from './request-id.service';

@Injectable({ scope: Scope.REQUEST })
export class RequestTraceService {
  constructor(private readonly requestId: RequestIdService) {}

  getId(): string {
    return this.requestId.id;
  }
}
