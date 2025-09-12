import { Order } from "../src/models/Order";
import mongoose from "mongoose";
import app from "../src/app";
import request from "supertest";
import { Product } from "../src/models/Product";

const MONGO_TEST_URL = process.env.MONGO_TEST_URL || "";
let adminToken: string;
let buyerToken: string;
beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URL);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await Order.deleteMany({});
});

describe("Order API", () => {
  let productId: string;

  test("creates an order", async () => {
    // First, create a product to order
    adminToken = await loginAndGetToken();
    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Order Test Product",
        description: "Product for order testing",
        price: 200,
        category: "TestCategory",
        brand: "TestBrand",
        stock: 20,
        isActive: true,
      });
    expect(productRes.status).toBe(201);
    productId = productRes.body._id;

    // Login as buyer
    buyerToken = await loginAndGetToken("user");
    // Now, create an order for that product
    const orderRes = await orderProduct(productId,buyerToken);
    const productData = await request(app).get(`/api/products/${productId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(productData.body.stock).toBe(18);

  

    expect(orderRes.status).toBe(201);
    expect(orderRes.body).toHaveProperty("_id");
    expect(orderRes.body.products).toHaveLength(1);
    expect(orderRes.body.products[0].product).toBe(productId);
    expect(orderRes.body.products[0].quantity).toBe(2);

  });
  test("fetches an order by ID", async () => {
    // Create a product
    adminToken = await loginAndGetToken();
  
    productId = await addProductAndGetId();

    // Login as buyer
    buyerToken = await loginAndGetToken("user");
    // Create an order
    const orderRes = await orderProduct(productId,buyerToken);
    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body._id;

    // Fetch the order by ID
    const fetchRes = await request(app)
      .get(`/api/order/${orderId}`)
      .set("Authorization", `Bearer ${buyerToken}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body).toHaveProperty("_id", orderId);
    expect(fetchRes.body.products).toHaveLength(1);
    expect(fetchRes.body.products[0].product._id).toBe(productId);
    expect(fetchRes.body.products[0].quantity).toBe(2);
  });
  test("fetches a list of orders with pagination", async () => {
    // Create a product
    adminToken = await loginAndGetToken();
    productId = await addProductAndGetId();

    // Login as buyer
    buyerToken = await loginAndGetToken("user");
    // Create multiple orders
    for (let i = 0; i < 15; i++) {
      const orderRes = await orderProduct(productId,buyerToken);
      console.log(orderRes.body);
      expect(orderRes.status).toBe(201);
    }

    // Fetch orders with pagination
    const fetchRes = await request(app)
      .get("/api/order?take=10&skip=0")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body).toHaveLength(10); // Should return 10 orders

    const fetchRes2 = await request(app)
      .get("/api/order?take=10&skip=10")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(fetchRes2.status).toBe(200);
    expect(fetchRes2.body).toHaveLength(5); // Should return remaining 5 orders
  });
  test("unauthorized access is blocked", async () => {
    const res = await request(app).get("/api/order");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });
  test("creating order without token is blocked", async () => {
    const res = await request(app)
      .post("/api/order")
      .send({
        products: [
          {
            product: "someproductid",
            quantity: 1,
          },
        ],
        shippingAddress: "123 Test St, Test City, Madhya Pradesh",
        paymentMethod: "credit_card",
        totalAmount: 100,
      });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });
  test("fetching order with invalid ID returns 500", async () => {
    buyerToken = await loginAndGetToken("user");
    const res = await request(app)
      .get("/api/order/invalid-id")
      .set("Authorization", `Bearer ${buyerToken}`);
      
    expect(res.status).toBe(500);
    // expect(res.body.error).toHaveProperty("message", "Invalid order ID");
  });
  test("fetching non-existing order returns 404", async () => {
    buyerToken = await loginAndGetToken("user");
    const nonExistingId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/order/${nonExistingId}`)
      .set("Authorization", `Bearer ${buyerToken}`);
    
    expect(res.status).toBe(404);
  });
  test("fetching orders by user returns only their orders", async () => {
    // Create a product
    
    adminToken = await loginAndGetToken();
    productId = await addProductAndGetId();

    // Login as buyer1 and create orders
    await request(app).post("/api/auth/register").send({
      name: "user1",
      email: `user1@test.com`,
      password: "password123",
      role: "user",
    });
    const loginRes1 = await request(app)
      .post("/api/auth/login")
      .send({ email: `user1@test.com`, password: "password123" });
    const [userId1, buyer1Token] = [loginRes1.body._id, loginRes1.body.token];
    for (let i = 0; i < 5; i++) {
      const orderRes = await orderProduct(productId,buyer1Token);
      expect(orderRes.status).toBe(201);
    }

    // Login as buyer2 and create orders

    await request(app).post("/api/auth/register").send({
      name: "user2",
      email: `user2@test.com`,
      password: "password123",
      role: "user",
    });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: `user2@test.com`, password: "password123" });
    const [userId2, buyer2Token] = [loginRes.body._id, loginRes.body.token];
    for (let i = 0; i < 3; i++) {
     const orderRes = await orderProduct(productId,buyer2Token);
      expect(orderRes.status).toBe(201);
    }

    // Fetch orders for buyer1
    const fetchRes1 = await request(app)
      .get(`/api/order/user/${userId1}`)
      .set("Authorization", `Bearer ${buyer1Token}`);
    expect(fetchRes1.status).toBe(200);
    expect(fetchRes1.body).toHaveLength(5); // Should return 5 orders for buyer1

    // Fetch orders for buyer2
    const fetchRes2 = await request(app)
      .get(`/api/order/user/${userId2}`)
      .set("Authorization", `Bearer ${buyer2Token}`);
    expect(fetchRes2.status).toBe(200);
    expect(fetchRes2.body).toHaveLength(3); // Should return 3 orders for buyer2
  });
  test("cancelling an order", async () => {
    // Create a product
    adminToken = await loginAndGetToken();
    productId = await addProductAndGetId();

    // Login as buyer
    buyerToken = await loginAndGetToken("user");
    // Create an order
   const orderRes = await orderProduct(productId,buyerToken);
    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body._id;
   

    // Cancel the order
    const cancelRes = await request(app)
      .patch(`/api/order/${orderId}/cancel`)
      .set("Authorization", `Bearer ${buyerToken}`);

      
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body).toHaveProperty("_id", orderId);
    expect(cancelRes.body).toHaveProperty("status", "cancelled");

    // Fetch the order to verify status
    const fetchRes = await request(app)
      .get(`/api/order/${orderId}`)
      .set("Authorization", `Bearer ${buyerToken}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body).toHaveProperty("_id", orderId);
    expect(fetchRes.body).toHaveProperty("status", "cancelled");
  });
  test("cancelling an order by another user is blocked", async () => {
    // Create a product
    adminToken = await loginAndGetToken("admin");
    productId = await addProductAndGetId();

    // Login as buyer1 and create an order
    await request(app).post("/api/auth/register").send({
      name: "user1",
      email: "user1@test.com",
      password: "password123",
      role: "user",
    });
    const loginRes1 = await request(app)
      .post("/api/auth/login")
      .send({ email: "user1@test.com", password: "password123" });
    const buyer1Token = loginRes1.body.token;
    const orderRes = await orderProduct(productId,buyer1Token);
    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body._id;
    // Login as buyer2
    const loginRes2 = await loginAndGetToken("user");
    const buyer2Token = loginRes2;
    // Attempt to cancel buyer1's order as buyer2
    const cancelRes = await request(app)
      .patch(`/api/order/${orderId}/cancel`)
      .set("Authorization", `Bearer ${buyer2Token}`);
     
    expect(cancelRes.status).toBe(403);
    expect(cancelRes.body.error.code).toBe("FORBIDDEN");
  })
  test("fetching orders with status filter", async () => {
    // Create a product
    adminToken = await loginAndGetToken();
    productId = await addProductAndGetId();

    // Login as buyer
    buyerToken = await loginAndGetToken("user");
    // Create multiple orders with different statuses
    const orderStatuses = ["pending", "shipped", "delivered", "cancelled"];
    for (let status of orderStatuses) {
      const orderRes = await orderProduct(productId,buyerToken);
      expect(orderRes.status).toBe(201);
      const orderId = orderRes.body._id;
      // Update order status directly in DB for testing
      await Order.findByIdAndUpdate(orderId, { status });
    }

    // Fetch orders with status filter
    const fetchRes = await request(app)
      .get(`/api/order/status/${"shipped"}`)
      .set("Authorization", `Bearer ${adminToken}`)
      
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body).toHaveLength(1); // Should return 1 order with 'shipped' status
    expect(fetchRes.body[0]).toHaveProperty("status", "shipped");
  }
)

