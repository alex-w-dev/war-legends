export type IQueryablePromise<T> = Promise<T> & {
  isFulfilled(): boolean;
  isPending(): boolean;
  isRejected(): boolean;
};

export function makeQueryablePromise<T>(
  promise: Promise<T>,
): IQueryablePromise<T> {
  // Don't modify any promise that has been already modified.
  if (!!(promise as IQueryablePromise<T>).isFulfilled) {
    return promise as IQueryablePromise<T>;
  }

  // Set initial state
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;

  return Object.assign(
    promise.then(
      function (v) {
        isFulfilled = true;
        isPending = false;
        return v;
      },
      function (e) {
        isRejected = true;
        isPending = false;
        throw e;
      },
    ),
    {
      isFulfilled: () => isFulfilled,
      isPending: () => isPending,
      isRejected: () => isRejected,
    },
  );
}
