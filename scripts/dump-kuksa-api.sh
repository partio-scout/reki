#!/bin/bash

set -euo pipefail

export http_proxy=${KUKSA_API_PROXY_URL:-}
export https_proxy=${KUKSA_API_PROXY_URL:-}

ENDPOINT=${KUKSA_API_ENDPOINT:-}
EVENTID=${KUKSA_API_EVENTID:-}
USERNAME=${KUKSA_API_USERNAME:-}
PASSWORD=${KUKSA_API_PASSWORD:-}

if [ -z $ENDPOINT ]; then
  echo "Specify KUKSA_API_ENDPOINT"
  exit 1
fi

if [ -z $EVENTID ]; then
  echo "Specify KUKSA_API_EVENTID"
  exit 1
fi

if [ -z $USERNAME ]; then
  echo "Specify KUKSA_API_USERNAME"
  exit 1
fi

if [ -z $PASSWORD ]; then
  echo "Specify KUKSA_API_PASSWORD"
  exit 1
fi

RESOURCES=(Tapahtuma TapahtumaAlaleirit TapahtumaKylat TapahtumaKysymyssarjat TapahtumaLisatietokentat TapahtumaLisavalinnanPaaryhmat TapahtumaLisavalinnat TapahtumaMaksunPaaryhmat TapahtumaMaksut Leirilippukunnat LeirilippukunnatLisatietokentat LeirilippukunnatLisavalinnat LeirilippukunnatMaksut Osallistujat OsallistujatLisatietokentat OsallistujatLisavalinnat OsallistujatMaksut OsallistujatMaksunTila Ryhmat RyhmatLisatietokentat RyhmatLisavalinnat RyhmatMaksut)

mkdir -p kuksa-dump

for RESOURCE in ${RESOURCES[*]}
do
  echo "Downloading ${RESOURCE}"
  wget --quiet --header='Accept: application/json' --user=$USERNAME --password=$PASSWORD -O "kuksa-dump/${RESOURCE}.json" "${ENDPOINT}/${RESOURCE}?Guid=${EVENTID}"
done
