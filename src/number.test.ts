import {
  base64,
  ConnectionCursor,
  defineConnection,
  startsWith,
  unbase64,
} from './index';

const PREFIX = 'number:';

function numberToCursor(num: number): ConnectionCursor {
  return base64(PREFIX + num);
}

function cursorToNumber(cursor: ConnectionCursor): number | null {
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

const { connectionFromArray } = defineConnection({
  comparableToCursor: numberToCursor,
  cursorToComparable: cursorToNumber,
  comparator: compareNumbers,
});

const lastItem = <T>(arr: T[]): T | undefined => arr[arr.length - 1];

const nodes = [1, 2, 3, 4, 5];
const cursors = nodes.map(numberToCursor);
const edges = nodes.map((node, i) => ({
  node,
  cursor: cursors[i],
}));

const defaultOpts = { sorted: true, desc: false };

describe('connectionFromArray()', () => {
  describe('basic slicing', () => {
    it('returns all elements without filters', () => {
      const c = connectionFromArray(nodes, {}, defaultOpts);
      expect(c).toEqual({
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
      const c = connectionFromArray(nodes, { first: 2 }, defaultOpts);
      expect(c).toEqual({
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

  it('before must be after after', () => {
    expect(() =>
      connectionFromArray(
        nodes,
        {
          first: 2,
          before: numberToCursor(1),
          after: numberToCursor(4),
        },
        defaultOpts
      )
    ).toThrow(/must be after/i);

    expect(() =>
      connectionFromArray(
        nodes,
        {
          first: 2,
          before: numberToCursor(4),
          after: numberToCursor(1),
        },
        defaultOpts
      )
    ).not.toThrow();
  });

  it('after cursor is greater than all', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          first: 2,
          after: numberToCursor(100),
        },
        defaultOpts
      )
    ).toEqual({
      edges: [],
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: true,
        hasNextPage: false,
      },
    });
  });

  it('after cursor is greater than all', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          first: 2,
          after: numberToCursor(100),
        },
        { ...defaultOpts, hasPreviousPage: false, hasNextPage: true }
      )
    ).toEqual({
      edges: [],
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('after cursor is smaller than all w/ first', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          first: 2,
          after: numberToCursor(-100),
        },
        defaultOpts
      )
    ).toEqual({
      edges: edges.slice(0, 2),
      pageInfo: {
        startCursor: cursors[0],
        endCursor: cursors[1],
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('after cursor is smaller than all w/ last', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          last: 2,
          after: numberToCursor(-100),
        },
        defaultOpts
      )
    ).toEqual({
      edges: edges.slice(-2),
      pageInfo: {
        startCursor: cursors[3],
        endCursor: cursors[4],
        hasPreviousPage: true,
        hasNextPage: false,
      },
    });
  });

  it('before cursor is greater than all w/first', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          first: 2,
          before: numberToCursor(100),
        },
        defaultOpts
      )
    ).toEqual({
      edges: edges.slice(0, 2),
      pageInfo: {
        startCursor: cursors[0],
        endCursor: cursors[1],
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('before cursor is greater than all w/ last', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          last: 2,
          before: numberToCursor(100),
        },
        defaultOpts
      )
    ).toEqual({
      edges: edges.slice(-2),
      pageInfo: {
        startCursor: cursors[3],
        endCursor: cursors[4],
        hasPreviousPage: true,
        hasNextPage: false,
      },
    });
  });

  it('before cursor is smaller than all w/ first', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          first: 2,
          before: numberToCursor(-100),
        },
        { ...defaultOpts, hasPreviousPage: true, hasNextPage: false }
      )
    ).toEqual({
      edges: [],
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: true,
        hasNextPage: false,
      },
    });
  });

  it('before cursor is smaller than all w/ last', () => {
    expect(
      connectionFromArray(
        nodes,
        {
          last: 2,
          before: numberToCursor(-100),
        },
        defaultOpts
      )
    ).toEqual({
      edges: [],
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('empty nodes', () => {
    expect(
      connectionFromArray(
        [],
        {
          last: 2,
          before: numberToCursor(3),
        },
        defaultOpts
      )
    ).toEqual({
      edges: [],
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });

  it('empty nodes w/ overrides', () => {
    expect(
      connectionFromArray(
        [],
        {
          last: 2,
          before: numberToCursor(3),
        },
        { ...defaultOpts, hasPreviousPage: true, hasNextPage: true }
      )
    ).toEqual({
      edges: [],
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: true,
        hasNextPage: true,
      },
    });
  });
});
