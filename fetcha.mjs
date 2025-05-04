import { bind, lift, of } from "./io.mjs"

/**
 * @import { IO } from "./io.mjs"
 */

/**
 * @template Q
 * @template R
 * @typedef {function(Q): IO<R[]>} GetRowsByQuery<Q,R>
 */

/**
 * @template R
 * @typedef {function(R[], R[]): R[]} Unique<R>
 */

/**
 * Creates Unique<R> using Map.
 * @template R
 * @template U
 * @param {function(R): U} row2uniq Gets unique id from the row.
 * @returns {Unique<R>}
 */
export function createUniqByMap(row2uniq) {
  return (rows0, rows1) => {
    /** @type R[] */
    const rows01 = rows0.concat(rows1)

    /** @type Array<[U, R]> */
    const mapd = rows01.map((row) => {
      /** @type U */
      const uid = row2uniq(row)

      return [uid, row]
    })

    /** @type Map<U, R> */
    const m = new Map(mapd)

    /** @type MapIterator<R> */
    const values = m.values()

    return Array.from(values)
  }
}

/**
 * Creates Unique<R> using concat(not "unique").
 * @template R
 * @returns {Unique<R>}
 */
export function createUniqConcat() {
  return (rows0, rows1) => rows0.concat(rows1)
}

/**
 * Gets rows from 2 data sources and returns unique rows.
 * @template Q
 * @template R
 * @param {GetRowsByQuery<Q,R>} fresh The data source for fresh data.
 * @param {GetRowsByQuery<Q,R>} stale The data source for archived data.
 * @param {Unique<R>} uniq
 * @param {Q} query
 * @returns {IO<R[]>}
 */
export function getUniqRowsAlt(
  fresh,
  stale,
  uniq,
  query,
) {
  return () => {
    /** @type IO<R[]> */
    const firows = fresh(query)

    /** @type IO<R[]> */
    const sirows = stale(query)

    /** @type IO<R[]> */
    const uirows = bind(
      firows,
      (frows) => {
        return bind(
          sirows,
          lift((srows) => Promise.resolve(uniq(frows, srows))),
        )
      },
    )

    return uirows()
  }
}

/**
 * @template Q
 * @template R
 * @typedef {function(GetRowsByQuery<Q,R>): GetRowsByQuery<Q,R>} CreateGet<Q,R>
 */

/**
 * @template Q
 * @template R
 * @param {Unique<R>} uniq
 * @returns {function(GetRowsByQuery<Q,R>): CreateGet<Q,R>}
 */
export function uniq2getRowsByQuery(uniq) {
  return (fresh) => {
    return (stale) => {
      return (query) =>
        getUniqRowsAlt(
          fresh,
          stale,
          uniq,
          query,
        )
    }
  }
}
