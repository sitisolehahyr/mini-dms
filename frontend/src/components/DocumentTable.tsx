import { Link } from "react-router-dom";

import { Document } from "../types/dms";
import StatusBadge from "./StatusBadge";
import Card from "./ui/Card";

function DocumentTable({ documents }: { documents: Document[] }) {
  return (
    <Card className="table-card" padded={false}>
      <div className="table-wrap">
        <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Version</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="data-row">
              <td>
                <div className="doc-title-cell">
                  <strong>{doc.title}</strong>
                  <small className="muted">ID #{doc.id}</small>
                </div>
              </td>
              <td>{doc.documentType}</td>
              <td>
                <StatusBadge status={doc.status} />
              </td>
              <td>v{doc.version}</td>
              <td>{new Date(doc.createdAt).toLocaleString()}</td>
              <td>
                <Link to={`/documents/${doc.id}`} className="table-action-link">
                  View details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </Card>
  );
}

export default DocumentTable;
