import { connect } from 'react-redux';
import { ListOffsetSelector } from '../../../components';
import { changeQueryParameter } from '../../../utils';

export function getListOffsetSelectorContainer() {
  const mapStateToProps = (state, ownProps) => ({
    count: state.participants.participantCount || 0,
    onOffsetChanged: newOffset => ownProps.router.push(changeQueryParameter(ownProps.location, 'offset', newOffset)),
    chunkSize: ownProps.limit,
    offset: ownProps.limit,
  });

  return connect(mapStateToProps)(ListOffsetSelector);
}
