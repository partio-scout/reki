import './main.css'
import 'react-hot-loader'

import React from 'react'
import { render } from 'react-dom'
import moment from 'moment'
import * as Rt from 'runtypes'

import {
  App,
  Homepage,
  ParticipantDetailsPage,
  ParticipantListPage,
  UserManagementPage,
  AuditLogPage,
} from './components'
import { QuickFilterConfiguration } from './model'
import { RestfulResource } from './RestfulResource'
import { ErrorProvider } from './errors'

moment.locale('fi')

const participantResource = RestfulResource('/api/participants')
const participantDateResource = RestfulResource('/api/participantDates')
const optionResource = RestfulResource('/api/options')
const participantListFiltersResource = RestfulResource(
  '/api/participantListFilters',
)

const RouteInfo = Rt.Union(
  Rt.Record({ route: Rt.Literal('participantsList') }),
  Rt.Record({
    route: Rt.Literal('participantDetails'),
    participantId: Rt.String,
  }),
  Rt.Record({ route: Rt.Literal('admin') }),
  Rt.Record({ route: Rt.Literal('auditLog') }),
  Rt.Record({ route: Rt.Literal('homePage') }),
)
type RouteInfo = Rt.Static<typeof RouteInfo>

const routeInfoElement = document.querySelector('#route-info')
const parsedRouteInfo = RouteInfo.check(
  JSON.parse(routeInfoElement!.textContent!),
)
const Router: React.FC<{ routeInfo: RouteInfo }> = ({ routeInfo }) => {
  const [quickFilterConfiguration, setQuickFilterConfiguration] =
    React.useState<QuickFilterConfiguration>([])

  React.useEffect(() => {
    participantListFiltersResource
      .findAll()
      .then(QuickFilterConfiguration.check)
      .then((filters) => setQuickFilterConfiguration(filters))
  }, [])

  switch (routeInfo.route) {
    case 'participantsList':
      return (
        <ParticipantListPage
          optionResource={optionResource}
          participantDateResource={participantDateResource}
          participantResource={participantResource}
          quickFilters={quickFilterConfiguration}
        />
      )
    case 'participantDetails':
      return (
        <ParticipantDetailsPage
          participantResource={participantResource}
          id={routeInfo.participantId}
        />
      )
    case 'admin':
      return <UserManagementPage />
    case 'auditLog':
      return <AuditLogPage />
    case 'homePage':
      return <Homepage />
  }
}

render(
  <ErrorProvider>
    <App>
      <Router routeInfo={parsedRouteInfo} />
    </App>
  </ErrorProvider>,
  document.getElementById('app'),
)
