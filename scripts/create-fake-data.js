import app from '../src/server/server.js';
import faker from 'faker';

const ParticipantModel = app.models.Participant;

const email = faker.internet.email();

const participant = {
  "firstName": "Eeppinen",
  "lastName": "Trolli",
  "nonScout": false,
  "memberNumber": 1234567,
  "dateOfBirth": "1583-01-01",
  "phoneNumber": "0501234567",
  "email": email,
  "homeCity": "Middle Earth"
}

ParticipantModel.create(participant);
