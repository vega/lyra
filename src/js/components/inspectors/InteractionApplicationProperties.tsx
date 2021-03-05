'use strict';

import * as React from 'react';
import {Map} from 'immutable';
import {connect} from 'react-redux';
import {State} from '../../store';
import {applicationIsEnabled, ApplicationRecord, InteractionRecord, MarkApplicationRecord, ScaleApplicationRecord, ScaleInfo, TransformApplicationRecord} from '../../store/factory/Interaction';
import {setApplication, removeApplication} from '../../actions/interactionActions';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {MarkRecord} from '../../store/factory/Mark';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {InteractionMarkApplicationProperty} from './InteractionMarkApplication';
import {Icon} from '../Icon';

const assets = require('../../util/assets');

interface OwnProps {
  interaction: InteractionRecord;
  applications: ApplicationRecord[];
  groups: Map<number, GroupRecord>;
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
}

interface StateProps {
  scaleInfoOfGroups: Map<number, ScaleInfo>;
  group: GroupRecord;

}

interface DispatchProps {
  setApplication: (record: ApplicationRecord, id: number) => void;
  removeApplication: (record: ApplicationRecord, id: number) => void;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const groupId = ownProps.interaction.get('groupId');
  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groupId)]);

  const scaleInfoOfGroups: Map<number, ScaleInfo> = ownProps.groups.map(group => {
    return getScaleInfoForGroup(state, group._id);
  });

  return {
    scaleInfoOfGroups,
    group
  };
}

const actionCreators: DispatchProps = {setApplication, removeApplication};

class BaseInteractionApplicationProperties extends React.Component<OwnProps & StateProps & DispatchProps> {

  private canTargetMultiple(preview: ApplicationRecord) {
    if (preview.type === 'scale') return false;

    // targetMark
    const targetGroupName = preview.targetGroupName;
    const group = this.props.groups.find(group => exportName(group.name) === targetGroupName);
    const marksOfGroup = this.props.marksOfGroups.get(group._id);

    // targetGroup
    const groups = this.props.groups.valueSeq().toArray().filter(group => {
      if (preview.id.startsWith('filter') && group._id === this.props.group._id) {
        return false;
      }
      return true;
    });

    if (marksOfGroup.length === 1 && groups.length === 1) return false;
    return true;
  }

  private getTargetMarkOptions(preview: MarkApplicationRecord | TransformApplicationRecord) {
    if (preview.type === 'scale') {
      return null;
    }
    const targetGroupName = preview.targetGroupName;
    const group = this.props.groups.find(group => exportName(group.name) === targetGroupName);
    const marksOfGroup = this.props.marksOfGroups.get(group._id);

    let options;

    if (marksOfGroup.length === 1) {
      options = <div>{marksOfGroup[0].name}</div>
    }
    else {
      options = (
        <select name='target_mark' value={preview.targetMarkName} onChange={e => this.onSelectTargetMarkName(preview, e.target.value)}>
          {
            marksOfGroup.map(mark => {
              if (preview.id.startsWith('size')) {
                if (mark.type !== 'symbol') {
                  return null;
                }
              }
              const markName = exportName(mark.name);
              return <option key={markName} value={markName}>{mark.name}</option>
            })
          }
        </select>
      )
    }

    return (
      <div className="property">
        <label htmlFor='target_mark'>Mark:</label>
        <div className='control'>
          {options}
        </div>
      </div>
    );
  }



  private onSelectTargetMarkName(preview: MarkApplicationRecord | TransformApplicationRecord, targetMarkName: string) {
    let newPreview = (preview as any).set('targetMarkName', targetMarkName);
    if (preview.id.startsWith('color')) {
      const marksOfGroup = this.props.marksOfGroups.get(this.props.group._id);
      const targetMark = marksOfGroup.find(mark => exportName(mark.name) === targetMarkName);
      newPreview = newPreview.set('propertyName', targetMark.type === 'line' ? "stroke" : "fill");
    }
    this.props.setApplication(newPreview, this.props.interaction.id);
  }

