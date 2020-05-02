import React from 'react'
import { Presence } from '../../components'
import { Table } from '../Table'
import { RegistryUser } from '../../model'

type RegistryUserRowProps = Readonly<{
  registryUser: RegistryUser
  onBlock: () => void
  onUnblock: () => void
}>

const RegistryUserRow: React.FC<RegistryUserRowProps> = (props) => {
  const { registryUser, onBlock, onUnblock } = props

  const {
    firstName,
    lastName,
    memberNumber,
    phoneNumber,
    email,
    presence,
    blocked,
  } = registryUser

  const blockStatusToggleButton = blocked ? (
    <button onClick={onUnblock}>Salli sisäänkirjautuminen</button>
  ) : (
    <button onClick={onBlock}>Estä sisäänkirjautuminen</button>
  )

  return (
    <tr>
      <td>
        <Presence value={presence} />
      </td>
      <td>{`${firstName} ${lastName}`}</td>
      <td>{memberNumber}</td>
      <td>{phoneNumber}</td>
      <td>{email}</td>
      <td>{blockStatusToggleButton}</td>
    </tr>
  )
}

type RegistryUserTableProps = Readonly<{
  registryUsers: readonly RegistryUser[]
  onBlock: (userId: RegistryUser['id']) => void
  onUnblock: (userId: RegistryUser['id']) => void
}>

export const RegistryUserTable: React.FC<RegistryUserTableProps> = ({
  registryUsers,
  onBlock,
  onUnblock,
}) => (
  <Table>
    <thead>
      <tr>
        <th>Tila</th>
        <th>Nimi</th>
        <th>Jäsennumero</th>
        <th>Puhelinnumero</th>
        <th>Sähköposti</th>
        <th>Lukittu?</th>
      </tr>
    </thead>
    <tbody>
      {registryUsers.map((registryUser) => (
        <RegistryUserRow
          key={registryUser.id}
          registryUser={registryUser}
          onBlock={() => {
            onBlock(registryUser.id)
          }}
          onUnblock={() => {
            onUnblock(registryUser.id)
          }}
        />
      ))}
    </tbody>
  </Table>
)
