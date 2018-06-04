
// Split fetching participants to date ranges in order to avoid overloading Kuksa
const fetchDateRanges = [
  {
    "startDate": "2015-01-01T00:00:00",
    "endDate": "2016-01-22T06:00:00"
  },
  {
    "startDate": "2016-01-22T00:00:00",
    "endDate": "2016-02-25T06:00:00"
  },
  {
    "startDate": "2016-02-25T00:00:00",
    "endDate": "2016-07-15T05:00:00"
  },
  {
    "startDate": "2016-07-15T05:00:00",
    "endDate": ""
  }
];

// Map payment names to sets of dates when the participant is present
const paymentsToDatesMappings = {
  "pe 15.7.": ["2016-07-15"],
  "la 16.7.": ["2016-07-16"],
  "su 17.7.": ["2016-07-17"],
  "ma 18.7.": ["2016-07-18"],
  "ti 19.7.": ["2016-07-19"],

  "ke 20.7.": ["2016-07-20"],
  "ke 20.7. 100% alennus": ["2016-07-20"],
  "ke 20.7. 50% alennus": ["2016-07-20"],

  "to 21.7.": ["2016-07-21"],
  "to 21.7. 100% alennus": ["2016-07-21"],
  "to 21.7. 50% alennus": ["2016-07-21"],

  "pe 22.7.": ["2016-07-22"],
  "pe 22.7. 100% alennus": ["2016-07-22"],
  "pe 22.7. 50% alennus": ["2016-07-22"],

  "la 23.7.": ["2016-07-23"],
  "la 23.7. 100% alennus": ["2016-07-23"],
  "la 23.7. 50% alennus": ["2016-07-23"],

  "su 24.7.": ["2016-07-24"],
  "su 24.7. 100% alennus": ["2016-07-24"],
  "su 24.7. 50% alennus": ["2016-07-24"],

  "ma 25.7.": ["2016-07-25"],
  "ma 25.7. 100% alennus": ["2016-07-25"],
  "ma 25.7. 50% alennus": ["2016-07-25"],

  "ti 26.7.": ["2016-07-26"],
  "ti 26.7. 100% alennus": ["2016-07-26"],
  "ti 26.7. 50% alennus": ["2016-07-26"],

  "ke 27.7.": ["2016-07-27"],
  "ke 27.7. 100% alennus": ["2016-07-27"],
  "ke 27.7. 50% alennus": ["2016-07-27"],

  "to 28.7.": ["2016-07-28"],
  "pe 29.7.": ["2016-07-29"],
  "la 30.7.": ["2016-07-30"],
  "su 31.7.": ["2016-07-31"],

  "Osallistun koko leirin ajaksi": ["2016-07-20","2016-07-21","2016-07-22","2016-07-23","2016-07-24","2016-07-25","2016-07-26","2016-07-27"],
  "Osallistun koko purkuleirille (4 päivää) ja saan alennusta leirimaksusta 20 euroa. Summa hyvitetään purkuleirin jälkeen..": ["2016-07-28","2016-07-29","2016-07-30","2016-07-31"],
  "Osallistun vain rakennus-/purkuleirille tai Home Hospitalityn isäntäperheenä.": []
};

export default {
  paymentsToDatesMappings: paymentsToDatesMappings,
  fetchDateRanges: fetchDateRanges,
}
