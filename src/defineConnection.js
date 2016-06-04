/* @flow */
import type {
  Connection,
  ConnectionArguments,
  ConnectionCursor,
  ConnectionDefinitionArguments,
  Options,
  PageInfo,
} from './connectionTypes';


type HasPages = {
  hasPreviousPage: boolean,
  hasNextPage: boolean,
};


const edgesToConnection = (edges, {
  hasPreviousPage,
  hasNextPage,
}: HasPages) => {
  const startEdge = edges[0];
  const lastEdge = edges[edges.length - 1];

  const startCursor = startEdge == null ? null : startEdge.cursor;
  const endCursor = lastEdge == null ? null : lastEdge.cursor;

  return {
    edges,
    pageInfo: {
      startCursor,
      endCursor,
      hasPreviousPage,
      hasNextPage,
    },
  };
};


const isNotBoolean = (x) => typeof x !== 'boolean';
const isNotFunction = (x) => typeof x !== 'function';


export default ({
  comparableToCursor,
  cursorToComparable,
  comparator,
}: ConnectionDefinitionArguments) => {

  if (isNotFunction(comparableToCursor)) {
    throw new Error("Must provide 'comparableToCursor'");
  }

  if (isNotFunction(cursorToComparable)) {
    throw new Error("Must provide 'cursorToComparable'");
  }

  if (isNotFunction(comparator)) {
    throw new Error("Must provide 'comparator'");
  }


  const comparatorDesc = (a, b) => -comparator(a, b);


  const nodeToEdge = (node) => ({
    cursor: comparableToCursor(node),
    node,
  });


  const findStartIndex = (nodes, afterNode, curComparator) => {
    if (afterNode == null) {
      return 0;
    }
    for (let i = 0; i < nodes.length; i++) {
      const diff = curComparator(afterNode, nodes[i]);
      if (diff === 0) {
        return i + 1;
      }
      if (diff < 0) {
        return i;
      }
    }
    return -1;
  };


  const findEndIndex = (nodes, beforeNode, curComparator) => {
    if (beforeNode == null) {
      return nodes.length - 1;
    }
    for (let i = nodes.length - 1; i >= 0; i--) {
      const diff = curComparator(beforeNode, nodes[i]);
      if (diff === 0) {
        return i - 1;
      }
      if (diff > 0) {
        return i;
      }
    }
    return -1;
  };


  function connectionFromArray<T>(
    data: Array<T>,
    args: ConnectionArguments,
    pageInfo: ?PageInfo,
    opts: ?Options,
  ): Connection<T> {
    const {after, before, first, last} = args;
    if (first != null && last != null) {
      throw new Error("Must not provide both 'first' and 'last'");
    }
    if (first != null && first <= 0 ||
        last != null && last <= 0) {
      throw new Error("'first' and 'last' must be 1 or greater");
    }

    let {
      hasPreviousPage,
      hasNextPage,
      sort,
      desc,
    } = pageInfo || {};

    if (!data.length) {
      if (isNotBoolean(hasPreviousPage)) hasPreviousPage = false;
      if (isNotBoolean(hasNextPage)) hasNextPage = false;
      return edgesToConnection([], {
        hasPreviousPage,
        hasNextPage,
      });
    }


    const curComparator = desc ? comparatorDesc : comparator;

    const afterNode = after && cursorToComparable(after) || null;
    const beforeNode = before && cursorToComparable(before) || null;
    if (afterNode != null && beforeNode != null && curComparator(afterNode, beforeNode) > 0) {
      throw new Error("'before' must be after 'after'");
    }

    let nodes = data.slice();
    if (sort) nodes = nodes.sort(curComparator);

    let startIndex = findStartIndex(nodes, afterNode, curComparator);
    if (startIndex < 0) {
      // no nodes after afterNode
      if (isNotBoolean(hasPreviousPage)) hasPreviousPage = nodes.length > 0;
      if (isNotBoolean(hasNextPage)) hasNextPage = false;
      return edgesToConnection([], {
        hasPreviousPage,
        hasNextPage,
      });
    }

    let endIndex = findEndIndex(nodes, beforeNode, curComparator);
    if (endIndex < 0) {
      // no nodes before beforeNode
      if (isNotBoolean(hasPreviousPage)) hasPreviousPage = false;
      if (isNotBoolean(hasNextPage)) hasNextPage = nodes.length > 0;
      return edgesToConnection([], {
        hasPreviousPage,
        hasNextPage,
      });
    }

    if (startIndex > endIndex) {
      throw new Error("'before' must be after 'after'");
    }

    let edges = nodes.slice(startIndex, endIndex + 1).map(nodeToEdge);

    if (first != null && first < edges.length) {
      endIndex = first - 1;
      edges = edges.slice(0, first);
    } else if (last != null && last < edges.length) {
      startIndex = edges.length - last;
      edges = edges.slice(-last);
    }

    if (isNotBoolean(hasPreviousPage)) hasPreviousPage = startIndex > 0;
    if (isNotBoolean(hasNextPage)) hasNextPage = endIndex < nodes.length - 1;

    return edgesToConnection(edges, {
      hasPreviousPage,
      hasNextPage,
    });
  }


  function connectionFromPromisedArray<T>(
    dataPromise: Promise<Array<T>>,
    args: ConnectionArguments,
    pageInfo: ?PageInfo,
    opts: ?Options,
  ): Promise<Connection<T>> {
    return dataPromise.then((data) => connectionFromArray(data, args, pageInfo, opts));
  }


  return {
    connectionFromArray,
    connectionFromPromisedArray,
  };
};
