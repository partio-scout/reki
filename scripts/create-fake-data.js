import Promise from 'bluebird';
import app from '../src/server/server.js';
import faker from 'faker';

const ParticipantModel = app.models.Participant;
const createParticipant = Promise.promisify(ParticipantModel.create, { context: ParticipantModel });

const ParticipantDateModel = app.models.ParticipantDate;
const createParticipantDate = Promise.promisify(ParticipantDateModel.create, { context: ParticipantDateModel });

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

function getSubCampVillageAndCampGroup() {
  const campStructure = {
    humina: {
      'Rankki': ['Hautamäki', 'Väkiparta'],
      'Ruuna': ['Holmisto', 'Kauranen'],
    },
    hurma: {
      'Riimu': ['Aalto', 'Uhlenius'],
    },
    polte: {
      'Rauha': ['Norokorpi', 'Hietanen'],
    },
    raiku: {
      'Raukola': ['Eino', 'Jenni'],
    },
    riehu: {
      'Rouhe': ['Lehto', 'Jylhä'],
      'Revontuli': ['Lehto', 'Jylhä'],
    },
    syke: {
      'Rantala': ['Warro', 'Toukonen'],
    },
    unity: {
      'Ruukki': ['Finelli', 'Puntila'],
    },
  };

  const subCamp = randomElement(Object.keys(campStructure));
  const village = randomElement(Object.keys(campStructure[subCamp]));
  const campGroup = randomElement(campStructure[subCamp][village]);

  return {
    subCamp,
    village,
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

function generateRandomParticipant(id) {
  const gender = getGender();
  const {
    subCamp,
    village,
    campGroup,
  } = getSubCampVillageAndCampGroup();

  return {
    participantId: id,
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
    village,
    campGroup,
    presence: 0,
  };
}

function createMockParticipants(i) {
  if (i < 1) {
    countParticipants();
  } else {
    createParticipant(generateRandomParticipant(i))
      .tap(addParticipantDate)
      .then(createdParticipantInfo => {
        createMockParticipants(i-1);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

function addParticipantDate(participant) {
  return createParticipantDate({ participantId: participant.participantId, date: new Date(2016,6,22) });
}


console.log(`Attempting to create ${amountToCreate} mock participants.`);
createMockParticipants(amountToCreate);
