import React from 'react';
import { Input } from 'react-bootstrap';
import { changeQueryParameters } from './utils';

export function getQuickFilterContainer() {
  const ageGroupSelectionKeys = [
    '',
    'perheleiriläinen',
    'tarpoja',
    'samoaja',
    'vaeltaja',
    'aikuinen',
  ];

  const subCampSelectionKeys = [
    '',
    'humina',
    'hurma',
    'polte',
    'raiku',
    'riehu',
    'syke',
    'unity',
  ];

  function QuickFilterContainer(props, context) {
    function getChangeHandler(parameterName) {
      return function(event) {
        const newValue = event.target.value;
        const stringified = newValue && JSON.stringify({ [parameterName]: newValue });
        context.router.push(changeQueryParameters(props.location, { filter: stringified, offset: 0 }));
      };
    }

    const {
      ageGroup: selectedAgeGroup = '',
      subCamp: selectedSubCamp = '',
    } = props.filter;
    return (
      <div>
        <form className="form-inline">
          <Input type="select" label="Ikäkausi" value={ selectedAgeGroup } onChange={ getChangeHandler('ageGroup') }>
            { ageGroupSelectionKeys.map(ageGroup => <option value={ ageGroup } key={ ageGroup }>{ ageGroup }</option>) }
          </Input>
          <Input type="select" label="Alaleiri" value={ selectedSubCamp } onChange={ getChangeHandler('subCamp') }>
            { subCampSelectionKeys.map(subCamp => <option value={ subCamp } key={ subCamp }>{ subCamp }</option>) }
          </Input>
        </form>
      </div>
    );
  }

  QuickFilterContainer.propTypes = {
    filter: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  QuickFilterContainer.contextTypes = {
    router: React.PropTypes.object,
  };

  return QuickFilterContainer;
}
