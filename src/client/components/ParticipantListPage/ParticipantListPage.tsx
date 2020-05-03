import React, { useState, useEffect, useMemo } from 'react'
import * as Rt from 'runtypes'
import _ from 'lodash'
import { SortableHeaderCell } from '../Util/SortableHeaderCell'
import { ParticipantRowsContainer } from './containers/ParticipantRowsContainer'
import { QuickFilterContainer } from './containers/QuickFilterContainer'
import { ParticipantCount } from './containers/ParticipantCount'
import { Icon, ListOffsetSelector } from '..'
import { MassEdit } from './MassEdit'
import { SelectAll } from './SelectAll'
import { useParticipantQueryParams } from './useParticipantQueryParams'
import { Table } from '../Table'
import { useErrorContext } from '../../errors'
import { IconType } from '../Icon'
import {
  ParticipantOverview,
  OptionsByProperty,
  AvailableDates,
} from '../../model'
import { RestfulResource } from '../../RestfulResource'

export type ParticipantListColumn =
  | {
      type: 'presence' | 'profileLink' | 'date' | 'text'
      property: string
      label: string
    }
  | {
      type: 'iconWithTooltip'
      property: string
      icon: IconType
      label: { icon: IconType; tooltip: string }
    }
  | {
      type: 'boolean'
      property: string
      label: string
      true?: string
      false?: string
    }
  | { type: 'availableDates'; label: string }

const participantListColumns: readonly ParticipantListColumn[] = [
  { type: 'presence', property: 'presence', label: 'Tila' },
  { type: 'profileLink', property: 'firstName', label: 'Etunimi' },
  { type: 'profileLink', property: 'lastName', label: 'Sukunimi' },
  { type: 'date', property: 'dateOfBirth', label: 'Syntymäpäivä' },
  { type: 'text', property: 'staffPosition', label: 'Pesti' },
  { type: 'date', property: 'billedDate', label: 'Laskutettu' },
  { type: 'date', property: 'paidDate', label: 'Maksettu' },
  { type: 'text', property: 'memberNumber', label: 'Jäsennumero' },
  {
    type: 'iconWithTooltip',
    icon: 'info',
    property: 'campOfficeNotes',
    label: { icon: 'info', tooltip: 'Leiritoimiston merkinnät' },
  },
  {
    type: 'iconWithTooltip',
    icon: 'comment',
    property: 'editableInfo',
    label: { icon: 'comment', tooltip: 'Lisätiedot' },
  },
  {
    type: 'boolean',
    true: 'EVP',
    false: 'partiolainen',
    property: 'nonScout',
    label: 'Onko partiolainen?',
  },
  { type: 'text', property: 'homeCity', label: 'Kotikaupunki' },
  {
    type: 'boolean',
    property: 'interestedInHomeHospitality',
    label: 'Home hospitality',
  },
  { type: 'text', property: 'email', label: 'Sähköposti' },
  { type: 'text', property: 'phoneNumber', label: 'Puhelinnumero' },
  { type: 'text', property: 'ageGroup', label: 'Ikäkausi' },
  { type: 'text', property: 'accommodation', label: 'Majoittuminen' },
  { type: 'text', property: 'localGroup', label: 'Lippukunta' },
  { type: 'text', property: 'village', label: 'Kylä' },
  { type: 'text', property: 'subCamp', label: 'Alaleiri' },
  { type: 'text', property: 'campGroup', label: 'Leirilippukunta' },
  { type: 'availableDates', label: 'Ilmoittautumispäivät' },
]

export type QuickFilterConfiguration = Readonly<{
  filters: readonly (readonly QuickFilterDefinition[])[]
}>
export type QuickFilterDefinition = Readonly<
  | { type: 'debouncedTextField'; property: string; label: string }
  | { type: 'options'; property: string; label: string }
  | { type: 'presence'; label: string }
  | {
      type: 'generic'
      label: string
      properties: readonly Readonly<{ property: string; label: string }>[]
    }
  | { type: 'availableDates'; label: string }
>
const quickFilterConfiguration: QuickFilterConfiguration = {
  filters: [
    [
      {
        type: 'debouncedTextField',
        property: 'textSearch',
        label: 'Tekstihaku',
      },
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
      {
        type: 'generic',
        label: 'Muu kenttä',
        properties: [
          { property: 'childNaps', label: 'Lapsi nukkuu päiväunet' },
          { property: 'accommodation', label: 'Majoittautuminen' },
          { property: 'country', label: 'Maa' },
          { property: 'willOfTheWisp', label: 'Virvatuli' },
          { property: 'willOfTheWispWave', label: 'Virvatulen aalto' },
          { property: 'internationalGuest', label: 'KV-osallistuja' },
        ],
      },
    ],
  ],
}

export type ParticipantListPageProps = Readonly<{
  optionResource: RestfulResource
  participantDateResource: RestfulResource
  participantResource: RestfulResource
}>

