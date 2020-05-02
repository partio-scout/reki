import React, { useState, useEffect, useCallback } from 'react';
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
import { RestfulResource } from '../../RestfulResource';
import { ParticipantDetails } from '../../model';

const Panel: React.FC<{ header: React.ReactNode }> = ({ header, children }) => (
  <section className="content-box participant-details-panel">
    <header>
      <h3>{ header }</h3>
    </header>
    { children }
  </section>
);

export type ParticipantDetailsPageProps = Readonly<{
  id: string;
  participantResource: RestfulResource;
}>

export const ParticipantDetailsPage: React.FC<ParticipantDetailsPageProps> = ({ id, participantResource }) => {
  const [participantFromServer, setParticipantFromServer] = useState<ParticipantDetails | undefined>(undefined);
  const [participantDetails, setParticipant] = useState<ParticipantDetails | undefined>(undefined);
  const [campOfficeNotesSaving, setCampOfficeNotesSaving] = useState(false);
  const [editableInfoSaving, setEditableInfoSaving] = useState(false);
  const [presenceSaving, setPresenceSaving] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState<number | undefined>(undefined);
  const { showError } = useErrorContext();

  const loadParticipant = useCallback(() => {
    participantResource.findById(id)
      .then(participant => ParticipantDetails.check(participant))
      .then(participant => setParticipantFromServer(participant))
      .catch(error => {
        setParticipantFromServer(undefined);
        showError('Osallistujan tietojen lataaminen epäonnistui', { error });
      });
  }, [id, participantResource, showError]);

  useEffect((): void => {
    participantResource.findById(id)
      .then(participant => ParticipantDetails.check(participant))
      .then(participant => setParticipantFromServer(participant))
      .catch(error => {
        setParticipantFromServer(undefined);
        showError('Osallistujan tietojen lataaminen epäonnistui', { error });
      });
  }, [id, participantResource, showError]);

  useEffect((): void => {
    setParticipant(participantFromServer);
    setCampOfficeNotesSaving(false);
    setEditableInfoSaving(false);
    setPresenceSaving(false);
  }, [participantFromServer]);

  function handlePresenceChange(property: string, value: number | undefined): void {
    setSelectedPresence(value);
  }

  function handleChange(property: string, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    if (participantDetails) {
      setParticipant({ ...participantDetails, [property]: event.target.value });
    }
    setCampOfficeNotesSaving(false);
    setEditableInfoSaving(false);
  }

  function saveCampOfficeNotes(): void {
    setCampOfficeNotesSaving(true);
    save('campOfficeNotes');
  }

  function saveEditableInfo(): void {
    setEditableInfoSaving(true);
    save('editableInfo');
  }

  function updateProperty(participantId: ParticipantDetails['participantId'], property: string, value: unknown): void {
    participantResource.raw('POST', 'massAssign', {
      body: { ids: [ participantId ], fieldName: property, newValue: value } })
      .then(participants => {
        loadParticipant();
      }, error => showError('Osallistujan tallennus epäonnistui', { error }));
  }

  function savePresence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (participantDetails && selectedPresence) {
      setParticipant({ ...participantDetails, presence: selectedPresence });
      updateProperty(participantDetails.participantId, 'presence', selectedPresence);
    }
  }

  function save(property: string) {
    if (participantDetails) {
      updateProperty(
        participantDetails.participantId,
        property,
        (participantDetails as any)[property]);
    }
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
      const rows = _.map(selection, row => <dd key={ row.selectionName }>{ row.selectionName }</dd>);
      return <dl key={ selection[0].kuksaGroupId }><dt>{ _.head(selection)!.groupName }</dt>{ rows }</dl>;
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
           <Presence value={ presence ?? undefined } />
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
              value={ participantDetails.campOfficeNotes || '' }
              onChange= { handleChange }
              rows={ 8 }
            />
            <LoadingButton loading={ campOfficeNotesSaving } onClick={ saveCampOfficeNotes } label="Tallenna" labelWhileLoading="Tallennetaan…"/>
          </Panel>
          <Panel header="Lisätiedot">
            <PropertyTextArea
              property= "editableInfo"
              value={ participantDetails.editableInfo || '' }
              onChange= { handleChange }
              rows={ 6 }
            />
            <LoadingButton loading={ editableInfoSaving } onClick={ saveEditableInfo } label="Tallenna" labelWhileLoading="Tallennetaan…"/>
          </Panel>
        </main>
      </>
    );
  } else {
    return (
      <Spinner />
    );
  }
};
