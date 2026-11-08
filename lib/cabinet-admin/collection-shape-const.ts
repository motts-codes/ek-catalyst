// The Cabinets parent category. Program-wide content (program FAQ, attribute master-lists) is stored
// as metafields on this category. Kept in its own module so both collection-shape and
// attributes-shape can import it without a circular dependency.
// Per store: sandbox = 863 (default), live tree 3 = 804. Same env var as CABINETS_CATEGORY_ID in
// lib/cabinets/cabinet-lines-data.ts so the two can never drift.
export const CABINETS_PARENT_CATEGORY_ID = Number(process.env.CABINETS_CATEGORY_ID) || 863;
