/**
 * Instantiate walkthrough Json files here
 */
import {List} from 'immutable';
import {VisStateTree} from '../store';

export interface WalkthroughJSON {
  title: string;
  image: string;
  alt_text: string;
  steps: List<WalkthroughStepJSON>;

}

export interface WalkthroughStepJSON {
  id: number;
  title: string;
  text: string;
  image: string;
  alt_text: string;
  lyra_state: VisStateTree,
  help: string;
}

export interface WalkthroughData {
  example: WalkthroughJSON;
  barChart: WalkthroughJSON;
}

export const data: WalkthroughData = {
  example: require('./files/example.json'),
  barChart: require('./files/example-different.json')
};
