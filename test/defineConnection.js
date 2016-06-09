/* @flow */
import {describe, it} from 'mocha';
import {expect} from 'chai';
import defineConnection from '../lib';

describe('defineConnection()', () => {
  it('requires comparableToCursor', () => {
    expect(() =>
      defineConnection({
        comparableToCursor: null,
        cursorToComparable: () => {},
        comparator: () => {},
      })
    ).to.throw(/comparableToCursor/);
  });


  it('requires cursorToComparable', () => {
    expect(() =>
      defineConnection({
        comparableToCursor: () => {},
        cursorToComparable: null,
        comparator: () => {},
      })
    ).to.throw(/cursorToComparable/);
  });


  it('requires comparator', () => {
    expect(() =>
      defineConnection({
        comparableToCursor: () => {},
        cursorToComparable: () => {},
        comparator: null,
      })
    ).to.throw(/comparator/);
  });
});
