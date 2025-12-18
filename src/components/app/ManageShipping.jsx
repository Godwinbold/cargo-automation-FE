import { useState } from "react";
import HeaderTitle from "./HeaderTitle";
import Create from "./Create";
import ShipmentTable from "./ShipmentTable";

const ManageShipping = ({ color, name }) => {
  const [data, setData] = useState([
    {
      id: 1,
      airwayBillNumber: "AWB-1001",
      status: "Accepted",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 2,
      airwayBillNumber: "AWB-1002",
      status: "Booked",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 3,
      airwayBillNumber: "AWB-1003",
      status: "Delivered",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 4,
      airwayBillNumber: "AWB-1004",
      status: "Flown",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 5,
      airwayBillNumber: "AWB-1005",
      status: "Booked",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 6,
      airwayBillNumber: "AWB-1006",
      status: "Accepted",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 7,
      airwayBillNumber: "AWB-1007",
      status: "Delivered",
      date: "2025-10-01",
      note: null,
    },
  ]);
  const [createShipment, setCreateShipment] = useState(false);
  const handleCreateShipment = () => {
    setCreateShipment(true);
  };
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4">
      <div className="flex-none">
        <HeaderTitle
          title="Manage Shippings"
          description="No tracking information available for the provided ID. Please ensure the tracking ID is correct or contact support for assistance."
        />
      </div>
      <div className="flex-1 overflow-y-auto mt-4 px-2">
        {data.length > 0 ? (
          <ShipmentTable color={color} data={data} setData={setData} />
        ) : (
          <Create
            btnAction="Shipping"
            description=" Get started by creating a shipment"
            icon={name ? `${name}-ms.png` : "rwanda-ms.png"}
            key="shipping"
            title="No Shipping Data"
            onClick={handleCreateShipment}
            color={color}
          />
        )}
      </div>
    </div>
  );
};

export default ManageShipping;
