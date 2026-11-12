/** Constants used by BOTH the generator and the reader (the QR contract). */

export const PROTOCOL_TAG = 'QRF1';
export const FIELD_SEPARATOR = '|';
export const PACKET_FIELD_COUNT = 7;
export const BASE64_SLICE_SIZE = 0x8000;

/** Folder support: a folder travels as one ZIP whose name carries this prefix. */
export const FOLDER_PREFIX = 'folder:';

/** ZIP format constants (store-only archives). */
export const ZIP = {
  localSignature: 0x04034b50,
  centralSignature: 0x02014b50,
  endSignature: 0x06054b50,
  version: 20,
  utf8Flag: 0x0800,
  fixedDosDate: 0x21, // 1980-01-01, keeps archives reproducible
  maxEntries: 0xffff,
  localHeaderSize: 30,
  centralHeaderSize: 46,
  endRecordSize: 22,
  directoryAttribute: 0x10,
};
