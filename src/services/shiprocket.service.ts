import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let shiprocketToken: string | null = null;
let tokenExpiry = 0;

export const getShiprocketToken = async () => {
  if (shiprocketToken && Date.now() < tokenExpiry) {
    return shiprocketToken;
  }

  const res = await axios.post(
    `${process.env.SHIPROCKET_BASE_URL}/auth/login`,
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    }
  );

  shiprocketToken = res.data.token;
  tokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000; // ~8 days

  return shiprocketToken;
};




export const createShipment = async (order: any) => {
  const token = await getShiprocketToken();

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().split("T")[0],
    pickup_location: "Primary", // must exist in Shiprocket panel

    billing_customer_name: order.shippingAddress.fullName,
    billing_address: order.shippingAddress.street,
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.zipCode,
    billing_state: order.shippingAddress.state,
    billing_country: order.shippingAddress.country,
    billing_email: order.shippingAddress.email,
    billing_phone: order.shippingAddress.phone,

    shipping_is_billing: true,

    order_items: order.products.map((p: any) => ({
      name: p.product.name,
      sku: p.product._id.toString(),
      units: p.quantity,
      selling_price: p.product.price
    })),

    payment_method: "Prepaid", // or COD
    sub_total: order.totalAmount,

    length: 25,
    breadth: 20,
    height: 3,
    weight: 0.5
  };

  if (!process.env.SHIPROCKET_ENABLED) {
  console.log("🚫 Shiprocket disabled (test mode)");
  return {
    order_id: "TEST_ORDER",
    awb_code: "TEST_AWB",
    courier_name: "TEST",
    tracking_url: "https://example.com"
  };
}

  const res = await axios.post(
    `${process.env.SHIPROCKET_BASE_URL}/orders/create/adhoc`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;
};
