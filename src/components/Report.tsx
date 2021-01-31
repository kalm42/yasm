import { useState } from "react";
import { useUser } from "../context";
import { CommentType, PostType } from "../models";
import { fileReport } from "../services/firebase";

interface Props {
  document: PostType | CommentType;
}
const Report = (props: Props) => {
  const { document } = props;
  const [isReporting, setIsReporting] = useState(false);
  const [report, setReport] = useState("");
  const { user } = useUser();

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReport(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Report:handleSubmit");
    if (!user || !report.length) return;
    fileReport(user, document, report);
    setIsReporting(false);
  };

  return isReporting ? (
    <form onSubmit={handleSubmit}>
      <label htmlFor="report">Why is this rude?*</label>
      <input
        type="text"
        name="report"
        required
        value={report}
        onChange={handleUpdate}
      />
      <button type="submit">File Report</button>
    </form>
  ) : (
    <button onClick={() => setIsReporting(true)}>report</button>
  );
};

export default Report;
