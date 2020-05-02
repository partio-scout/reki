import * as Rt from 'runtypes';

/** Helper function that gives typescript an assertion that the value has the expected type. The actual runtime check is only done in development. */
export function devValidate<T extends Rt.Runtype<unknown>>(value: unknown, runtype: T): asserts value is Rt.Static<T> {
  if (process.env.NODE_ENV !== 'production') {
    runtype.check(value);
  }
}
