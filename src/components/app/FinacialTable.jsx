import React, { useState } from "react";
import { Check, Lock } from "lucide-react";

const FinancialTable = () => {
  // All headers in one long array
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

  // Generate unique keys for object properties based on headers (handles duplicates by appending a number)
  const rowKeys = React.useMemo(() => {
    const keys = [];
    const seen = new Set();
    headers.forEach((header) => {
      let key = header;
      let counter = 1;
      while (seen.has(key)) {
        key = `${header} ${counter}`;
        counter++;
      }
      seen.add(key);
      keys.push(key);
    });
    return keys;
  }, []);

  // Helper to create a new empty row object
  const createEmptyRow = () => ({
    ...rowKeys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}),
    isDone: false,
  });

  // Initialize data as an array of objects (increased to 20 rows for a larger body)
  const [data, setData] = useState(() =>
    Array.from({ length: 20 }, createEmptyRow)
  );

  // Helper to update a specific cell by row index and column index (maps to unique key)
  const updateCell = (rowIndex, colIndex, value) => {
    const key = rowKeys[colIndex];
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [key]: value };
      return newData;
    });
  };

  // Toggle row done status
  const toggleRowDone = (rowIndex) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        isDone: !newData[rowIndex].isDone,
      };
      return newData;
    });
  };

  // Helper to add a new row
  const addRow = () => {
    setData((prevData) => [...prevData, createEmptyRow()]);
  };

  return (
    <div className="w-full p-1 mt-10">
      <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((header, index) => (
                  <th
                    key={index} // Use index as key since headers may duplicate
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border border-gray-300 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border border-gray-300 whitespace-nowrap sticky right-0 bg-gray-50 z-10 shadow-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamic rows based on data length for consistency */}
              {data.map((row, rowIndex) => {
                // Check if the last column for this row has a value
                const lastKey = rowKeys[rowKeys.length - 1];
                const isLastColumnFilled =
                  row[lastKey] && row[lastKey].toString().trim() !== "";

                return (
                  <tr
                    key={rowIndex}
                    className={`${row.isDone ? "bg-gray-50" : "bg-white"}`}
                  >
                    {headers.map((header, colIndex) => {
                      const key = rowKeys[colIndex];
                      return (
                        <td
                          key={colIndex} // Use colIndex as key for stable rendering
                          className="text-sm text-gray-700 border border-gray-300 min-w-[100px]"
                        >
                          <input
                            type="text"
                            value={row[key] || ""}
                            onChange={(e) =>
                              updateCell(rowIndex, colIndex, e.target.value)
                            }
                            disabled={row.isDone}
                            className={`w-full h-full px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent bg-transparent ${
                              row.isDone
                                ? "cursor-not-allowed text-gray-500"
                                : ""
                            }`}
                          />
                        </td>
                      );
                    })}
                    {/* Action Column */}
                    <td className="border border-gray-300 px-2 py-1 sticky right-0 bg-white z-10 shadow-sm text-center">
                      {(isLastColumnFilled || row.isDone) && (
                        <button
                          onClick={() => toggleRowDone(rowIndex)}
                          className={`p-1.5 rounded-full transition-colors ${
                            row.isDone
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                          title={row.isDone ? "Unlock Row" : "Mark as Done"}
                        >
                          {row.isDone ? (
                            <Lock size={16} />
                          ) : (
                            <Check size={16} strokeWidth={3} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Row Button */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={addRow}
          className="px-4 text-nowrap py-2 bg-[#003999] text-white rounded-md hover:bg-[#003999]/70 focus:outline-none focus:ring-2 focus:ring-[#003999] transition-colors"
        >
          Add Row
        </button>

        {/* Column Count Info */}
        <div className="text-sm text-gray-600">
          Columns: {headers.length} | Rows: {data.length}
        </div>
      </div>
    </div>
  );
};

export default FinancialTable;
