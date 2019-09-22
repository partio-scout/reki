import React, { useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { SortableHeaderCell } from '../Util/SortableHeaderCell';
import { ParticipantRowsContainer } from './containers/ParticipantRowsContainer';
import { QuickFilterContainer } from './containers/QuickFilterContainer';
import { ParticipantCount } from './containers/ParticipantCount';
import { Icon, ListOffsetSelector } from '..';
import { MassEdit } from './MassEdit';
import { SelectAll } from './SelectAll';
import { useParticipantQueryParams } from './useParticipantQueryParams';
import { Table } from '../Table';
import { useErrorContext } from '../../errors';

const participantListColumns = [
  { type: 'presence', property: 'presence', label: 'Tila' },
  { type: 'profileLink', property: 'firstName', label: 'Etunimi' },
  { type: 'profileLink', property: 'lastName', label: 'Sukunimi' },
  { type: 'date', property: 'dateOfBirth', label: 'Syntymäpäivä' },
  { type: 'text', property: 'staffPosition', label: 'Pesti' },
  { type: 'date', property: 'billedDate', label: 'Laskutettu' },
  { type: 'date', property: 'paidDate', label: 'Maksettu' },
  { type: 'text', property: 'memberNumber', label: 'Jäsennumero' },
  { type: 'iconWithTooltip', icon: 'info', property: 'campOfficeNotes', label: { icon: 'info', tooltip: 'Leiritoimiston merkinnät' } },
  { type: 'iconWithTooltip', icon: 'comment', property: 'editableInfo', label: { icon: 'comment', tooltip: 'Lisätiedot' } },
  { type: 'boolean', true: 'EVP', false: 'partiolainen', property: 'nonScout', label: 'Onko partiolainen?' },
  { type: 'text', property: 'homeCity', label: 'Kotikaupunki' },
  { type: 'boolean', property: 'interestedInHomeHospitality', label: 'Home hospitality' },
  { type: 'text', property: 'email', label: 'Sähköposti' },
  { type: 'text', property: 'phoneNumber', label: 'Puhelinnumero' },
  { type: 'text', property: 'ageGroup', label: 'Ikäkausi' },
  { type: 'text', property: 'accommodation', label: 'Majoittuminen' },
  { type: 'text', property: 'localGroup', label: 'Lippukunta' },
  { type: 'text', property: 'village', label: 'Kylä' },
  { type: 'text', property: 'subCamp', label: 'Alaleiri' },
  { type: 'text', property: 'campGroup', label: 'Leirilippukunta' },
  { type: 'availableDates', label: 'Ilmoittautumispäivät' },
];

const quickFilterConfiguration = {
  filters: [
    [
      { type: 'debouncedTextField', property: 'textSearch', label: 'Tekstihaku' },
    ],
    [
      { type: 'options', property: 'ageGroup', label: 'Ikäkausi' },
      { type: 'presence', label: 'Tila' },
      { type: 'options', property: 'localGroup', label: 'Lippukunta' },
    ],
    [
      { type: 'options', property: 'subCamp', label: 'Alaleiri' },
      { type: 'options', property: 'village', label: 'Kylä' },
      { type: 'options', property: 'campGroup', label: 'Leirilippukunta' },
    ],
    [
      { type: 'generic', label: 'Muu kenttä', properties: [
          { property: 'childNaps', label: 'Lapsi nukkuu päiväunet' },
          { property: 'accommodation', label: 'Majoittautuminen' },
          { property: 'country', label: 'Maa' },
          { property: 'willOfTheWisp', label: 'Virvatuli' },
          { property: 'willOfTheWispWave', label: 'Virvatulen aalto' },
          { property: 'internationalGuest', label: 'KV-osallistuja' },
      ] },
    ],
  ],
};

export function ParticipantListPage({ optionResource, participantDateResource, participantResource }) {
  const { showError } = useErrorContext();

  const [optionsByProperty, setOptionsByProperty] = useState([]);
  useEffect(() => {
    optionResource.findAll()
      .then(response => setOptionsByProperty(response),
            err => showError(err, 'Hakusuodattimia ei voitu ladata'));
  }, [optionResource, showError]);

  const [availableDates, setAvailableDates] = useState([]);
  useEffect(() => {
    participantDateResource.findAll()
      .then(response => setAvailableDates(response),
            err => showError(err));
  }, [participantDateResource, showError]);

  const {
    offset,
    limit,
    order,
    filter,
    updateFilter,
    resetFilter,
    updateOrder,
    updateOffset,
  } = useParticipantQueryParams();

  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [participantsLoadForcer, setParticipantsLoadForcer] = useState(false);
  useEffect(() => {
    setParticipantsLoading(true);

    const filters = {
      where: filter,
      skip: offset,
      limit: limit,
      order: getLoopbackOrderParameter(),
      include: ['dates'],
    };

    const filterString = `filter=${encodeURIComponent(JSON.stringify(filters))}`;

    if (filter === undefined || Object.keys(filter).length === 0) {
      setParticipants([]);
      setParticipantsLoading(false);
      return;
    }

    participantResource.findAll(filterString)
      .then(participantList => {
        setParticipants(participantList.result);
        setParticipantsLoading(false);
      }, err => showError(err, 'Osallistujia ei voitu ladata'));

    function getLoopbackOrderParameter() {
      if (!order) {
        return undefined;
      }

      const strings = Object.keys(order).map(key => `${key} ${order[key]}`);
      if (strings.length === 0) {
        return undefined;
      } else if (strings.length === 1) {
        return strings[0];
      } else {
        return strings;
      }
    }
  }, [offset, limit, order, filter, participantResource, showError, participantsLoadForcer]);

  const forceReloadParticipants = () => setParticipantsLoadForcer(x => !x);

  const [checked, setChecked] = useState([]);
  const participantIds = useMemo(() => participants.map(participant => participant.participantId), [participants]);
  useEffect(() => {
    setChecked([]);
  }, [participants]);
  const participantCount = participants.length;

  const handleCheckboxChange = (isChecked, participantId) => {
    if (isChecked) {
      setChecked(checked.concat(participantId));
    } else {
      setChecked(_(checked).without(participantId).value());
    }
  };

  const isChecked = participantId => checked.includes(participantId);

  const handleMassEdit = newValue => {
    participantResource.raw('post', 'massAssign', { body: { ids: checked, newValue: newValue, fieldName: 'presence' } })
      .then(response => forceReloadParticipants(),
            err => showError(err, 'Osallistujien tilan päivitys epäonnistui'));
  };

  return (
    <>
      <header className="content-box participant-list-page__header">
          <h1>Leiriläiset</h1>
        <div>
          <QuickFilterContainer configuration={ quickFilterConfiguration } updateFilter={ updateFilter } resetFilter={ resetFilter } filter={ filter } availableDates={ availableDates } optionsByProperty={ optionsByProperty } />
        </div>
      </header>
      <main className="content-box">
        <ParticipantCount participantCount={ participantCount } />
        <Table>
            <thead>
              <tr>
                <th></th>
                <th><SelectAll hideLabel checked={ checked } participants={ participantIds } setChecked={ setChecked } /></th>
                {
                  participantListColumns.map(column => column.type === 'availableDates' ? (
                    <th key={ column.type + column.property } colSpan={ availableDates.length }>{ column.label }</th>
                  ) : (
                    <SortableHeaderCell
                      key={ column.type + column.property }
                      property={ column.property }
                      label={ typeof column.label === 'string' ? column.label : (<div title={ column.label.tooltip }><Icon type={ column.label.icon } /></div>) }
                      order={ order }
                      orderChanged={ updateOrder }
                    />
                  ))
                }
              </tr>
            </thead>
            <tbody>
              <ParticipantRowsContainer isChecked={ isChecked } checkboxCallback={ handleCheckboxChange } columns={ participantListColumns } availableDates={ availableDates } offset={ offset } participants={ participants } loading={ participantsLoading } />
            </tbody>
          </Table>
        <MassEdit checked={ checked } participants={ participants } setChecked={ setChecked } onSubmit={ handleMassEdit } participantsLoading={ participantsLoading } />
        <ListOffsetSelector onOffsetChanged={ updateOffset } offset={ offset } limit={ limit } participantCount={ participantCount } />
      </main>
    </>
  );
}
