import React, { useState } from "react";
import HeaderTitle from "./HeaderTitle";
import Create from "./Create";
import DocumentsTable from "./DocumentsTable";

const Documents = ({ color, name }) => {
  const [createDocument, setCreateDocument] = useState(false);
  const [airwayBills, setAirwayBills] = useState([
    { id: 1, billNumber: "AWB-2025-001", shipmentDate: "2025-10-01" },
    { id: 2, billNumber: "AWB-2025-002", shipmentDate: "2025-10-01" },
    { id: 3, billNumber: "AWB-2025-003", shipmentDate: "2025-10-01" },
    { id: 4, billNumber: "AWB-2025-004", shipmentDate: "2025-10-01" },
    { id: 5, billNumber: "AWB-2025-005", shipmentDate: "2025-10-01" },
    { id: 6, billNumber: "AWB-2025-006", shipmentDate: "2025-10-01" },
    { id: 7, billNumber: "AWB-2025-007", shipmentDate: "2025-10-01" },
    { id: 8, billNumber: "AWB-2025-008", shipmentDate: "2025-10-01" },
    { id: 9, billNumber: "AWB-2025-009", shipmentDate: "2025-10-01" },
    { id: 10, billNumber: "AWB-2025-010", shipmentDate: "2025-09-28" },
    { id: 11, billNumber: "AWB-2025-011", shipmentDate: "2025-09-25" },
    { id: 12, billNumber: "AWB-2025-012", shipmentDate: "2025-10-02" },
  ]);

  const handleCreateDocument = () => {
    setCreateDocument(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4">
      <div className="flex-none">
        <HeaderTitle
          title="Documents"
          description="Access and manage scanned airway bills, cargo forms, and shipment records in one place."
        />
      </div>
      <div className="flex-1 overflow-x-auto mt-4 px-2">
        {!createDocument && airwayBills.length === 0 ? (
          <Create
            btnAction="Document"
            description="Get started by creating a document."
            icon={name ? `${name}-doc.png` : "rwanda-doc.png"}
            key="document"
            title="No Documents"
            onClick={handleCreateDocument}
            color={color}
          />
        ) : (
          <DocumentsTable
            airwayBills={airwayBills}
            setAirwayBills={setAirwayBills}
            color={color}
          />
        )}
      </div>
    </div>
  );
};

export default Documents;