test("Update Order Status", async ()=> {
  const adminToken = await loginAndGetToken("admin");
  const buyerToken = await loginAndGetToken("user");
  productId = await addProductAndGetId();
  const orderRes = await orderProduct(productId,buyerToken);
  expect(orderRes.status).toBe(201);
  const orderId = orderRes.body._id;
  // Update order status as admin
  const updateRes = await request(app)
    .put(`/api/order/${orderId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "shipped" });
  expect(updateRes.status).toBe(200);
  expect(updateRes.body).toHaveProperty("_id", orderId);
  expect(updateRes.body).toHaveProperty("status", "shipped");
  
})

describe("Sales & Reports API", () => {
  let adminToken: string;
  let buyerToken: string;
  let productId: string;
  let orderId: string;

  beforeEach(async () => {
    adminToken = await loginAndGetToken("admin");
    buyerToken = await loginAndGetToken("user");
    productId = await addProductAndGetId();

    const orderRes = await orderProduct(productId, buyerToken);
    expect(orderRes.status).toBe(201);
    orderId = orderRes.body._id;
  });

  test("Get total sales", async () => {
    const res = await request(app)
      .get("/api/order/total-sales")
      .set("Authorization", `Bearer ${adminToken}`);
   
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalSales");
    expect(typeof res.body.totalSales).toBe("number");
  });

  test("Get monthly sales report", async () => {
    const year = new Date().getFullYear();
    const res = await request(app)
      .get(`/api/order/monthly-sales?year=${year}`)
      .set("Authorization", `Bearer ${adminToken}`);
     
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // your service likely returns array of months
    if (res.body.length > 0) {
     
      expect(res.body[8]).toBe(400);
    }
  });

  test("Get sales by product", async () => {
    const res = await request(app)
      .get(`/api/order/sales?take=5&skip=0`)
      .set("Authorization", `Bearer ${adminToken}`);
     
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("sales");
    expect(res.body.sales[0]).toHaveProperty("productId", productId);
    expect(Array.isArray(res.body.sales)).toBe(true);
  });

  test("Filter orders by status", async () => {
    const res = await request(app)
      .post("/api/order/filter")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "pending" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      
      expect(res.body[0][0]).toHaveProperty("status");
    }
  });

  test("Unauthorized access is blocked", async () => {
    const res = await request(app).get("/api/order/total-sales");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });
});

});

// hepler for login and get token
async function loginAndGetToken(
  role: string = "admin"
): Promise<string> {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: role,
      email: `${role}@test.com`,
      password: "password123",
      role: role,
    });
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: `${role}@test.com`, password: "password123" });
  return  loginRes.body.token;
}

async function addProductAndGetId(): Promise<string> {
  adminToken = await loginAndGetToken();
  const productRes = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Order Test Product",
      description: "Product for order testing",
      price: 200,
      category: "TestCategory",
      brand: "TestBrand",
      stock: 20,
      isActive: true,
    });
  expect(productRes.status).toBe(201);
  return productRes.body._id;
}

async function orderProduct(productId:string,token:string) {
  const orderRes = await request(app)
      .post("/api/order")
      .set("Authorization", `Bearer ${token}`)
      .send({
        products: [
          {
            product: productId,
            quantity: 2,
          },
        ],
        shippingAddress: "123 Test St, Test City, Madhya Pradesh",
        paymentMethod: "credit_card",
        totalAmount: 400,
        
      });
      return orderRes;
  
}
