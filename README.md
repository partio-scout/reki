# REKI
Camp registry system that integrates with Kuksa. Originally developed for Roihu.

Builds in circleci: https://circleci.com/gh/partio-scout/workflows/reki

## Developing with Docker

### Prerequisites
You need to install [Docker](https://docker.com) and [Docker compose](https://docs.docker.com/compose/install/). Nvm is also highly recommended, but you can also just install the correct (or equivalent) node version globally. See the correct version in the .nvmrc file.

### Installation
Clone this repository into a local directory.
- If you are using nvm, run `nvm install` in that directory.
- Run `npm install`.
- Run `docker-compose build` to build the docker containers.

### Running the app
- If you are using nvm, run `nvm use`.
- Run `npm run watch` to start the services.

The app is now running at `http://localhost:8080`.

## ES6
ES6 syntax is supported and should be used in all files, including the module syntax.

## Configuring your REKI installation

See conf/test.config.js for an example configuration.

## Setting up a production environment in Heroku

The easiest way to set up a production environment is to use [Heroku](https://heroku.com/).

### Setting up the application

Create a Heroku account and get familiar with the basics in the [Heroku documentation](https://devcenter.heroku.com/).

Open this link: [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy). It will set up most of the required things for you.

Select a name for your app. A url to access the app will be created based on the name: `https://<app-name>.herokuapp.com`.

Select the EU region for your app.

You can also use a custom domain - see Heroku's documentation on how to do that. In that case, replace https://<app-name>.herokuapp.com with your real domain throughout this document. You will also need to set up HTTPS for your custom domain - REKI only works through HTTPS in production.

Set the `REKI_BASE_URL` environment variable to the base url of the reki installation. This needs to be an absolute url starting with https, for example `https://reki.finnjamboree.fi` or `https://finnjamboree.fi/reki/`.

### Setting up PartioID login

Using PartioID requires that the settings for your REKI installation have been been configured at the PartioID identity provider (id.partio.fi). For this you need to contact the ICT team of Suomen Partiolaiset, sp-it-ryhma@lista.partio.fi.

First off verify your environment variables:
- Set `PARTIOID_USE_PRODUCTION` to *true*. This means the application uses the real PartioID, id.partio.fi. If you leave this unset, the application will try use the PartioID test environment, partioid-test.partio.fi.
- Verify that your `REKI_BASE_URL` environment variable is correctly set as desribed in the previous section.

Ask the ICT team to add a new service provider (SP) entry for Reki in the identity provider settings, given the metadata available on your reki instance, at the url `<REKI_BASE_URL>/saml/metadata` or `<REKI_BASE_URL>/saml/metadata.php`.

#### Creating your fist user

To test the PartioID login, create a user. Matching users from PartioID to the REKI user database happens with the member number. Thus, create a user with e.g. your own information and member number. You can do this by opening executing `npm run create-user` through `heroku run`, for example:

  heroku run npm run create-user

Make sure to enter the member number correctly.

Once the user has been created, you can log in using PartioID and see if it works.

#### Troubleshooting PartioID

- If you get an error in the PartioID end, most likely the entityId has been set incorrectly in REKI (check your trailing slashes!) or the configuration for REKI in the PartioID end is missing altogether.
- If you get an error from the REKI end, see Heroku logs for errors. Possible causes include (but are not limited to) system time differing for more than 30 seconds between PartioID and REKI, outdated certificate (see certs/partioid) or incorrect member number of the local user.

### Configuring the Kuksa integration

Using the Kuksa integration requires that:

- the event is a "suurtapahtuma" in Kuksa (regular events don't expose an API)
- the fields you want to appear in REKI have been set to be visible over the API in the Kuksa event settings
- the source IP address you will use to access the API has been whitelisted in Kuksa

You will need to contact the member registry coordinator at the main office of Suomen Partiolaiset to make the configurations at the Kuksa end. You will likely need to wait some time for the configuration. Simply tell them what your event name in kuksa is and what your static IP address is, and they will get back to you with the required values for the configuration.

Due to the IP whitelisting in Kuksa, the integration won't work on Heroku directly. The IP addresses of Heroku dynos change often and Kuksa expects a certain IP every time. For this reason you will need to use a proxy with a static IP. If you deployed your application with the deployment button, you will have proximo configured for you. To find out the IP address, open the proximo link on the resources tab in Heroku. With proximo no other configuration is necessary.

You will need to set the following environment variables for the Kuksa integration to work:

- KUKSA_API_USERNAME: the username for the Kuksa integration
- KUKSA_API_PASSWORD: the password for the Kuksa integration
- KUKSA_API_EVENTID: the id (a GUID) of the event
- KUKSA_API_PROXY_URL: If using a proxy provider other than Proximo, use this to specify the proxy url.