  private getTargetGroupOptions(preview: ApplicationRecord) {
    if (preview.type === 'scale') {
      return null; // TODO eventually support scale application target group, maybe
    }
    const groups = this.props.groups.valueSeq().toArray().filter(group => {
      if (preview.id.startsWith('filter') && group._id === this.props.group._id) {
        return false;
      }
      return true;
    });

    let options;

    if (groups.length === 1) {
      options = <div>{groups[0].name}</div>;
    }
    else {
      options = (
        <select name='target_group' value={preview.targetGroupName} onChange={e => this.onSelectTargetGroup(preview, e.target.value)}>
          {
            groups.map(group => {
              const groupName = exportName(group.name);
              return <option key={groupName} value={groupName}>{group.name}</option>
            })
          }
        </select>
      );
    }

    return (
      <div className="property">
        <label htmlFor='target_group'>Group:</label>
        <div className='control'>
          {options}
        </div>
      </div>
    );
  }

  private onSelectTargetGroup(preview: ApplicationRecord, targetGroup: string) {
    let newPreview = (preview as any).set('targetGroupName', targetGroup);
    const group = this.props.groups.find(group => exportName(group.name) == targetGroup);
    const marksOfGroup = this.props.marksOfGroups.get(group._id);
    if (marksOfGroup.length) {
      newPreview = newPreview.set('targetMarkName', exportName(this.props.marksOfGroups.get(group._id)[0].name));
    }
    if ((preview as ScaleApplicationRecord).scaleInfo) {
      newPreview = newPreview.set('scaleInfo', this.props.scaleInfoOfGroups.get(group._id));
    }

    this.props.setApplication(newPreview, this.props.interaction.id);
  }

  private counter = 0;

  private addApplication(preview: ApplicationRecord, interactionId: number) {
    const baseId = preview.id;
    let id = baseId;
    while (this.props.interaction.applications.some(application => application.id == id)) {
      id = baseId + (this.counter++);
    }
    const newPreview = (preview as any).set('id', id);
    this.props.setApplication(newPreview, interactionId);
  }

  public render() {
    const interaction = this.props.interaction;
    const applications = this.props.applications
      .filter(application => applicationIsEnabled(application, interaction))
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.id.localeCompare(b.id);
        }
        else {
          if (a.type === 'mark') {
            return -1;
          }
          if (b.type === 'mark') {
            return 1;
          }
          if (a.type === 'scale') {
            return -1;
          }
          if (b.type === 'scale') {
            return 1;
          }
        }
      });
    const types = applications.map(application => application.label).filter((v, i, a) => i === a.indexOf(v));

    return (
      <div className='application-options-wrap'>
        {
          types.map(type => {
            const applicationsOfType = applications.filter(a => a.label === type);
            const firstApplication = applicationsOfType[0];
            const canTargetMultiple = this.canTargetMultiple(firstApplication);
            return (
              <div key={type}>
                <h5 className={'application-options-label'}>{applicationsOfType[0].label}
                  {
                    canTargetMultiple ?
                      <span className='new'
                        onClick={() => this.addApplication(applicationsOfType[0], interaction.id)}>
                        <Icon glyph={assets.plus} />
                      </span> : null
                  }
                </h5>
                <div className="application-options-property-group">
                  {
                    applicationsOfType.map((application, idx) => {
                      const targetGroupOptions = this.getTargetGroupOptions(application);
                      const targetMarkOptions = this.getTargetMarkOptions(application as any);
                      const properties = application.type === 'mark' ? (
                        <div>
                          <InteractionMarkApplicationProperty interactionId={interaction.id} markApplication={application as MarkApplicationRecord}></InteractionMarkApplicationProperty>
                        </div>
                      ) : null;

                      return (
                        <div key={idx} className='application-options'>
                            {
                              canTargetMultiple && applicationsOfType.length > 1 ?
                                <Icon glyph={assets.trash} className='delete'
                                  onClick={() => {this.props.removeApplication(application, interaction.id)}} data-html={true} data-place='right'/> : null
                            }
                          {targetGroupOptions}
                          {targetMarkOptions}
                          {properties}
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            );

          })
        }
      </div>
    );
  }
};

export const InteractionApplicationProperties = connect(mapStateToProps, actionCreators)(BaseInteractionApplicationProperties);
