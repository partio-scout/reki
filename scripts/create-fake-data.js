import Promise from 'bluebird';
import app from '../src/server/server.js';
import faker from 'faker';

const ParticipantModel = app.models.Participant;
faker.locale = 'it';

let dob = faker.date.past(30, new Date("Sat Sep 20 2004"));
dob = dob.getFullYear() + "-" + dob.getMonth() + "-" + dob.getDate();

const participant = {
  "firstName": faker.name.firstName(),
  "lastName": faker.name.lastName(),
  "nonScout": Math.random() < 0.1,
  "memberNumber": Math.floor(Math.random()*10000000),
  "dateOfBirth": dob,
  "phoneNumber": faker.phone.phoneNumber('050 #######'),
  "email": faker.internet.email(),
  "homeCity": faker.address.city()
}
console.log('Attempting to create fake data.');
ParticipantModel.create(participant);
console.log('Succesfully created a fake participant!');
