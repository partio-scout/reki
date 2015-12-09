import app from '../src/server/server.js';

const email = process.argv[2];

if (!email) {
  console.log('Please provide the user\'s email: node dev-login.js <email>');
  process.exit(1);
}

const query = {
  where: {
    email: email,
  },
};

app.models.Registryuser.findOne(query, (err, user) => {
  if (err) {
    console.error('Error loading user:', err);
    process.exit(1);
  } else if (user === null) {
    console.error('Can\'t find user:', email);
    process.exit(0);
  } else {
    user.createAccessToken(8*3600, (err, accessToken) => {
      if (err) {
        console.error('Can\'t generate access token:', err);
      } else {
        const url = `http://localhost:3000/dev-login/${accessToken.id}`;
        console.log(`Login URL: ${url}`);
        process.exit(0);
      }
    });
  }
});
