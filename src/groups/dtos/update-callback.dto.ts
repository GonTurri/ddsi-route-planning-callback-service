import { IsUrl } from 'class-validator';

export class UpdateCallbackDto {
  @IsUrl({ require_tld: false })
  callbackUrl: string;
}
