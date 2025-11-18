import React, { useState } from "react";
import HeaderTitle from "./HeaderTitle";
import Create from "./Create";
import DocumentsTable from "./DocumentsTable";

const Documents = ({ color, name }) => {
  const [createDocument, setCreateDocument] = useState(false);
  const handleCreateDocument = () => {
    setCreateDocument(true);
  };
  return (
    <div className="p-4">
      <HeaderTitle
        title="Documents"
        description="Access and manage scanned airway bills, cargo forms, and shipment records in one place."
      />
      {!createDocument ? (
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
        <DocumentsTable />
      )}
    </div>
  );
};

export default Documents;
