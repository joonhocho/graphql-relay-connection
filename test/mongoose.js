/* @flow */
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {mongooseConnection} from '../lib';


const {
  documentToCursor,
  connectionFromArray,
  connectionFromPromisedArray,
} = mongooseConnection;


const lastItem = (arr) => arr[arr.length - 1];
const letters = ['A', 'B', 'C', 'D', 'E'];
const nodes = letters.map((id) => ({id}));
const nodesDesc = nodes.slice().reverse();
const nodesPromise = Promise.resolve(nodes);
const cursors = nodes.map(documentToCursor);
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

    it('respects an overly large first', () => {
      const c = connectionFromArray(nodes, {first: 10});
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

    it('respects a smaller last', () => {
      const c = connectionFromArray(nodes, {last: 2});
      return expect(c).to.deep.equal({
        edges: edges.slice(-2),
        pageInfo: {
          startCursor: cursors[3],
          endCursor: cursors[4],
          hasPreviousPage: true,
          hasNextPage: false,
        },
      });
    });

    it('respects an overly large last', () => {
      const c = connectionFromArray(nodes, {last: 10});
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
  });

  describe('pagination', () => {
    it('respects first and after', () => {
      const c = connectionFromArray(
        nodes,
        {first: 2, after: cursors[1]}
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(2, 4),
        pageInfo: {
          startCursor: cursors[2],
          endCursor: cursors[3],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('respects first and after with long first', () => {
      const c = connectionFromArray(
        nodes,
        {first: 10, after: cursors[1]}
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(2),
        pageInfo: {
          startCursor: cursors[2],
          endCursor: cursors[4],
          hasPreviousPage: true,
          hasNextPage: false,
        },
      });
    });

    it('respects last and before', () => {
      const c = connectionFromArray(
        nodes,
        {last: 2, before: cursors[3]}
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(1, 3),
        pageInfo: {
          startCursor: cursors[1],
          endCursor: cursors[2],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('respects last and before with long last', () => {
      const c = connectionFromArray(
        nodes,
        {last: 10, before: cursors[3]}
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(0, 3),
        pageInfo: {
          startCursor: cursors[0],
          endCursor: cursors[2],
          hasPreviousPage: false,
          hasNextPage: true,
        },
      });
    });

    it('respects first and after and before, too few', () => {
      const c = connectionFromArray(
        nodes,
        {
          first: 2,
          after: cursors[0],
          before: cursors[4],
        }
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(1, 3),
        pageInfo: {
          startCursor: cursors[1],
          endCursor: cursors[2],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('respects first and after and before, too many', () => {
      const c = connectionFromArray(
        nodes,
        {
          first: 4,
          after: cursors[0],
          before: cursors[4],
        }
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(1, 4),
        pageInfo: {
          startCursor: cursors[1],
          endCursor: cursors[3],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('respects first and after and before, exactly right', () => {
      const c = connectionFromArray(
        nodes,
        {
          first: 3,
          after: cursors[0],
          before: cursors[4],
        }
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(1, 4),
        pageInfo: {
          startCursor: cursors[1],
          endCursor: cursors[3],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('respects last and after and before, too few', () => {
      const c = connectionFromArray(
        nodes,
        {
          last: 2,
          after: cursors[0],
          before: cursors[4],
        }
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(2, 4),
        pageInfo: {
          startCursor: cursors[2],
          endCursor: cursors[3],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('respects last and after and before, too many', () => {
      const c = connectionFromArray(
        nodes,
        {
          last: 4,
          after: cursors[0],
          before: cursors[4],
        }
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(1, 4),
        pageInfo: {
          startCursor: cursors[1],
          endCursor: cursors[3],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('respects last and after and before, exactly right', () => {
      const c = connectionFromArray(
        nodes,
        {
          last: 3,
          after: cursors[0],
          before: cursors[4],
        }
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(1, 4),
        pageInfo: {
          startCursor: cursors[1],
          endCursor: cursors[3],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });
  });

  describe('cursor edge cases', () => {
    it('throws if first is 0', () => {
      expect(() => connectionFromArray(
        nodes,
        {first: 0}
      )).to.throw();
    });

    it('throws if last is 0', () => {
      expect(() => connectionFromArray(
        nodes,
        {last: 0}
      )).to.throw();
    });

    it('throws if both first and last are set', () => {
      expect(() => connectionFromArray(
        nodes,
        {first: 1, last: 1}
      )).to.throw();
    });

    it('returns all elements if cursors are invalid', () => {
      const c = connectionFromArray(
        nodes,
        {before: 'invalid', after: 'invalid'}
      );
      return expect(c).to.deep.equal({
        edges,
        pageInfo: {
          startCursor: cursors[0],
          endCursor: cursors[4],
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('returns all elements if cursors are on the outside', () => {
      const c = connectionFromArray(
        nodes,
        {
          before: documentToCursor({id: 'F'}),
          after: documentToCursor({id: '0'}),
        }
      );
      return expect(c).to.deep.equal({
        edges,
        pageInfo: {
          startCursor: cursors[0],
          endCursor: cursors[4],
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('throws if cursors cross', () => {
      expect(() => connectionFromArray(
        nodes,
        {before: cursors[2], after: cursors[4]}
      )).to.throw();
    });
  });

  describe('pageInfo', () => {
    it('overrides hasPreviousPage', () => {
      const c = connectionFromArray(nodes, {}, {hasPreviousPage: true});
      return expect(c).to.deep.equal({
        edges,
        pageInfo: {
          startCursor: cursors[0],
          endCursor: lastItem(cursors),
          hasPreviousPage: true,
          hasNextPage: false,
        },
      });
    });

    it('overrides hasNextPage', () => {
      const c = connectionFromArray(nodes, {}, {hasNextPage: true});
      return expect(c).to.deep.equal({
        edges,
        pageInfo: {
          startCursor: cursors[0],
          endCursor: lastItem(cursors),
          hasPreviousPage: false,
          hasNextPage: true,
        },
      });
    });
  });

  describe('options', () => {
    it('sort', () => {
      const unsortedNodes = [2, 0, 3, 4, 1].map((i) => nodes[i]);
      const c = connectionFromArray(
        unsortedNodes,
        {first: 2, after: cursors[1]},
        {sort: true}
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(2, 4),
        pageInfo: {
          startCursor: cursors[2],
          endCursor: cursors[3],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });

    it('desc', () => {
      const c = connectionFromArray(
        nodesDesc,
        {first: 2, after: cursors[3]},
        {desc: true}
      );
      return expect(c).to.deep.equal({
        edges: edges.slice(1, 3).reverse(),
        pageInfo: {
          startCursor: cursors[2],
          endCursor: cursors[1],
          hasPreviousPage: true,
          hasNextPage: true,
        },
      });
    });
  });
});

describe('connectionFromPromisedArray()', () => {
  it('returns all elements without filters', async () => {
    const c = await connectionFromPromisedArray(nodesPromise, {});
    return expect(c).to.deep.equal({
      edges,
      pageInfo: {
        startCursor: cursors[0],
        endCursor: cursors[4],
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });

  it('respects a smaller first', async () => {
    const c = await connectionFromPromisedArray(nodesPromise, {first: 2});
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
