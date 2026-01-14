import app from "../app";
import { Order, IOrder } from "../models/Order";
import { Product } from "../models/Product";
import { IShippingAddress, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { razorpay } from "../utils/razorpay";
const SHIPPING_STATES = [
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Bihar",
  "Jharkhand",
  "Odisha",
  "West Bengal",
  "Sikkim",
  "Assam",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Meghalaya",
  "Chhattisgarh",
];
export const createOrder = async (orderInput: Partial<IOrder>) => {
  const {
    user,
    products,
    totalAmount,
    shippingAddress,
    paymentMethod
  } = orderInput;

  /// 

  if (
    !user ||
    !products ||
    products.length === 0 ||
    totalAmount == null ||
    !shippingAddress ||
    !paymentMethod
  ) {
    throw new AppError("INVALID_INPUT", "Missing required fields", 400);
  }

  if (totalAmount < 0) {
    throw new AppError("INVALID_AMOUNT", "Total amount must be non-negative", 400);
  }

  if (!isValidShippingAddress(shippingAddress as unknown as IShippingAddress)) {
    throw new AppError(
      "INVALID_SHIPPING",
      "Shipping address must be in allowed states",
      400
    );
  }

  const order = await Order.create(orderInput);

  // ✅ Update product stock safely
  for (const item of products) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new AppError("RESOURCE_NOT_FOUND", "Product not found", 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError("OUT_OF_STOCK", "Insufficient stock", 400);
    }

    product.stock -= item.quantity;
    await product.save();
  }

  return order;
};

export const getOrderById = async (id: string) => {
  const order = await Order.findById(id)
    .populate("user")
    .populate("products.product");
  if (!order) {
    // throw new Error("Order not found");
    throw new AppError("RESOURCE_NOT_FOUND", "Order not found", 404, [
          { field: "orderId", issue: "Does not exist in database" },
        ]);
  }
  return order;
};
export const getOrders = async (take: number = 10, skip: number = 0,userId:string) => {
   const isAdmin = await isAdminUser(userId);
   if (isAdmin) {
      
    
  const orders = await Order.find()
    .populate("user")
    .populate("products.product")
    .limit(take)
    .skip(skip)
    .sort({ createdAt: -1 });
  return orders;
    } else {
      throw new Error("Unauthorized");
    }
};
export const getOrdersByUser = async (
  userId: string,
  take: number = 10,
  skip: number = 0
) => {
  const orders = await Order.find({ user: userId })
    .populate("products.product")
    .limit(take)
    .skip(skip)
    .sort({ createdAt: -1 });
  return orders;
};
export const cancelOrder = async (id: string, userId: string) => {

    const order = await Order.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.user.toString() !== userId) {
      throw new AppError("FORBIDDEN", "You can only cancel your own orders", 403, [
          { field: "userId", issue: "Forbidden" },
        ]);
  }
  if (order.status === "shipped" || order.status === "delivered") {
    throw new Error("Cannot cancel order that is already shipped or delivered");
  }
  order.status = "cancelled";
  order.updatedAt = new Date();
  await order.save();
  return order;

};
export const getOrdersByStatus = async (
  status: IOrder["status"],
  take: number = 10,
  skip: number = 0
) => {
  const orders = await Order.find({ status })
    .populate("user")
    .populate("products.product")
    .limit(take)
    .skip(skip)
    .sort({ createdAt: -1 });
  return orders;
};
export const getTotalSales = async () => {
  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ["delivered"] },
      },
    },
    { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
  ]);

  return result[0]?.totalSales || 0;
};
export const getMonthlySales = async (year: number) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const monthlySales = Array(12).fill(0);
  result.forEach((item) => {
    monthlySales[item._id - 1] = item.totalSales;
  });
  return monthlySales;
};
export const getSalesByProduct = async (
  take: number = 10,
  skip: number = 0
) => {
  const result = await Order.aggregate([
    { $unwind: "$products" },
    {

      $group: {
        _id: "$products.product",
        totalSales: {
          $sum: { $multiply: ["$products.quantity", "$totalAmount"] },
        },
        totalQuantity: { $sum: "$products.quantity" },
      },
    },
    { $sort: { totalSales: -1 } },
    { $skip: skip },
    { $limit: take },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        productName: "$product.name",
        totalSales: 1,
        totalQuantity: 1,
      },
    },
  ]);
  return result;
};
export const filterOrders = async (
  filter: Partial<IOrder> & { take?: number; skip?: number }
) => {
  const {
    user,
    status,
    shippingAddress,
    paymentMethod,
    createdAt,
    take = 10,
    skip = 0,
  } = filter;
  const query: any = {};
  if (user) query.user = user;
  if (status) query.status = status;
  if (shippingAddress)
    query.shippingAddress = { $regex: shippingAddress, $options: "i" };
  if (paymentMethod)
    query.paymentMethod = {
      $regex: paymentMethod,
      $options: "i",
    };
  if (createdAt) {
    const date = new Date(createdAt);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    query.createdAt = { $gte: date, $lt: nextDate };
  }
  const orders = await Order.find(query)
    .populate("user")
    .populate("products.product")
    .limit(take)
    .skip(skip)
    .sort({ createdAt: -1 });
  const total = await Order.countDocuments(query);
  return [orders, total];
};
export const updateOrderStatus = async (
  id: string,
  status: IOrder["status"]
) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }
  order.status = status;
  order.updatedAt = new Date();
  await order.save();
  return order;
};


const isValidShippingAddress = (
  address: IShippingAddress
): boolean => {
  if (!address || !address.state) return false;
  return SHIPPING_STATES.includes(address.state);
};


const isAdminUser = async (userId: string): Promise<boolean> => {
    //check user role admin
      const user = await User.findById(userId);
      if (!user) {
          throw new Error("User not found");
      }
      if (user.role === "admin") {
         return true;
      }
      return false;

      
}