export const ParticipantListPage: React.FC<ParticipantListPageProps> = ({
  optionResource,
  participantDateResource,
  participantResource,
}) => {
  const { showError } = useErrorContext()

  const [optionsByProperty, setOptionsByProperty] = useState<OptionsByProperty>(
    {},
  )
  useEffect((): void => {
    optionResource
      .findAll()
      .then((response) => OptionsByProperty.check(response))
      .then(
        (response) => setOptionsByProperty(response),
        (error) => showError('Hakusuodattimia ei voitu ladata', { error }),
      )
  }, [optionResource, showError])

  const [availableDates, setAvailableDates] = useState<AvailableDates>([])
  useEffect((): void => {
    participantDateResource
      .findAll()
      .then((response) => AvailableDates.check(response))
      .then(
        (response) => setAvailableDates(response),
        (err) => showError(err),
      )
  }, [participantDateResource, showError])

  const {
    offset,
    limit,
    order,
    filter,
    updateFilter,
    resetFilter,
    updateOrder,
    updateOffset,
  } = useParticipantQueryParams()

  const [participants, setParticipants] = useState<
    readonly ParticipantOverview[]
  >([])
  const [participantsLoading, setParticipantsLoading] = useState(true)
  const [participantsLoadForcer, setParticipantsLoadForcer] = useState(false)
  useEffect((): void => {
    setParticipantsLoading(true)

    const filters = {
      where: filter,
      skip: offset,
      limit: limit,
      order: getLoopbackOrderParameter(),
      include: ['dates'],
    }

    const filterParams = new URLSearchParams({
      filter: JSON.stringify(filters),
    })

    if (filter === undefined || Object.keys(filter).length === 0) {
      setParticipants([])
      setParticipantsLoading(false)
      return
    }

    participantResource
      .findAll(filterParams)
      .then((participantList) =>
        Rt.Record({ result: Rt.Array(ParticipantOverview).asReadonly() })
          .asReadonly()
          .check(participantList),
      )
      .then(
        (participantList) => {
          setParticipants(participantList.result)
          setParticipantsLoading(false)
        },
        (error) => showError('Osallistujia ei voitu ladata', { error }),
      )

    function getLoopbackOrderParameter() {
      if (!order) {
        return undefined
      }

      const strings = Object.keys(order).map((key) => `${key} ${order[key]}`)
      if (strings.length === 0) {
        return undefined
      } else if (strings.length === 1) {
        return strings[0]
      } else {
        return strings
      }
    }
  }, [
    offset,
    limit,
    order,
    filter,
    participantResource,
    showError,
    participantsLoadForcer,
  ])

  const forceReloadParticipants = () => setParticipantsLoadForcer((x) => !x)

  const [checked, setChecked] = useState<
    readonly ParticipantOverview['participantId'][]
  >([])
  const participantIds = useMemo(
    () => participants.map((participant) => participant.participantId),
    [participants],
  )
  useEffect(() => {
    setChecked([])
  }, [participants])
  const participantCount = participants.length

  const handleCheckboxChange = (
    isChecked: boolean,
    participantId: ParticipantOverview['participantId'],
  ) => {
    if (isChecked) {
      setChecked(checked.concat(participantId))
    } else {
      setChecked(_(checked).without(participantId).value())
    }
  }

  const isChecked = (
    participantId: ParticipantOverview['participantId'],
  ): boolean => checked.includes(participantId)

  const handleMassEdit = (newValue: number) => {
    participantResource
      .raw('POST', 'massAssign', {
        body: { ids: checked, newValue: newValue, fieldName: 'presence' },
      })
      .then(
        (response) => forceReloadParticipants(),
        (error) =>
          showError('Osallistujien tilan päivitys epäonnistui', { error }),
      )
  }

  return (
    <>
      <header className="content-box participant-list-page__header">
        <h1>Leiriläiset</h1>
        <div>
          <QuickFilterContainer
            configuration={quickFilterConfiguration}
            updateFilter={updateFilter}
            resetFilter={resetFilter}
            filter={filter}
            availableDates={availableDates}
            optionsByProperty={optionsByProperty}
          />
        </div>
      </header>
      <main className="content-box">
        <ParticipantCount participantCount={participantCount} />
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>
                <SelectAll
                  hideLabel
                  checked={checked}
                  participants={participantIds}
                  setChecked={setChecked}
                />
              </th>
              {participantListColumns.map((column) =>
                column.type === 'availableDates' ? (
                  <th key={column.type} colSpan={availableDates.length}>
                    {column.label}
                  </th>
                ) : (
                  <SortableHeaderCell
                    key={column.type + column.property}
                    property={column.property}
                    label={
                      typeof column.label === 'string' ? (
                        column.label
                      ) : (
                        <div title={column.label.tooltip}>
                          <Icon type={column.label.icon} />
                        </div>
                      )
                    }
                    order={order}
                    orderChanged={updateOrder}
                  />
                ),
              )}
            </tr>
          </thead>
          <tbody>
            <ParticipantRowsContainer
              isChecked={isChecked}
              checkboxCallback={handleCheckboxChange}
              columns={participantListColumns}
              availableDates={availableDates}
              offset={offset}
              participants={participants}
              loading={participantsLoading}
            />
          </tbody>
        </Table>
        <MassEdit
          checked={checked}
          participants={participantIds}
          setChecked={setChecked}
          onSubmit={handleMassEdit}
          participantsLoading={participantsLoading}
        />
        <ListOffsetSelector
          onOffsetChanged={updateOffset}
          offset={offset}
          limit={limit}
          participantCount={participantCount}
        />
      </main>
    </>
  )
}
