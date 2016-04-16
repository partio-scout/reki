import React from 'react';
import { Input } from 'react-bootstrap';
import { changeQueryParameters } from './utils';

export function getAgeGroupSelectorContainer() {
  const ageGroupSelectionKeys = [
    '',
    'perheleiriläinen',
    'tarpoja',
    'samoaja',
    'vaeltaja',
    'aikuinen',
  ];

  function AgeGroupSelectorContainer(props, context) {
    function handleChange(event) {
      const newValue = event.target.value;
      const stringified = newValue && JSON.stringify({ ageGroup: newValue });
      context.router.push(changeQueryParameters(props.location, { filter: stringified, offset: 0 }));
    }

    const {
      ageGroup: selectedValue,
    } = props.filter;
    return (
      <div>
        <form>
          <Input type="select" label="Ikäkausi" value={ selectedValue } onChange={ handleChange }>
            { ageGroupSelectionKeys.map(ageGroup => <option value={ ageGroup } key={ ageGroup }>{ ageGroup }</option>) }
          </Input>
        </form>
      </div>
    );
  }

  AgeGroupSelectorContainer.propTypes = {
    filter: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  AgeGroupSelectorContainer.contextTypes = {
    router: React.PropTypes.object,
  };

  return AgeGroupSelectorContainer;
}
