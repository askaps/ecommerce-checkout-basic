import { Injectable } from '@nestjs/common';
import { REGEX_VALUES } from '../constants';

@Injectable()
export class CommonService {
  isEmailValid(email: string): boolean {
    return REGEX_VALUES.EMAIL_ID.test(email);
  }

  isPhoneNumberValid(phoneNo: number): boolean {
    return REGEX_VALUES.PHONE_NUMBER.test(phoneNo as any);
  }

  sanitizeEmail(email: string | undefined): string {
    if (email) {
      const lastIndex = email.lastIndexOf('@');
      return `${email.substring(0, lastIndex).replace(/-/g, '')}${email.substring(lastIndex)}`;
    }
    return '';
  }
}
