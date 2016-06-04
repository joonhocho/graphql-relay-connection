/* @flow */
import type {
  Connection,
  ConnectionArguments,
  ConnectionCursor,
  ConnectionDefinitionArguments,
  Options,
  PageInfo,
} from './connectiontypes';


export default ({
  comparableToCursor,
  cursorToComparable,
  comparator,
}: ConnectionDefinitionArguments) => {
  if (typeof comparableToCursor !== 'function') {
    throw new Error('comparableToCursor must be provided');
  }
  if (typeof cursorToComparable !== 'function') {
    throw new Error('cursorToComparable must be provided');
  }
  if (typeof comparator !== 'function') {
    throw new Error('comparator must be provided');
  }

  function connectionFromArray<T>(
    data: Array<T>,
    args: ConnectionArguments,
    pageInfo: ?PageInfo,
    opts: ?Options,
  ): Connection<T> {
    const {after, before, first, last} = args;
    if (first != null && last != null) {
      throw new Error("Must not provide both 'first' and 'last'.");
    }
    if (first != null && first <= 0 ||
        last != null && last <= 0) {
      throw new Error("'first' and 'last' must be 1 or greater.");
    }


    let {startCursor, endCursor, hasPreviousPage, hasNextPage} = pageInfo || {};
    const beforeNode = before && cursorToComparable(before) || null;
    const afterNode = after && cursorToComparable(after) || null;

    const startNode = startCursor && cursorToComparable(startCursor) || null;
    const endNode = endCursor && cursorToComparable(endCursor) || null;

    const {unsorted} = opts || {};

    let nodes = data.slice();

    if (unsorted) {
      nodes = nodes.sort(comparator);
    }

    if (hasPreviousPage == null) {
      hasPreviousPage =
    }

    const edges = data.slice(
      Math.max(startOffset - sliceStart, 0),
      data.length - (sliceEnd - endOffset)
    ).map((node) => ({
      cursor: idToCursor(node.id),
      node,
    }));

    const firstEdge = edges[0];
    const lastEdge = edges[edges.length - 1];
    const lowerBound = after ? (afterId + 1) : 0;
    const upperBound = before ? beforeId : arrayLength;
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge ? firstEdge.cursor : null,
        endCursor: lastEdge ? lastEdge.cursor : null,
        hasPreviousPage:
          typeof last === 'number' ? startOffset > lowerBound : false,
        hasNextPage:
          typeof first === 'number' ? endOffset < upperBound : false,
      },
    };
  }


  function connectionFromPromisedArray<T>(
    dataPromise: Promise<Array<T>>,
    args: ConnectionArguments,
    pageInfo: ?PageInfo,
    opts: ?Options,
  ): Promise<Connection<T>> {
    return dataPromise.then(data => connectionFromArray(data, args, pageInfo, opts));
  }


  return {
    connectionFromArray,
    connectionFromPromisedArray,
  };
};
