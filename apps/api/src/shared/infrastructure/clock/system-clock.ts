import { Injectable } from '@nestjs/common';

import { ClockPort } from '../../application/index.js';

/** Adaptador de ClockPort con la hora real del sistema. */
@Injectable()
export class SystemClock extends ClockPort {
  now(): Date {
    return new Date();
  }
}
