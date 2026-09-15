import { History, Search } from "lucide-react";
import "./AuditScreen.css";

export default function AuditScreen() {
  const rows = [
    [
      "Today, 9:42 AM",
      "Michael Eilers",
      "Updated kickoff time",
      "BUF at KC",
      "7:15 PM → 7:20 PM",
    ],
    [
      "Today, 9:31 AM",
      "System",
      "Locked matchup",
      "BUF at KC",
      "Deadline reached",
    ],
    [
      "Yesterday, 4:18 PM",
      "Michael Eilers",
      "Activated player",
      "Divya Selvarajan",
      "Inactive → Active",
    ],
    [
      "Yesterday, 2:07 PM",
      "Abdul Shaik",
      "Submitted picks",
      "Week 1",
      "16 selections",
    ],
    [
      "Aug 24, 11:03 AM",
      "Michael Eilers",
      "Created season",
      "2026 Regular Season",
      "Season created",
    ],
  ];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Commissioner Center</span>
        <h1>Audit History</h1>
        <p>A traceable record of administrative and player activity.</p>
      </div>
      <section className="panel table-panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Search audit history" />
          </div>
          <select defaultValue="all">
            <option value="all">All Actions</option>
            <option value="admin">Administration</option>
            <option value="picks">Picks</option>
          </select>
        </div>
        <div className="audit-list">
          {rows.map((row, index) => (
            <div className="audit-row" key={index}>
              <span className="audit-icon">
                <History size={17} />
              </span>
              <div>
                <strong>{row[2]}</strong>
                <span>{row[3]}</span>
              </div>
              <div>
                <strong>{row[1]}</strong>
                <span>{row[0]}</span>
              </div>
              <span className="change-value">{row[4]}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
