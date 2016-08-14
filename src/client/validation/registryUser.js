import validator from 'validator';
import { getModelValidator } from './modelValidator';

function notEmpty(string) {
  return !validator.isNull(string);
}

const schema = [
  {
    property: 'firstName',
    test: notEmpty,
    message: 'Anna käyttäjän etunimi.',
  },
  {
    property: 'lastName',
    test: notEmpty,
    message: 'Anna käyttäjän sukunimi.',
  },
  {
    property: 'memberNumber',
    test: notEmpty,
    message: 'Anna käyttäjän jäsennumero.',
  },
  {
    property: 'phoneNumber',
    test: notEmpty,
    message: 'Anna käyttäjän puhelinnumero.',
  },
  {
    property: 'email',
    test: notEmpty,
    message: 'Anna käyttäjän sähköpostiosoite.',
  },
];

export default getModelValidator(schema);
