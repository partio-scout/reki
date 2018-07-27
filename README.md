# REKI
Camp registry system that integrates with Kuksa. Originally developed for Roihu.

## Developing with Docker

### Prerequisites
You need to install [Docker](https://docker.com) and [Docker compose](https://docs.docker.com/compose/install/). 
Nvm is also highly recommended, but you can also just install the correct (or equivalent) node version globally. 
See the correct version in the .nvmrc file.

Example installation command: `docker-machine create default`. 
MacOS may need also the following: `eval "$(docker-machine env default)"`


### Installation
Clone this repository into a local directory.
- If you are using nvm, run `nvm install` in that directory.
- Run `npm install`.
- Run `docker-compose build` to build the docker containers.

### Running the app
- If you are using nvm, run `nvm use`.
- Run `docker-compose up` to start the services.

The app is now running at `http://localhost:3000`.

## Developing with Vagrant

### Prerequisites
You will need [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/) on your machine.

### Installation
Clone this repository into a local directory. Enter the project directory on a command line. 
Initialize the Vagrant virtual machine with the command `vagrant up`. 
This will create a virtual machine for you and install all the required software in it.
The first run will take several minutes or even hours on a slow network.

### Running the app
Enter the project directory. If you don't have the Vagrant virtual machine running, run `vagrant up` (you can check the status with `vagrant status`). Then run `vagrant ssh` to access the virtual machine.

Inside the virtual machine run `npm start` inside the `/vagrant` directory.

The application will be available at http://localhost:3000/, from both the host and guest operating systems.
In order to be able to login, first create a user with the `npm run create-user` command.
Then you can create a login URL for that user with the command `npm run dev-login <email>`, e.g. `npm run dev-login anna.malli@partio.fi`. 

Note that the virtual machine has the `NODE_ENV`-environment variable set to `dev`, so to run in production mode, run with `NODE_ENV=production npm start`.

### File change notifications
By default file change events do not propagate between the host and virtual machine. 
Therefore the webpack development server and test watcher won't function properly. 
The notification can be easily enabled though with a vagrant plugin. 
If you already have vagrant running, destroy your current virtual machine with `vagrant destroy`. 
Then run `vagrant plugin install vagrant-notify-forwarder`, then recreate the virtual machine with `vagrant up` and enjoy your file watchers!

## ES6
ES6 syntax is supported and should be used in all files, including the module syntax.

## Configuring your REKI installation

### Kuksa import related configuration

See `conf/test.config.js` for an example configuration. 
The minimum requirement is to configure the `paymentToDatesMappings` variable, which maps payment information coming from Kuksa to participation dates.
This setting is used when the `rebuild-tables` script is run. 
If any keys are missing, the script gives a warning.

Also the `fetchDateRanges` should be changed in order to avoid overloading Kuksa.

### User interface configuration

Changing elements in the "Kenttä" dropdown menu: `GenericPropertyFilterContainer.jsx` file's array named `properties`.

## Setting up a production environment in Heroku

The easiest way to set up a production environment is to use [Heroku](https://heroku.com/).

### Setting up the application

Create a Heroku account and get familiar with the basics in the [Heroku documentation](https://devcenter.heroku.com/).

Create a new Heroku application and deploy REKI there as described in [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs). 
These instructions assume your application is called *your-heroku-app*, but you should of course give it a descriptive name.

Some generic needed environment variables in Heroku are (in Heroku UI: **Settings / Reveal Config Vars**):
- `AUTOBUNDLE` = "true": For correct deployment the following environment variable is needed: 
- `PGSSLMODE` = "require": Needed for Heroku's secure PostgreSQL connection
- `REKI_LOCATION` = Your application's DNS name, e.g. `reki.kliffa18.fi`. This is optional, and used only to reduce WebSocket related errors in browser console.

Provision a Heroku Postgres database. 
This should automatically set the `DATABASE_URL` environment variable for the application and it should be able to connect to the database automatically.

Go to https://*your-heroku-app*.herokuapp.com/monitoring. 
If you see the text "OK", congratulations! The application is up and running. 
If you see "ERROR", the database connection does not work or the automatic database setup has failed. 
Wait for a couple of minutes to see if it's just slow, then check Heroku logs to investigate further. 
Also make sure the `DATABASE_URL` environment variable has been set.

Set the `NODE_ENV` environment variable to "production" in your Heroku app, if it's not already set. 
This is necessary from performance and security reasons. 
**Never** run REKI in development mode in production.

You can also use a custom domain - see Heroku's documentation on how to do that. 
In that case, replace https://*your-heroku-app*.herokuapp.com with your real domain throughout this document. 
You will also need to set up HTTPS for your custom domain - REKI only works through HTTPS in production.

### Setting up PartioID login

Using PartioID requires that the settings for your REKI installation have been been configured at the PartioID identity provider (`id.partio.fi`). 
For this you need to contact the ICT team of Suomen Partiolaiset, sp-it-ryhma@lista.partio.fi. 
Ask them to add the following config in the identity provider settings (replace https://*my-heroku-app*.herokuapp.com with your real URL):

```
$metadata['https://my-heroku-app.herokuapp.com'] = array(
  'AssertionConsumerService' => 'https://my-heroku-app.herokuapp.com/saml/consume',
  'SingleLogoutService' => 'https://my-heroku-app.herokuapp.com/saml/logout'
);
```

In the configuration, the string between `[` and `]` is the **entityId** of your service. 
It can be any string, but we recommend you use the root URL of your REKI installation, e.g. https://*your-heroku-app*.herokuapp.com.

When the configuration in the PartioID end has been done, set the following environment variables in your Heroku app:

- Set `PARTIOID_USE_PRODUCTION` to *true*. 
This means the application uses the real PartioID, `id.partio.fi`. 
If you leave this unset, the application will use the PartioID test environment, `qaid.partio.fi`.
- Set `PARTIOID_SP_ISSUER` to the entityId that's set in the PartioID configuration (see above). 
Make sure you set them **exactly the same way**, for example `https://example.org` and `https://example.org/` (with a trailing slash) are interpreted as different strings. 
Capitalisation also matters, so be careful.

#### Creating your fist user

To test the PartioID login, create a user. Matching users from PartioID to the REKI user database happens with the member number. Thus, create a user with e.g. your own information and member number. You can do this by opening executing `npm run create-user` through `heroku run`, for example:

```shell
heroku run npm run create-user
```

Make sure to enter the member number correctly. 

Once the user has been created, you can log in using PartioID and see if it works.

#### Troubleshooting PartioID

- If you get an error in the PartioID end, most likely the entityId has been set incorrectly in REKI (check your trailing slashes!) or the configuration for REKI in the PartioID end is missing altogether.
- If you get an error from the REKI end, see Heroku logs for errors. Possible causes include (but are not limited to) system time differing for more than 30 seconds between PartioID and REKI, outdated certificate (see certs/partioid) or incorrect member number of the local user.

### Configuring the Kuksa integration

Using the Kuksa integration requires that:

- the event is a "suurtapahtuma" in Kuksa (regular events don't expose an API),
- the fields you want to appear in REKI have been set to be visible over the API in the Kuksa event settings, and
- the source IP address you will use to access the API has been whitelisted in Kuksa.

You will need to contact the member registry coordinator at the main office of Suomen Partiolaiset to make the configurations at the Kuksa end. 
You'll most likely want to set up the Kuksa integration together. 
Reserve several hours for this.

Due to the IP whitelisting in Kuksa, the integration won't work on Heroku directly. 
The IP addresses of Heroku dynos change often and Kuksa expects a certain IP every time. 
For this reason you will need to use a proxy with a static IP. 
There are several Heroku addons that provide this as a service. 
Notice that most of these services expose the proxy url in their own environment variable such as `PROXIMO_URL` - you will need to copy this value also to the to `KUKSA_API_PROXY_URL` configuration variable. 
It is recommended to use an HTTP proxy.

You will need to set the following environment variables for the Kuksa integration to work:

- `KUKSA_API_ENDPOINT`: Set this to the full address of the Kuksa REST API
- `KUKSA_API_USERNAME`: The username for the Kuksa integration
- `KUKSA_API_PASSWORD`: The password for the Kuksa integration
- `KUKSA_API_EVENTID`: The id (a GUID) of the event
- `KUKSA_API_PROXY_URL` and `PROXIMO_URL` (or similar): The URL of the proxy you use to access Kuksa (optional)

### Example Heroku configuration

Example configuration variables: 

![Config vars](docs/images/Heroku_settings_1.png)

## Development tips

### Heroku connections

New shell session (creates new dyno): `heroku run bash -a herokuApplicationName`, e.g. `heroku run bash -a reki-production`

Contacting an existing dyno: `heroku ps:exec -a herokuApplicationName`

Running PostgreSQL commands: `heroku pg:psql -a herokuApplicationName`

### PostgreSQL commands

Note that database column names need to be quoted in SQL commands. Example:

```sql
select * from participants WHERE "memberNumber" = 'nnnnnnn';
```

### Kuksa raw data

To check the data returned from Kuksa API `wget` can be utilised.
The IP address whitelisting requires the proxy to be used.

Example command:

```shell
wget -e https_proxy=http://proxy:xxxxx@proxy-nn-nn-nn-nn.proximo.io --user username --password pwd https://kuksa.partio.fi/Leirirekisteri_Rajapinta/api/Osallistujat?Guid=eventId
```

The `http://proxy:xxxxx@`... part is the same as the `KUKSA_API_PROXY_URL` configuration variable.
Similarly the `username` is the same as the `KUKSA_API_USERNAME`, `pwd` is the same as `KUKSA_API_PASSWORD`, and `eventId` is `KUKSA_API_EVENTID`.
