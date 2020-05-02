import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import _ from 'lodash'
import { createBrowserHistory } from 'history'
import { FilterSelection, Ordering } from '../../model'

export type ParticipantQueryParams = Readonly<{
  filter: FilterSelection
  order: Ordering
  offset: number
  limit: number
  updateFilter: (property: string, newValue: unknown) => void
  resetFilter: () => void
  updateOrder: (newOrder: Ordering) => void
  updateOffset: (newOffset: number) => void
}>

export function useParticipantQueryParams(): ParticipantQueryParams {
  const history = useRef(createBrowserHistory())

  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(200)
  const [filter, setFilter] = useState<FilterSelection>({})
  const [order, setOrder] = useState<Ordering>({})

  useEffect(() => {
    const queryToState = (search: string) => {
      const params = new URLSearchParams(search)
      setOffset(getOffset(params))
      setLimit(getLimit(params))
      setOrder((prevOrder) => {
        const newOrder = getOrder(params)
        return _.isEqual(prevOrder, newOrder) ? prevOrder : newOrder
      })
      setFilter((prevFilter) => {
        const newFilter = getFilter(params)
        return _.isEqual(prevFilter, newFilter) ? prevFilter : newFilter
      })
    }

    queryToState(history.current.location.search)

    return history.current.listen((newLocation, action) => {
      queryToState(newLocation.search)
    })
  }, [])

  const updateQueryParams = useCallback(
    (params) => {
      const newQueryParams = {
        filter,
        order,
        offset,
        limit,
        ...params,
      }

      if (Object.keys(newQueryParams.filter).length === 0) {
        delete newQueryParams.filter
      } else {
        newQueryParams.filter = JSON.stringify(newQueryParams.filter)
      }
      if (Object.keys(newQueryParams.order).length === 0) {
        delete newQueryParams.order
      } else {
        newQueryParams.order = JSON.stringify(newQueryParams.order)
      }
      if (newQueryParams.offset === 0) {
        delete newQueryParams.offset
      }
      if (newQueryParams.limit === 200) {
        delete newQueryParams.limit
      }

      const search = new URLSearchParams(newQueryParams).toString()
      const { pathname, hash } = history.current.location

      history.current.push({
        pathname,
        search,
        hash,
      })
    },
    [filter, order, offset, limit],
  )

  const updateFilter = useCallback(
    (parameterName: string, newValue: unknown) => {
      const derp = { ...filter, [parameterName]: newValue }
      const newFilter = _.pickBy(derp, (value) => value)
      updateQueryParams({ filter: newFilter, offset: 0 })
    },
    [updateQueryParams, filter],
  )

  const resetFilter = useCallback(
    () => updateQueryParams({ filter: {}, offset: 0 }),
    [updateQueryParams],
  )

  const updateOrder = useCallback(
    (newOrder: Ordering) => updateQueryParams({ order: newOrder }),
    [updateQueryParams],
  )

  const updateOffset = useCallback(
    (newOffset: number) => updateQueryParams({ offset: newOffset }),
    [updateQueryParams],
  )

  return useMemo(
    () => ({
      filter,
      order,
      offset,
      limit,
      updateFilter,
      resetFilter,
      updateOrder,
      updateOffset,
    }),
    [
      filter,
      order,
      offset,
      limit,
      updateFilter,
      resetFilter,
      updateOrder,
      updateOffset,
    ],
  )
}

function getOrder(params: URLSearchParams): Ordering {
  try {
    const paramsOrder = params.get('order')
    return paramsOrder ? JSON.parse(paramsOrder) : {}
  } catch (err) {
    return {}
  }
}

function getFilter(params: URLSearchParams): FilterSelection {
  try {
    const paramsFilter = params.get('filter')
    return paramsFilter ? JSON.parse(paramsFilter) : {}
  } catch (err) {
    return {}
  }
}

function getOffset(params: URLSearchParams): number {
  const offset = Number(params.get('offset'))
  return Number.isNaN(offset) ? 0 : offset
}

function getLimit(params: URLSearchParams): number {
  if (!params.has('limit')) {
    return 200
  }
  const limit = Number(params.get('limit'))
  return Number.isNaN(limit) ? 200 : limit
}
