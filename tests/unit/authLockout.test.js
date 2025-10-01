const { emailDomainOk } = require('../../src/services/auth.service');

describe('Email institucional', () => {
  test('acepta dominio permitido', () => {
    process.env.ALLOWED_EMAIL_DOMAIN = 'unicomfacauca.edu.co';
    expect(emailDomainOk('juan@unicomfacauca.edu.co')).toBe(true);
  });
  test('rechaza otro dominio', () => {
    process.env.ALLOWED_EMAIL_DOMAIN = 'unicomfacauca.edu.co';
    expect(emailDomainOk('juan@gmail.com')).toBe(false);
  });
});