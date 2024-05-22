export class ErrorMessages {
  static SOMETHING_WENT_WRONG = 'Something went wrong! 😕\nPlease try again later.';
}

export const REGEX_VALUES = {
  EMAIL_ID: /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, // ? ref : https://www.rfc-editor.org/rfc/rfc3696#page-5
  PHONE_NUMBER: /^(\+91|\+91\-|0)?[56789]\d{9}$/,
};
