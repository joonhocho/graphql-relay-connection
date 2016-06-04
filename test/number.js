import type {
  ConnectionCursor,
} from '../src/connectionTypes';
import defineConnection from '../lib/defineConnection';
import {
  base64,
  unbase64,
  startsWith,
} from '../lib/util';
import {describe, it} from 'mocha';
import {expect} from 'chai';


const PREFIX = 'number:';

function numberToCursor(num: number): ConnectionCursor {
  return base64(PREFIX + num);
}


function cursorToNumber(cursor: ConnectionCursor): ?number {
  const unbased = unbase64(cursor);
  if (startsWith(unbased, PREFIX)) {
    const num = unbased.substring(PREFIX.length);
    if (num) return parseInt(num, 10);
  }
  return null;
}


function compareNumbers(num1: number, num2: number): number {
  return num1 - num2;
}

const {
  connectionFromArray,
} = defineConnection({
  comparableToCursor: numberToCursor,
  cursorToComparable: cursorToNumber,
  comparator: compareNumbers,
});


const lastItem = (arr) => arr[arr.length - 1];

const nodes = [1, 2, 3, 4, 5];
const cursors = nodes.map(numberToCursor);
const edges = nodes.map((node, i) => ({
  node,
  cursor: cursors[i],
}));


describe('connectionFromArray()', () => {
  describe('basic slicing', () => {
    it('returns all elements without filters', () => {
      const c = connectionFromArray(nodes, {});
      return expect(c).to.deep.equal({
        edges,
        pageInfo: {
          startCursor: cursors[0],
          endCursor: lastItem(cursors),
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects a smaller first', () => {
      const c = connectionFromArray(nodes, {first: 2});
      return expect(c).to.deep.equal({
        edges: edges.slice(0, 2),
        pageInfo: {
          startCursor: cursors[0],
          endCursor: cursors[1],
          hasPreviousPage: false,
          hasNextPage: true,
        },
      });
    });
  });
});
