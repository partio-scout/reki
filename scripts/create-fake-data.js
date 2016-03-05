import Promise from 'bluebird';
import app from '../src/server/server.js';
import faker from 'faker';

const ParticipantModel = app.models.Participant;
const createParticipant = Promise.promisify(ParticipantModel.create, { context: ParticipantModel });

var opts = require('commander')
  .usage('<amount of fake participants to create>')
  .parse(process.argv);

if (opts.args.length > 1) {
  opts.outputHelp();
  console.error('Please provide amount of test data to create.');
  process.exit(1);
}
const amountToCreate = opts.args.length == 1 ? opts.args[0] : 5;

faker.locale = 'it';

function countParticipants() {
	ParticipantModel.count((err, sum) => {
		if  (err) {
			console.log(err);
		}
		else {
			console.log('Total participants: ' + sum);
		}
	});
}

function createMockParticipants(i) {
  let dob = faker.date.past(30, new Date("Sat Sep 20 2004"));
  dob = dob.getFullYear() + "-" + (dob.getMonth()+1) + "-" + dob.getDate();
  const swimmingSkill = Math.random() < 0.7 ? Math.random() < 0.8 : null;

  let gender = Math.random() < 0.7;
  const genderName = gender ? 'male' : 'female'
  gender = Math.random() < 0.1 ? null : gender

  const interestedInHomeHospitality = Math.random() < 0.7 ? Math.random() < 0.1 : null;

  const participant = {
    "firstName": faker.name.firstName(gender ? 'male' : 'female'),
    "lastName": faker.name.lastName(),
    "nonScout": Math.random() < 0.1,
    "memberNumber": Math.floor(Math.random()*10000000),
    "dateOfBirth": dob,
    "phoneNumber": faker.phone.phoneNumber('050 #######'),
    "email": faker.internet.email(),
    "homeCity": faker.address.city(),
    "swimmingSkill": swimmingSkill,
    "gender": gender,
    "interestedInHomeHospitality": interestedInHomeHospitality
  }

  createParticipant(participant)
  .then(createdParticipantInfo => {
	if (i === 1){
		countParticipants()
	}
    i > 1 ? createMockParticipants(i-1) : '';
  })
  .catch(err => {
    console.log(err);
  });
}

console.log(`Attempting to create ${amountToCreate} mock participants.`);
createMockParticipants(amountToCreate);
