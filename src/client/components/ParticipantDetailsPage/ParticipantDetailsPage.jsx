import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Spinner from 'react-spinner';
import { ParticipantDates } from './ParticipantDates';
import {
  LoadingButton,
  Presence,
  PresenceHistory,
  PresenceSelector,
  PropertyTextArea,
} from '../../components';
import { useErrorContext } from '../../errors';

const Panel = ({ header, children }) => (
  <section className="content-box participant-details-panel">
    <header>
      <h3>{ header }</h3>
    </header>
    { children }
  </section>
);

export function ParticipantDetailsPage({ id, participantResource }) {
  const [participantFromServer, setParticipantFromServer] = useState(undefined);
  const [participantDetails, setParticipant] = useState(undefined);
  const [campOfficeNotesSaving, setCampOfficeNotesSaving] = useState(false);
  const [editableInfoSaving, setEditableInfoSaving] = useState(false);
  const [presenceSaving, setPresenceSaving] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState('');
  const { showError } = useErrorContext();

  useEffect(() => {
    participantResource.findById(id)
      .then(participant => setParticipantFromServer(participant))
      .catch(err => {
        setParticipantFromServer(undefined);
        showError(err, 'Osallistujan tietojen lataaminen epäonnistui');
      });
  }, [id, participantResource, showError]);

  useEffect(() => {
    setParticipant(participantFromServer);
    setCampOfficeNotesSaving(false);
    setEditableInfoSaving(false);
    setPresenceSaving(false);
  }, [participantFromServer]);

  function handlePresenceChange(property, value) {
    setSelectedPresence(value);
  }

  function handleChange(property, event) {
    setParticipant({ ...participantDetails, [property]: event.target.value });
    setCampOfficeNotesSaving(false);
    setEditableInfoSaving(false);
  }

  function saveCampOfficeNotes() {
    setCampOfficeNotesSaving(true);
    save('campOfficeNotes');
  }

  function saveEditableInfo() {
    setEditableInfoSaving(true);
    save('editableInfo');
  }

  function updateProperty(participantId, property, value) {
    participantResource.raw('post', 'massAssign', {
      body: { ids: [ participantId ], fieldName: property, newValue: value } })
      .then(participants => {
        if (property === 'presence') {
          this.fetchParticipantById(participants[0].participantId);
        }
        this.participantPropertyUpdated(property, participants);
      }, err => showError(err, 'Osallistujan tallennus epäonnistui'));
  }

  function savePresence(event) {
    event.preventDefault();
    if (selectedPresence) {
      setParticipant({ ...participantDetails, presence: selectedPresence });
      updateProperty(participantDetails.participantId, 'presence', selectedPresence);
    }
  }

  function save(property) {
    updateProperty(
      participantDetails.participantId,
      property,
      participantDetails[property]);
  }

  if (participantDetails) {
    const {
      firstName,
      lastName,
      nickname,
      dateOfBirth,
      nonScout,
      billedDate,
      paidDate,
      memberNumber,
      homeCity,
      country,
      email,
      phoneNumber,
      ageGroup,
      localGroup,
      subCamp,
      campGroup,
      village,
      internationalGuest,
      staffPosition,
      staffPositionInGenerator,
      swimmingSkill,
      willOfTheWisp,
      willOfTheWispWave,
      guardianOne,
      guardianTwo,
      diet,
      familyCampProgramInfo,
      childNaps,
      dates,
      allergies,
      selections,
    } = participantDetails;

    const participantName = `${firstName} ${lastName}`;
    const participantStatus = internationalGuest ? 'KV-osallistuja' : ( nonScout ? 'EVP' : `Partiolainen (jäsennumero: ${memberNumber})` );

    const formattedBilledDate = billedDate ? moment(billedDate).format('D.M.YYYY') : '–';
    const formattedPaidDate = paidDate ? moment(paidDate).format('D.M.YYYY') : '–';

    const presence = participantDetails.presence;
    const presenceHistory = participantDetails.presenceHistory || [];

    const allergyNames = _.map(allergies, row => row.name);

    const familyCampSelections = _.groupBy(selections, row => row.kuksaGroupId);

    const renderedFamilyCampSelections = _.map(familyCampSelections, selection => {
      const rows = _.map(selection, row => <dd>{ row.selectionName }</dd>);
      return <dl><dt>{ _.head(selection).groupName }</dt>{ rows }</dl>;
    });

    return (
      <>
        <header className="content-box participant-details-header">
          <h1>
            { participantName }
            <small> (synt. { moment(dateOfBirth).format('D.M.YYYY') })</small>
          </h1>
          <h4>{ participantStatus }</h4>
        </header>
        <main className="participant-details-container">
          <Panel header="Yhteystiedot">
            <dl>
              <dt>Puhelin</dt>
              <dd>{ phoneNumber || '–' }</dd>
              <dt>Sähköposti</dt>
              <dd>{ email || '–' }</dd>
              <dt>Huoltajat</dt>
              <dd>{ guardianOne || '–' }</dd>
              <dd>{ guardianTwo || '–' }</dd>
              <dt>Kotikunta</dt>
              <dd>{ homeCity || '–' }</dd>
            </dl>
          </Panel>
          <Panel header="Laskutustiedot">
            <dl>
              <dt>Laskutettu</dt>
              <dd>{ formattedBilledDate || '–' }</dd>
              <dt>Maksettu</dt>
              <dd>{ formattedPaidDate || '–' }</dd>
            </dl>
          </Panel>
          <Panel header="Pesti">
            <dl>
              <dt>Pesti</dt>
              <dd>{ staffPosition || '–' }</dd>
              <dt>Pestitieto kehittimestä</dt>
              <dd>{ staffPositionInGenerator || '–' }</dd>
            </dl>
          </Panel>
          <Panel header="Osallistujan tiedot">
            <dl>
              <dt>Partionimi</dt>
              <dd>{ nickname || '–' }</dd>
              <dt>Ikäkausi</dt>
              <dd>{ ageGroup || '–' }</dd>
              <dt>Uimataito</dt>
              <dd>{ swimmingSkill || '–' }</dd>
              <dt>Lippukunta</dt>
              <dd>{ localGroup || '–' }</dd>
              <dt>Maa</dt>
              <dd>{ country || '–' }</dd>
              <dt>Leirilippukunta</dt>
              <dd>{ campGroup || '–' }</dd>
              <dt>Kylä</dt>
              <dd>{ village || '–' }</dd>
              <dt>Alaleiri</dt>
              <dd>{ subCamp || '–' }</dd>
              <dt>Virvatuli</dt>
              <dd>{ willOfTheWisp || '–' }</dd>
              <dt>Virvatuliaalto</dt>
              <dd>{ willOfTheWispWave || '–' }</dd>
            </dl>
          </Panel>
          <Panel header="Perheleiri">
            <dl>
              <dt>Ohjelma</dt>
              <dd>{ familyCampProgramInfo || '–' }</dd>
              <dt>Päiväunet</dt>
              <dd>{ childNaps || '–' }</dd>
            </dl>
            { renderedFamilyCampSelections }
          </Panel>
          <Panel header="Läsnäolo">
           <Presence value={ presence } />
           <form onSubmit={ savePresence }>
             <PresenceSelector onChange={ handlePresenceChange } property="presence" label="Muuta tilaa" currentSelection={ { presence: selectedPresence } } />
             <LoadingButton loading={ presenceSaving } label="Tallenna" labelWhileLoading="Tallennetaan…"/>
           </form>
           <PresenceHistory value={ presenceHistory } />
          </Panel>
          <Panel header="Ilmoittautumispäivät">
            <ParticipantDates dates={ dates } />
          </Panel>
          <Panel header="Allergiat ja erityisruokavaliot">
            { _.isEmpty(allergyNames) && _.isEmpty(diet)  ? <p>Ei allergioita</p> : '' }
            { allergyNames ? <p>{ allergyNames.join(', ') }</p> : '' }
            { diet ? <p>{ diet }</p> : '' }
          </Panel>
          <Panel header="Leiritoimiston merkinnät">
            <PropertyTextArea
              property= "campOfficeNotes"
              value={ participantDetails.campOfficeNotes }
              onChange= { handleChange }
              rows={ 8 }
            />
            <LoadingButton loading={ campOfficeNotesSaving } onClick={ saveCampOfficeNotes } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
          </Panel>
          <Panel header="Lisätiedot">
            <PropertyTextArea
              property= "editableInfo"
              value={ participantDetails.editableInfo }
              onChange= { handleChange }
              rows={ 6 }
            />
            <LoadingButton loading={ editableInfoSaving } onClick={ saveEditableInfo } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
          </Panel>
        </main>
      </>
    );
  } else {
    return (
      <Spinner />
    );
  }
}
