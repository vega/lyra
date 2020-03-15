import * as React from 'react';
import * as ReactModal from 'react-modal';
import { connect } from 'react-redux';
import {Datum, extend} from 'vega';
import {addPipeline} from '../../actions/pipelineActions';
import {Dataset, DatasetRecord} from '../../store/factory/Dataset';
import {Pipeline, PipelineRecord} from '../../store/factory/Pipeline';
import * as dsUtils from '../../util/dataset-utils';
import {get, read} from '../../util/io';
import DataTable from './DataTable';
import DataURL from './DataURL';

const exampleDatasets = require('../../constants/exampleDatasets');
const NAME_REGEX = /([\w\d_-]*)\.?[^\\\/]*$/i;

interface OwnProps {
  closeModal: () => void;
  modalIsOpen: boolean;
}

interface DispatchProps {
  addPipeline: (pipeline: PipelineRecord, dataset: DatasetRecord, values: Datum[]) => void;
}

export interface PipelineModalState {
    error: string;
    success: any;
    showPreview: boolean;
    selectedExample: string;

    name: string;
    pipeline: PipelineRecord;
    dataset: DatasetRecord;
    values: Datum[];
}

const mapDispatch: DispatchProps = {
  addPipeline
};

export class PipelineModal extends React.Component<OwnProps & DispatchProps, PipelineModalState> {

  private initialState: PipelineModalState = {
    error: null,
    success: null,
    showPreview: false,
    selectedExample: null,

    name: null,
    pipeline: null,
    dataset: null,
    values: null,
  };

  constructor(props) {
    super(props);
    this.state = this.initialState;
    this.loadURL = this.loadURL.bind(this);
    this.fopen = this.fopen.bind(this);
  }

  public createPipeline(id: string) {
    const name = id.match(NAME_REGEX)[1];
    this.setState({name, pipeline: Pipeline({name})});
  }

  public createDataset(data: string) {
    const parsed = dsUtils.parseRaw(data);
    const values = parsed.values;
    this.setState({
      values,
      dataset: Dataset({
        name: this.state.name,
        format: parsed.format,
        _schema: dsUtils.schema(values)
      })
    });
  }

  public success(msg: string | boolean, selectedExample?: string) {
    this.setState({
      error: null,
      success: msg || null,
      showPreview: true,
      selectedExample
    });
  }

  public error(err) {
    this.setState({
      error: err.statusText || err.message || 'An error occurred!',
      success: null,
      selectedExample: null
    });
  }

  public done(save) {
    const state = this.state;
    if (save && state.error === null) {
      this.props.addPipeline(state.pipeline, state.dataset, state.values);
    }

    this.setState(this.initialState);
    this.props.closeModal();
  }

  public loadURL(url: string, example?: boolean) {
    this.createPipeline(url);
    get(url, (data, err) => {
      if (err) {
        this.error(err);
      } else {
        this.createDataset(data);
        this.success(example ? null : `Successfully imported ${url}`);
        this.setState({selectedExample: url});
      }
    });
  }

  public fopen(evt) {
    read(evt.target.files, (data, file) => {
      this.createPipeline(file.name);
      this.createDataset(data);
      this.success(`Successfully imported ${file.name}`);
    });
  }

  public render() {
    const props = this.props;
    const state = this.state;
    const error = state.error;
    const success = state.success;
    const preview = state.showPreview;
    const close = this.done.bind(this, false);

    const style = {
      overlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      content: {
        // position: null,
        overflow: 'hidden',
        top: null, bottom: null, left: null, right: null,
        width: '550px',
        height: (success || error || preview) ? 'auto' : '300px',
        padding: null
      }
    };

    return (
      <ReactModal isOpen={props.modalIsOpen} onRequestClose={close} contentLabel='Pipeline Modal'
        style={style}>
        <div className='pipelineModal'>
          <span className='closeModal' onClick={close}>close</span>

          <div className='examples'>
            <h2>Example Datasets</h2>

            <ul>
              {exampleDatasets.map(function(example) {
                const name = example.name;
                const description = example.description;
                const url = example.url;
                const className = state.selectedExample === url ? 'selected' : null;

                return (
                  <li key={name} onClick={this.loadURL.bind(this, url, true)}
                    className={className}>
                    <p className='example-name'>{name}</p>
                    <p>{description}</p>
                  </li>
                );
              }, this)}
            </ul>
          </div>

          <div className='load'>
            <h2>Import a Dataset</h2>

            <p>
              Data must be in a tabular form. Supported import
              formats include <abbr title='JavaScript Object Notation'>json</abbr>, <abbr title='Comma-Separated Values'>csv</abbr> and <abbr title='Tab-Separated Values'>tsv</abbr>
            </p>

            <p><input type='file' accept='.json,.tsv,.csv' onChange={this.fopen} /></p>

            <p>or</p>

            <DataURL loadURL={this.loadURL} />
          </div>

          {error ? <div className='error-message'>{error}</div> : null}
          {success ? <div className='success-message'>{success}</div> : null}

          {!preview || error ? null : (
            <div className='preview'>
              <h2>Preview</h2>

              <DataTable className='source'
                values={state.values} schema={state.dataset._schema} limit={20} />

              <button className='button button-success'
                onClick={this.done.bind(this, true)}>
                Import
              </button>
            </div>
          )}
        </div>
      </ReactModal>
    );
  }
}

export default connect(null, mapDispatch)(PipelineModal);
