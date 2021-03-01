import * as React from 'react';
import * as ReactModal from 'react-modal';
import { connect } from 'react-redux';
import {Datum} from 'vega';
import {addPipeline, derivePipeline} from '../../actions/pipelineActions';
import {Dataset, DatasetRecord, ValuesDatasetRecord} from '../../store/factory/Dataset';
import {Pipeline, PipelineRecord} from '../../store/factory/Pipeline';
import * as dsUtils from '../../util/dataset-utils';
import {get, read} from '../../util/io';
import DataTable from './DataTable';
import DataURL from './DataURL';
import {State} from '../../store';

const exampleDatasets = require('../../constants/exampleDatasets');
const NAME_REGEX = /([\w\d_-]*)\.?[^\\\/]*$/i;

const vegaDatasets = require('vega-datasets');
const vegaDatasetFilenames = Object.keys(vegaDatasets).filter(n => n.endsWith('.csv') || n.endsWith('.tsv') || n.endsWith('.json'))
  .filter(n => {
    return ![
      // remove the ones that are already in exampleDatasets
      'cars.json',
      'jobs.json',
      'gapminder.json',
      'climate.json',
      // remove because format doesn't work with createDataset
      'annual-precip.json',
      'miserables.json',
      'londonBoroughs.json',
      'us-10m.json',
      'volcano.json',
      'weather.json',
      'world-110m.json',
      // remove because it looks weird
      'movies.json',
      'budget.json',
      // remove because too large for lyra
      'earthquakes.json',
    ].includes(n);
  }).sort();
const vegaDatasetUrls = vegaDatasetFilenames.map(n => vegaDatasets[n].url);

interface OwnProps {
  closeModal: () => void;
  modalIsOpen: boolean;
}

interface StateProps {
  datasets: Map<string, DatasetRecord>;
  pipelines: PipelineRecord[];
  canDerive: boolean;
}

interface DispatchProps {
  addPipeline: (pipeline: PipelineRecord, dataset: DatasetRecord, values: Datum[]) => void;
  derivePipeline: (pipelineId: number) => void;
}

function mapStateToProps(state: State): StateProps {
  const pipelines = state.getIn(['vis', 'present', 'pipelines']).valueSeq().toArray();
  const datasets = state.getIn(['vis', 'present', 'datasets']);
  return {
    pipelines,
    datasets,
    canDerive: pipelines.length
  }
}

const mapDispatch: DispatchProps = {
  addPipeline,
  derivePipeline
};

export interface OwnState {
  error: string;
  success: any;
  loading: boolean;
  showPreview: boolean;
  selectedExample: string;
  selectedVegaDataset: string;

  name: string;
  pipeline: PipelineRecord;
  dataset: DatasetRecord;
  values: Datum[];
  isDerived: boolean; // for deriving pipelines
}


export class PipelineModal extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  private initialState: OwnState = {
    error: null,
    success: null,
    showPreview: false,
    selectedExample: null,
    selectedVegaDataset: vegaDatasetUrls.length ? vegaDatasetUrls[0] : '',

    name: null,
    pipeline: null,
    dataset: null,
    values: null,

    isDerived: false
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
      selectedExample,
      isDerived: false
    });
  }

  public error(err) {
    this.setState({
      error: err.statusText || err.message || 'An error occurred!',
      success: null,
      selectedExample: null,
      isDerived: false
    });
  }

  public done(save) {
    const state = this.state;
    if (save && state.error === null) {
      if (this.state.isDerived) {
        this.props.derivePipeline(state.pipeline._id);
      }
      else {
        this.props.addPipeline(state.pipeline, state.dataset, state.values);
      }
    }

    this.setState(this.initialState);
    this.props.closeModal();
  }

  public loadURL(url: string, example?: boolean) {
    this.createPipeline(url);
    this.setState({loading: true});
    get(url, (data, err) => {
      this.setState({loading: false});
      if (err) {
        this.error(err);
      } else {
        this.createDataset(data);
        this.success(example ? null : `Successfully imported ${url}`);
        this.setState({selectedExample: url});
      }
    });
  }

  public selectPipelineToDerive(pipeline: PipelineRecord) {
    const dataset = this.props.datasets.get(String(pipeline._source));
    this.setState({
      name: pipeline.name,
      pipeline,
      dataset,
      values: dsUtils.output(dataset._id),
      isDerived: true,
      showPreview: true,
      selectedExample: String(pipeline._id)
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
    const loading = state.loading;
    const error = state.error;
    const success = state.success;
    const preview = state.showPreview;
    const close = this.done.bind(this, false);
    const canDerive = props.canDerive;

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
        height: 'auto',
        padding: null
      }
    };

    return (
      <ReactModal isOpen={props.modalIsOpen} onRequestClose={close} contentLabel='Pipeline Modal'
        style={style}>
        <div className='pipelineModal'>
          <span className='closeModal' onClick={close}>close</span>

          <div className='row'>
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

                <li className={vegaDatasetUrls.includes(state.selectedExample) ? 'selected' : null}
                    onClick={this.loadURL.bind(this, state.selectedVegaDataset, true)}>
                  <p className='example-name'>All Example Datasets</p>
                  <select value={state.selectedVegaDataset} onChange={(e) => {this.setState({selectedVegaDataset: e.target.value})}}>
                    {
                      vegaDatasetFilenames.map(name => {
                        return <option key={name} value={vegaDatasets[name].url}>{name}</option>
                      })
                    }
                  </select>
                </li>
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
          </div>
          {
            this.props.pipelines.length ? (
              <div className='row'>
                <div className='derive'>
                  <h2>Derive from Existing Dataset</h2>

                  <ul>
                    {this.props.pipelines.map(function(pipeline) {
                      const name = pipeline.name;
                      const className = state.selectedExample === String(pipeline._id) ? 'selected' : null;

                      return (
                        <li key={name} onClick={() => this.selectPipelineToDerive(pipeline)}
                          className={className}>
                          <p className='pipeline-name'>{name}</p>
                          {/* <p>{description}</p> */}
                        </li>
                      );
                    }, this)}
                  </ul>
                </div>
              </div>
            ) : null
          }

          {error ? <div className='error-message'>{error}</div> : null}
          {success ? <div className='success-message'>{success}</div> : null}

          {!preview && loading ? <div className='loading-message'>Loading dataset...</div> : null}

          {!preview || error ? null : (
            <div className='row'>
              <div className='preview'>
                <h2>Preview</h2>

                {loading ? <div className='loading-message'>Loading dataset...</div> : null}

                <DataTable className='source'
                  values={state.values} schema={state.dataset._schema} limit={20} />

                <button className='button button-success'
                  onClick={this.done.bind(this, true)}>
                  Import
                </button>
              </div>
            </div>
          )}
        </div>
      </ReactModal>
    );
  }
}

export default connect(mapStateToProps, mapDispatch)(PipelineModal);
