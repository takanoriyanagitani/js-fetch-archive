import { all, bind, of } from "../../io.mjs"

import {
  createUniqByMap,
  createUniqConcat,
  uniq2getRowsByQuery,
} from "../../fetcha.mjs"

/**
 * @import { IO } from "../../io.mjs"
 */

/**
 * @import { GetRowsByQuery, Unique } from "../../fetcha.mjs"
 */

/**
 * @typedef {string} Uuid36
 */

/**
 * @typedef {number} Serial
 */

/**
 * @typedef {object} LogItem
 * @property {string} timestamp
 * @property {string} body
 * @property {string} severity
 * @property {Serial} id
 * @property {string} userId
 * @property {string} date
 */

/** @type Unique<LogItem> */
const uniqByMap = createUniqByMap((row) => row.id)

/** @type Unique<LogItem> */
const uniqNopConcat = createUniqConcat()

/** @type Unique<LogItem> */
//const uniqLog = uniqNopConcat
const uniqLog = uniqByMap

/**
 * @typedef {object} SimpleQuery
 * @property {string} userId
 * @property {string} date
 */

/** @type GetRowsByQuery<SimpleQuery, LogItem> */
const freshSourceDummy = (query) => {
  return () => {
    /** @type LogItem[] */
    const rows = [
      Object.freeze({
        timestamp: "2025-05-03T03:34:55.012Z",
        body: "helo",
        severity: "INFO",
        id: 333,
        userId: "JD",
        date: "2025-05-03",
      }),
      Object.freeze({
        timestamp: "2025-05-03T03:34:55.012Z",
        body: "hello",
        severity: "INFO",
        id: 299792458,
        userId: "JD",
        date: "2025-05-03",
      }),
      Object.freeze({
        timestamp: "2025-04-03T03:34:55.012Z",
        body: "wrld",
        severity: "INFO",
        id: 634,
        userId: "JK",
        date: "2025-04-03",
      }),
      Object.freeze({
        timestamp: "2025-04-03T03:34:55.012Z",
        body: "wwww",
        severity: "INFO",
        id: 3776,
        userId: "JK",
        date: "2025-04-03",
      }),
    ]

    /** @type string */
    const date = query.date

    /** @type LogItem[] */
    const filtered = rows.filter((row) => row.date == date)

    return Promise.resolve(filtered)
  }
}

/** @type GetRowsByQuery<SimpleQuery, LogItem> */
const staleSourceDummy = (query) => {
  return () => {
    /** @type LogItem[] */
    const rows = [
      Object.freeze({
        timestamp: "2025-05-03T03:34:55.012Z",
        body: "helo",
        severity: "INFO",
        id: 333,
        userId: "JD",
        date: "2025-05-03",
      }),
      Object.freeze({
        timestamp: "2025-05-03T03:34:55.012Z",
        body: "hwld",
        severity: "INFO",
        id: 101325,
        userId: "JD",
        date: "2025-05-03",
      }),
      Object.freeze({
        timestamp: "2025-04-03T03:34:55.012Z",
        body: "wrld",
        severity: "INFO",
        id: 634,
        userId: "JK",
        date: "2025-04-03",
      }),
      Object.freeze({
        timestamp: "2025-04-03T03:34:55.012Z",
        body: "hhhh",
        severity: "INFO",
        id: 27315,
        userId: "JK",
        date: "2025-04-03",
      }),
      Object.freeze({
        timestamp: "2025-03-03T03:34:55.012Z",
        body: "__hw",
        severity: "INFO",
        id: 42,
        userId: "JK",
        date: "2025-03-03",
      }),
    ]

    /** @type string */
    const date = query.date

    /** @type LogItem[] */
    const filtered = rows.filter((row) => row.date == date)

    return Promise.resolve(filtered)
  }
}

/** @type GetRowsByQuery<SimpleQuery, LogItem> */
const source0 = freshSourceDummy

/** @type GetRowsByQuery<SimpleQuery, LogItem> */
const source1 = staleSourceDummy

/** @type GetRowsByQuery<SimpleQuery, LogItem> */
const sourceDummy = uniq2getRowsByQuery(uniqLog)(source0)(source1)

//const filterDate = "2025-04-03"
const filterDate = "2025-05-03"

/** @type IO<SimpleQuery> */
const dummyQuery = of(Object.freeze({ userId: "JD", date: filterDate }))

/** @type IO<LogItem[]> */
const result = bind(dummyQuery, sourceDummy)

/**
 * @typedef {function(LogItem): IO<Void>} LogWriter
 */

/** @type LogWriter */
const writeLog = (item) => {
  return () => {
    /** @type string */
    const jstr = JSON.stringify(item)
    console.info(jstr)
    return Promise.resolve()
  }
}

/**
 * @param {LogWriter} logWriter
 * @returns {function(LogItem[]): IO<Void>}
 */
function writeLogsNew(logWriter) {
  return (logs) => {
    return () => {
      /** @type Array<IO<Void>> */
      const write = logs.map(logWriter)

      /** @type IO<Void[]> */
      const writeAll = all(write)

      return writeAll().then((_) => undefined)
    }
  }
}

/** @type IO<Void> */
const logs2writer = bind(result, writeLogsNew(writeLog))

/** @type IO<Void> */
const main = () => {
  return logs2writer()
}

main()
  .catch(console.error)
