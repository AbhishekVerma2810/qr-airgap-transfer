/** Constants used by BOTH the generator and the reader (the QR contract). */

export const PROTOCOL_TAG = 'QRF1';
export const FIELD_SEPARATOR = '|';
export const PACKET_FIELD_COUNT = 7;
export const BASE64_SLICE_SIZE = 0x8000;

/** Folder support: a folder travels as one ZIP whose name carries this prefix. */
export const FOLDER_PREFIX = 'folder:';

/**
 * Text packets (`QRT1|<id>|<index>|<total>|<crc32 hex>|<text chunk>`): the contract between
 * the text-to-QR and QR-to-text features.
 */
export const TEXT_TAG = 'QRT1';
export const TEXT_FIELD_COUNT = 6;
export const TEXT_ID_BYTES = 4;
export const HEX_RADIX = 16;
export const CRC_HEX_DIGITS = 8;

/** Time units used by the "time left" displays. */
export const TIME = { msPerSecond: 1000, secondsPerMinute: 60, secondsPerHour: 3600 };

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
