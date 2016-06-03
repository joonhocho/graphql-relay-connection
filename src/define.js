/* @flow */
import type {
  Connection,
  ConnectionArguments,
  ConnectionCursor,
  ConnectionDefinitionArguments,
} from './connectiontypes';


export default ({
  comparableToCursor,
  cursorToComparable,
  comparator,
}: ConnectionDefinitionArguments) => {

  /**
   * A simple function that accepts an array and connection arguments, and
   * returns a connection object for use in GraphQL.
   */
  function connectionFromArray<T>(
    data: Array<T>,
    args: ConnectionArguments
  ): Connection<T> {
    return connectionFromArraySlice(
      data,
      args,
    );
  }

  /**
   * A version of `connectionFromArray` that takes a promised array, and returns a
   * promised connection.
   */
  function connectionFromPromisedArray<T>(
    dataPromise: Promise<Array<T>>,
    args: ConnectionArguments
  ): Promise<Connection<T>> {
    return dataPromise.then(data => connectionFromArray(data, args));
  }

  /**
   * Given a slice (subset) of an array, returns a connection object for use in
   * GraphQL.
   *
   * This function is similar to `connectionFromArray`, but is intended for use
   * cases where you know the cardinality of the connection, consider it too large
   * to materialize the entire array, and instead wish pass in a slice of the
   * total result large enough to cover the range specified in `args`.
   */
  function connectionFromArraySlice<T>(
    arraySlice: Array<T>,
    args: ConnectionArguments,
    pageInfo: ?PageInfo,
  ): Connection<T> {
    var {after, before, first, last} = args;
    var beforeId = getId(before);
    var beforeIdIndex = beforeId && arraySlice.findIndex(({id}) => id === beforeId);

    var afterId = getId(after);
    var afterIdIndex = afterId && arraySlice.findIndex(({id}) => id === afterId);

    var startOffset = Math.max(
      sliceStart - 1,
      afterId,
      -1
    ) + 1;
    var endOffset = Math.min(
      sliceEnd,
      beforeId,
      arrayLength
    );

    if (typeof first === 'number') {
      endOffset = Math.min(
        endOffset,
        startOffset + first
      );
    }
    if (typeof last === 'number') {
      startOffset = Math.max(
        startOffset,
        endOffset - last
      );
    }

    // If supplied slice is too large, trim it down before mapping over it.
    const edges = arraySlice.slice(
      Math.max(startOffset - sliceStart, 0),
      arraySlice.length - (sliceEnd - endOffset)
    ).map((value) => ({
      cursor: idToCursor(value.id),
      node: value,
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

  /**
   * A version of `connectionFromArraySlice` that takes a promised array slice,
   * and returns a promised connection.
   */
  function connectionFromPromisedArraySlice<T>(
    dataPromise: Promise<Array<T>>,
    args: ConnectionArguments,
  ): Promise<Connection<T>> {
    return dataPromise.then(
      data => connectionFromArraySlice(data, args, arrayInfo)
    );
  }

  /**
   * Return the cursor associated with an object in an array.
   */
  function cursorForObjectInConnection<T>(
    data: Array<T>,
    object: T
  ): ?ConnectionCursor {
    var offset = data.indexOf(object);
    if (offset === -1) {
      return null;
    }
    return idToCursor(offset);
  }
};
