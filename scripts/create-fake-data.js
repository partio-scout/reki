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

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getLocalGroup() {
  const localGroups = [
    'Euran Peurat ry',
    'Harjavallan Pirkat',
    'Henrikin Tapulitytöt',
    'Honkahukat ry',
    'Huittisten Eränkävijät ry',
    'Jokilaakson Ravut ry',
    'Jämijärven Miilunvartijat ry',
    'Kaavin Kiehiset',
    'Kallan Kontiot',
    'Kallan Tiirat',
    'Kallan Tytöt',
    'Kankaanpään Korpiveikot',
    'Kannonkiertäjät',
    'Karimo ry',
    'Karvian Majavapartio ry',
    'Keikyän Korvenkävijät ry',
    'Keiteleen Saukot',
    'Kiikan Leiripeikot',
    'Kiikoisten Partiopojat',
    'Kinahmin Kiipijät',
    'Kirkkonummen Metsänkävijät',
    'Kirkkonummen Metsäntytöt',
    'Kirnun Kiertäjät',
    'Kiukaisten Metsäveikot ry',
    'Kiuru-Partio',
    'Klapaset',
    'Kopardit ry',
    'Kuilun Kulkijat',
    'Kuninkaantien Kipinät',
    'Kuopion Eräversot',
    'Kuopion Kurjenmiekat',
    'Kuusiston Linnanyrjänät',
    'Lahelan Palokärjet',
    'Lapinjärven Peurat',
    'Lappohjan Vasat',
    'Leirisiskot',
    'Linnajoen Partiolaiset',
    'Lohjan Eräveikot',
    'Lohjan Nummitytöt',
    'Lohjanharjun Vartijat',
    'Marttilan Martit',
    'Mellilän Menninkäiset',
    'Mustavuoren Sissit',
    'Mäntsälän Metsäkävyt',
    'Nummen Samoojat',
    'Nuotiotytöt',
    'Polaris',
    'Pornaisten Solmu',
    'Porvoon Metsänkävijät',
    'Porvoon Polunlöytäjät',
    'Pukkilan Partio',
    'Puskapartiolaiset',
    'Rajamäen Kekäleet',
    'Tapiolan Metsänkävijät',
    'Tavastit',
    'Tellervoiset',
    'Tikkurilan Siniset',
    'Toimen Pojat - Unga Fribyggare',
    'Toimen tytöt',
    'Tornikotkat',
    'Tuikku-tytöt',
    'Turun Sinikotkat',
    'Töölön Nuotioveikot',
    'Töölön Siniset',
    'Töölön Tähystäjät',
    'Vaaran Vaeltajat',
    'Vantaan Jokiversot',
    'Vantaan Metsänkävijät',
    'Vartiovuoren Pojat',
    'Vartiovuoren Tytöt',
    'Viestitytöt',
    'Viherlaakson Peurat',
  ];

  return randomElement(localGroups);
}

function getSubCampAndCampGroup() {
  const campGroupsBySubCamp = {
    humina: ['hautamäki', 'väkiparta'],
    hurma: ['aalto', 'uhlenius'],
    polte: ['norokorpi', 'hietanen'],
    raiku: ['eino', 'jenni'],
    riehu: ['lehto', 'jylhä'],
    syke: ['warro', 'toukonen'],
    unity: ['finelli', 'puntila'],
  };

  const subCamp = randomElement(Object.keys(campGroupsBySubCamp));
  const campGroup = randomElement(campGroupsBySubCamp[subCamp]);

  return {
    subCamp,
    campGroup,
  };
}

function getAgeGroup() {
  const ageGroups = [
    'perheleiriläinen',
    'tarpoja',
    'samoaja',
    'vaeltaja',
    'aikuinen',
  ];

  return randomElement(ageGroups);
}

function generateRandomParticipant() {
  const gender = getGender();
  const {
    subCamp,
    campGroup,
  } = getSubCampAndCampGroup();

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
    interestedInHomeHospitality: getInterestedInHomeHospitality(),
    ageGroup: getAgeGroup(),
    localGroup: getLocalGroup(),
    gender,
    subCamp,
    campGroup,
    inCamp: Math.floor(Math.random() * 5),
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
