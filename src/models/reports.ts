import { DocumentReference, ServerTimestamp } from "../services/firebase";

export interface NewReport {
  text: string; // the complaint
  reportedBy: string; // who made it
  reported: string; // what was reported
  createdAt: ServerTimestamp;
}

export default interface ReportType extends NewReport {
  _id: string;
  _ref: DocumentReference;
}
