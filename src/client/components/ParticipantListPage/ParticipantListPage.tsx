import React, { useState, useEffect, useMemo } from 'react'
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
import {
  ParticipantOverview,
  OptionsByProperty,
  AvailableDates,
  QuickFilterConfiguration,
  ParticipantListColumn,
  ParticipantListFindResult,
} from '../../model'
import { RestfulResource } from '../../RestfulResource'

function isNotUndefined<T>(x: T | undefined): x is T {
  return x !== undefined
}

export type ParticipantListPageProps = {
  optionResource: RestfulResource
  participantDateResource: RestfulResource
  participantResource: RestfulResource
  quickFilters: QuickFilterConfiguration
}

export const ParticipantListPage: React.FC<ParticipantListPageProps> = ({
  optionResource,
  participantDateResource,
  participantResource,
  quickFilters,
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
  const [participantListColumns, setParticipantListColumns] = useState<
    readonly ParticipantListColumn[]
  >([])
  const [participantsLoading, setParticipantsLoading] = useState(true)
  const [participantsLoadForcer, setParticipantsLoadForcer] = useState(false)
  useEffect((): void => {
    const filterEntries = Object.entries(filter)
    if (filterEntries.length === 0) {
      setParticipants([])
      setParticipantsLoading(false)
      return
    }

    setParticipantsLoading(true)

    const orderEntries = Object.entries(order)
    const [orderBy, orderDirection] = orderEntries.length
      ? orderEntries[0]
      : [undefined, undefined]

    const filters: (string[] | undefined)[] = filterEntries.map(
      ([key, value]) => {
        if (key === 'textSearch' && typeof value === 'string') {
          return ['q', value]
        }
        if (Array.isArray(value)) {
          return [key, value.join(',')]
        }
        if (typeof value === 'string') {
          return [key, value]
        }
        if (typeof value === 'number') {
          return [key, value.toString()]
        }
        return undefined
      },
    )

    const params = filters
      .concat([
        ['offset', offset.toString()],
        ['limit', limit.toString()],
        orderBy ? (['orderBy', orderBy] as const) : undefined,
        orderDirection
          ? (['orderDirection', orderDirection] as const)
          : undefined,
      ] as (string[] | undefined)[])
      .filter(isNotUndefined)

    const filterParams = new URLSearchParams(params)

    participantResource
      .findAll(filterParams)
      .then((participantList) =>
        ParticipantListFindResult.check(participantList),
      )
      .then(
        (participantList) => {
          setParticipants(participantList.result)
          setParticipantListColumns(participantList.columns)
          setParticipantsLoading(false)
        },
        (error) => showError('Osallistujia ei voitu ladata', { error }),
      )
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
            configuration={quickFilters}
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
