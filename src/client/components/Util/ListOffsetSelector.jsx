import React from 'react';
import { Pagination } from 'react-bootstrap';

export class ListOffsetSelector extends React.Component {
  constructor(props) {
    super(props);

    this.getPaginationItemCount = () => Math.ceil(this.safeCount()/this.safeChunkSize());
    this.getActivePageNumber = () => Math.floor(this.safeOffset()/this.safeChunkSize()) + 1;
    this.handleSelect = (event, selectedEvent) => this.safeCallOffsetChanged((selectedEvent.eventKey-1)*this.safeChunkSize());
  }

  safeCount() {
    return this.props.count || 0;
  }

  safeOffset() {
    return this.props.offset || 0;
  }

  safeChunkSize() {
    return this.props.chunkSize || 1;
  }

  safeCallOffsetChanged(newOffset) {
    this.props.onOffsetChanged && this.props.onOffsetChanged(newOffset);
  }

  render() {
    return (
      <Pagination
        className="pull-right"
        bsSize="medium"
        items={ this.getPaginationItemCount() }
        activePage={ this.getActivePageNumber() }
        onSelect={ this.handleSelect }
        maxButtons={ 10 }
        next
        prev
        boundaryLinks
      />
    );
  }
}

ListOffsetSelector.propTypes = {
  count: React.PropTypes.number.isRequired,
  offset: React.PropTypes.number.isRequired,
  chunkSize: React.PropTypes.number.isRequired,
  onOffsetChanged: React.PropTypes.func.isRequired,
};
