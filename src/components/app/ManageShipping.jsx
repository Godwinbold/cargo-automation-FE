import { useState } from "react";
import HeaderTitle from "./HeaderTitle";
import Create from "./Create";
import ShipmentTable from "./ShipmentTable";

const ManageShipping = ({ color, name }) => {
  const [createShipment, setCreateShipment] = useState(false);
  const handleCreateShipment = () => {
    setCreateShipment(true);
  };
  return (
    <div className="p-4">
      <HeaderTitle
        title="Manage Shippings"
        description="No tracking information available for the provided ID. Please ensure the tracking ID is correct or contact support for assistance."
      />
      {!createShipment ? (
        <Create
          btnAction="Shipping"
          description=" Get started by creating a shipment"
          icon={name ? `${name}-ms.png` : "rwanda-ms.png"}
          key="shipping"
          title="No Shipping Data"
          onClick={handleCreateShipment}
          color={color}
        />
      ) : (
        <ShipmentTable color={color} />
      )}
    </div>
  );
};

export default ManageShipping;
