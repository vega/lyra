import * as React from 'react';

import {Dataset} from '../../store/factory/Dataset';
import {Pipeline} from '../../store/factory/Pipeline';
import * as dsUtils from '../../util/dataset-utils';
import {PipelineModalState} from './PipelineModal';
interface OwnProps {
  success: (state: Partial<PipelineModalState>, msg: string | boolean, preview?: boolean) => void;
  error: (err: any) => void;
  name?: string;
}

interface OwnState {
  dragActive: string;
}

class DraggableTextArea extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      dragActive: 'textarea-dnd'
    };
  }
  public onDragEnter() {
    this.setState({
      dragActive: 'textarea-dnd active'
    });
  }

  public onDragLeave() {
    this.setState({
      dragActive: 'textarea-dnd'
    });
  }

  public onChange(evt) {
    const props = this.props;
    const target = evt.target;
    const type = evt.type;
    let pipeline = Pipeline();
    let dataset  = Dataset();
    let raw  = target.value;
    let file;
    let reader;
    let name;
    let parsed: dsUtils.ParsedValues;
    let values;

    evt.preventDefault();

    try {
      if (type === 'change') {
        parsed = dsUtils.parseRaw(raw);
        props.success({
          pipeline: pipeline,
          dataset: (dataset = dataset.merge({format: parsed.format, _schema: dsUtils.schema(parsed.values)})),
          values: (values = parsed.values)
        }, 'Successfully imported data!');
      } else if (type === 'drop') {
        file = evt.dataTransfer.files[0];
        reader = new FileReader();
        reader.onload = function(loadEvt) {
          name = file.name.match(dsUtils.NAME_REGEX);
          dataset = dataset.merge({name: name[1]});
          pipeline = pipeline.merge({name: dataset.name});
          raw = target.value = loadEvt.target.result;
          try {
            parsed = dsUtils.parseRaw(raw);
            props.success({
              pipeline: pipeline,
              dataset: (dataset = dataset.merge({format: parsed.format, _schema: dsUtils.schema(parsed.values)})),
              values: (values = parsed.values)
            }, 'Successfully imported ' + name[0] + '!');
          } catch (err) {
            props.error(err);
          }
        };
        reader.readAsText(file);
      }
    } catch (err) {
      props.error(err);
    }
  }

  public render() {
    const props = this.props;

    return (
      <div>
        <textarea name={props.name} rows={8} cols={30}
          placeholder='Copy and paste raw values or drag and drop a file.'
          onChange={this.onChange}
          onDrop={this.onChange}
          onDragOver={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          className={this.state.dragActive} />
      </div>
    );
  }
}

export default DraggableTextArea;
