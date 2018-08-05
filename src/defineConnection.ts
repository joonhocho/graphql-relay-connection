import {
  Comparator,
  Connection,
  ConnectionArguments,
  ConnectionDefinitionArguments,
  ConnectionOptions,
  Edge,
} from './connectionTypes';

const edgesToConnection = <T>(
  edges: Array<Edge<T>>,
  {
    hasPreviousPage,
    hasNextPage,
  }: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }
): Connection<T> => {
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

const isNotFunction = (x: any): boolean => typeof x !== 'function';

// tslint:disable-next-line typedef
export const defineConnection = <Comparable, Node extends Comparable>({
  comparableToCursor,
  cursorToComparable,
  comparator,
}: ConnectionDefinitionArguments<Comparable>) => {
  if (isNotFunction(comparableToCursor)) {
    throw new Error('Must provide \'comparableToCursor\'');
  }

  if (isNotFunction(cursorToComparable)) {
    throw new Error('Must provide \'cursorToComparable\'');
  }

  if (isNotFunction(comparator)) {
    throw new Error('Must provide \'comparator\'');
  }

  const comparatorDesc: Comparator<Comparable> = (a, b): number =>
    -comparator(a, b);

  const nodeToEdge = (node: Node): Edge<Node> => ({
    cursor: comparableToCursor(node),
    node,
  });

  const findStartIndex = (
    nodes: Node[],
    afterNode: Comparable | null,
    curComparator: Comparator<Comparable>
  ): number => {
    if (afterNode == null) {
      return 0;
    }
    const len = nodes.length;
    // nodes are sorted
    for (let i = 0; i < len; i += 1) {
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

  const findEndIndex = (
    nodes: Node[],
    beforeNode: Comparable | null,
    curComparator: Comparator<Comparable>
  ): number => {
    if (beforeNode == null) {
      return nodes.length - 1;
    }
    // nodes are sorted
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
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

  function connectionFromArray(
    data: Node[],
    args: ConnectionArguments,
    options: ConnectionOptions
  ): Connection<Node> {
    const { after, before, first, last } = args;
    if (first != null && last != null) {
      throw new Error('Must not provide both \'first\' and \'last\'');
    }

    if ((first != null && first <= 0) || (last != null && last <= 0)) {
      throw new Error('\'first\' and \'last\' must be 1 or greater');
    }

    const { hasPreviousPage, hasNextPage } = options;
    const { sorted, desc } = options;

    if (!data.length) {
      return edgesToConnection([], {
        hasPreviousPage:
          hasPreviousPage === undefined ? false : hasPreviousPage,
        hasNextPage: hasNextPage === undefined ? false : hasNextPage,
      });
    }

    const curComparator = desc ? comparatorDesc : comparator;

    const afterNode = (after && cursorToComparable(after)) || null;
    const beforeNode = (before && cursorToComparable(before)) || null;
    if (
      afterNode != null &&
      beforeNode != null &&
      curComparator(afterNode, beforeNode) > 0
    ) {
      throw new Error('\'before\' must be after \'after\'');
    }

    let nodes = data.slice();
    if (!sorted) {
      nodes = nodes.sort(curComparator);
    }

    let startIndex = findStartIndex(nodes, afterNode, curComparator);
    if (startIndex < 0) {
      // no nodes after afterNode
      return edgesToConnection([], {
        hasPreviousPage:
          hasPreviousPage === undefined ? nodes.length > 0 : hasPreviousPage,
        hasNextPage: hasNextPage === undefined ? false : hasNextPage,
      });
    }

    let endIndex = findEndIndex(nodes, beforeNode, curComparator);
    if (endIndex < 0) {
      // no nodes before beforeNode
      return edgesToConnection([], {
        hasPreviousPage:
          hasPreviousPage === undefined ? false : hasPreviousPage,
        hasNextPage: hasNextPage === undefined ? nodes.length > 0 : hasNextPage,
      });
    }

    if (startIndex > endIndex) {
      throw new Error('\'before\' must be after \'after\'');
    }

    let edges = nodes.slice(startIndex, endIndex + 1).map(nodeToEdge);

    if (first != null && first < edges.length) {
      endIndex = first - 1;
      edges = edges.slice(0, first);
    } else if (last != null && last < edges.length) {
      startIndex = edges.length - last;
      edges = edges.slice(-last);
    }

    return edgesToConnection(edges, {
      hasPreviousPage:
        hasPreviousPage === undefined ? startIndex > 0 : hasPreviousPage,
      hasNextPage:
        hasNextPage === undefined ? endIndex < nodes.length - 1 : hasNextPage,
    });
  }

  function connectionFromPromisedArray(
    dataPromise: Promise<Node[]>,
    args: ConnectionArguments,
    options: ConnectionOptions
  ): Promise<Connection<Node>> {
    return dataPromise.then((data) => connectionFromArray(data, args, options));
  }

  return {
    connectionFromArray,
    connectionFromPromisedArray,
  };
};
