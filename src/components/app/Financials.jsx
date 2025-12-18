// export default Financials;
import React, { useState } from "react";
import HeaderTitle from "./HeaderTitle";
import Create from "./Create";
import FinancialTable from "./FinacialTable";

const Financials = ({ color, name }) => {
  // Lift data state from FinancialTable to parent for shared control
  const [data, setData] = useState([]);

  // Helper to check if table data is "empty"
  const isTableEmpty = React.useMemo(() => {
    if (data.length === 0) return true;
    return data.every((row) =>
      Object.values(row).every((value) => value.trim() === "")
    );
  }, [data]);

  // Handler for "Add Financials" button click: initialize with 5 empty rows
  const handleAddFinancials = () => {
    // Generate rowKeys same as in FinancialTable (you may want to extract this to a shared util)
    const headers = [
      "S/N",
      "MAWB",
      "DATE OF ISSUES",
      "AGENTS/CLIENTS",
      "PRODUCT",
      "ROUTING",
      "FLIGHT NO",
      "PIECES",
      "CHARGEABLE WEIGHT (KG)",
      "GROSS WEIGHT (KG)",
      "SPOT RATE",
      "PUBLISHED RATES",
      "ROE",
      "FREIGHT AMOUNT (NGN)",
      "NCAA CHARGES 5%",
      "TOTAL CHARGE (NGN)",
      "CHARGES COLLECT",
      "FUEL SURCHARGE",
      "SEC SURCHARGE",
      "HANDLING SURCHARGE",
      "DUE APG INC",
      "DUE SLC",
      "SURCHARGE DUE AGENT",
      "AWB FEE",
      "GSA COMMISSION (NGN)",
      "7.5%VAT ON COMMISSION",
      "AMT DUE AIRLINE",
      "DUE APG INC",
      "DUE SLC",
    ];

    const rowKeys = [];
    const seen = new Set();
    headers.forEach((header) => {
      let key = header;
      let counter = 1;
      while (seen.has(key)) {
        key = `${header} ${counter}`;
        counter++;
      }
      seen.add(key);
      rowKeys.push(key);
    });

    const initialRows = Array.from({ length: 5 }, () =>
      rowKeys.reduce((acc, key) => ({ ...acc, [key]: "" }), {})
    );
    setData(initialRows);
  };

  // Handler to clear all data (e.g., from a "Clear" button in table, if added)
  const handleClearAll = () => {
    setData([]);
  };

  // Update handler passed to FinancialTable
  const handleUpdateCell = (rowIndex, colIndex, value) => {
    // You'll need to pass rowKeys to FinancialTable or regenerate here
    // For brevity, assuming FinancialTable handles its own keys; adjust as needed
    // In practice, extract rowKeys to a constant outside
    setData((prevData) => {
      const newData = [...prevData];
      // Assuming colIndex maps directly; use rowKeys in FinancialTable
      const key = rowKeys[colIndex]; // rowKeys defined above
      newData[rowIndex] = { ...newData[rowIndex], [key]: value };
      return newData;
    });
  };

  const [createNow, setCreateNow] = useState(false);

  const handleCreateNow = () => {
    setCreateNow(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-1 md:p-4">
      <div className="flex-none">
        <HeaderTitle
          title="Financials"
          description="Access shipment billing, airline settlements, and financial summaries, all in one place."
        />
      </div>
      <div className="flex-1 overflow-x-auto px-2">
        <FinancialTable />
      </div>
    </div>
  );
};

export default Financials;
