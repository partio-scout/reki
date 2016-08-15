import React from 'react';
import { Modal, Button, Input, Col, Row } from 'react-bootstrap';
import _ from 'lodash';

import { FormErrorMessages } from '../../components';

const Role = props => {
  const {
    value,
    role,
    onRoleChange,
  } = props;

  function onChecked(event) {
    onRoleChange(role, event.target.checked);
  }

  if (!role) {
    return <div></div>;
  } else {
    return (
      <Input type="checkbox" label={ role } checked={ value } onChange={ onChecked }/>
    );
  }
};

Role.propTypes = {
  value: React.PropTypes.bool,
  role: React.PropTypes.string,
  onRoleChange: React.PropTypes.func,
};

export function RegistryUserForm(props) {
  const {
    title,
    registryUser,
    roles,
    onPropertyChange,
    onRoleChange,
    onCancel,
    onSave,
    validationErrors,
  } = props;

  let roleCheckboxes = '';
  if (roles && roles.length !== 0) {
    roleCheckboxes = _.map(roles, (role, index) => (
        <Row key={ index }>
          <Col smOffset={ 1 } sm={ 11 }>
            <Role role={ role } value={ _.indexOf(registryUser.roles, role) > -1 } onRoleChange={ onRoleChange }/>
          </Col>
        </Row>
      )
    );
  } else {
    roleCheckboxes = (
      <p>Ei rooleja valittavissa.</p>
    );
  }

  return (
    <Modal show={ true } onHide={ onCancel }>
      <Modal.Header closeButton>
        <Modal.Title>{ title }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="form-horizontal">
          <FormErrorMessages messages={ validationErrors } />
          <Input label="Käyttäjän etunimi" value={ registryUser.firstName } onChange={ function(e) { onPropertyChange('firstName', e.target.value); } } type="text" labelClassName="col-xs-3" wrapperClassName="col-xs-9"/>
          <Input label="Käyttäjän sukunimi" value={ registryUser.lastName } onChange={ function(e) { onPropertyChange('lastName', e.target.value); } } type="text" labelClassName="col-xs-3" wrapperClassName="col-xs-9"/>
          <Input label="Käyttäjän jäsennumero" value={ registryUser.memberNumber } onChange={ function(e) { onPropertyChange('memberNumber', e.target.value); } } type="text" labelClassName="col-xs-3" wrapperClassName="col-xs-9"/>
          <Input label="Käyttäjän sähköposti" value={ registryUser.email } onChange={ function(e) { onPropertyChange('email', e.target.value); } } type="text" labelClassName="col-xs-3" wrapperClassName="col-xs-9"/>
          <Input label="Käyttäjän puhelinnumero" value={ registryUser.phoneNumber } onChange={ function(e) { onPropertyChange('phoneNumber', e.target.value); } } type="text" labelClassName="col-xs-3" wrapperClassName="col-xs-9"/>
        </form>
        <b>Käyttäjän roolit</b>
        { roleCheckboxes }
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={ onCancel }>Peruuta</Button>
        <Button bsStyle="primary" onClick={ onSave }>Tallenna</Button>
      </Modal.Footer>
    </Modal>
  );
}

RegistryUserForm.propTypes = {
  title: React.PropTypes.string,
  registryUser: React.PropTypes.object,
  roles: React.PropTypes.array,
  onPropertyChange: React.PropTypes.func,
  onRoleChange: React.PropTypes.func,
  onCancel: React.PropTypes.func,
  onSave: React.PropTypes.func,
  validationErrors: React.PropTypes.array,
};
