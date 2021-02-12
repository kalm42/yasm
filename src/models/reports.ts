import { DocumentReference } from "../services/firebase";
import { ReportDocument } from "./document-models";

export default interface ReportType extends ReportDocument {
  _id: string;
  _ref: DocumentReference;
}
