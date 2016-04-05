import Promise from 'bluebird';
import app from '../src/server/server.js';
import faker from 'faker';

const ParticipantModel = app.models.Participant;
const createParticipant = Promise.promisify(ParticipantModel.create, { context: ParticipantModel });

const opts = require('commander')
  .usage('<amount of fake participants to create>')
  .parse(process.argv);

if (opts.args.length > 1 || !parseInt(opts.args[0], 10) || opts.args[0] < 0) {
  opts.outputHelp();
  console.error('Please provide amount of test data to create as a non-negative integer.');
  process.exit(1);
}
const amountToCreate = opts.args.length == 1 ? opts.args[0] : 5;

faker.locale = 'it';

function countParticipants() {
  ParticipantModel.count((err, sum) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Total participants: ${sum}`);
    }
  });
}

function getDateOfBirth() {
  const  dob = faker.date.past(30, new Date('Sat Sep 20 2004'));
  return `${dob.getFullYear()}-${dob.getMonth()+1}-${dob.getDate()}`;
}

function getSwimmingSkill() {
  return Math.random() < 0.7 ? Math.random() < 0.8 : null;
}

function getGender() {
  const gender = Math.random() < 0.7;
  return Math.random() < 0.1 ? null : gender;
}

function getInterestedInHomeHospitality() {
  return Math.random() < 0.7 ? Math.random() < 0.1 : null;
}

function generateRandomParticipant() {
  const gender = getGender();

  return {
    firstName: faker.name.firstName(gender ? 'male' : 'female'),
    lastName: faker.name.lastName(),
    nonScout: Math.random() < 0.1,
    memberNumber: Math.floor(Math.random()*10000000),
    dateOfBirth: getDateOfBirth(),
    phoneNumber: faker.phone.phoneNumber('050 #######'),
    email: faker.internet.email(),
    homeCity: faker.address.city(),
    swimmingSkill: getSwimmingSkill(),
    gender: gender,
    interestedInHomeHospitality: getInterestedInHomeHospitality(),
  };
}

function createMockParticipants(i) {
  if (i < 1) {
    countParticipants();
  } else {
    createParticipant(generateRandomParticipant())
      .then(createdParticipantInfo => {
        createMockParticipants(i-1);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

console.log(`Attempting to create ${amountToCreate} mock participants.`);
createMockParticipants(amountToCreate);
