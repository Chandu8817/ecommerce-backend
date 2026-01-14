"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageRoutes = exports.uploadRoutes = exports.paymentRoutes = exports.categoryRoutes = exports.reviewRoutes = exports.cartRoutes = exports.wishlistRoutes = exports.bannerRoutes = exports.orderRoutes = exports.productRoutes = exports.authRoutes = void 0;
// index.ts
var auth_routes_1 = require("./auth.routes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var product_route_1 = require("./product.route");
Object.defineProperty(exports, "productRoutes", { enumerable: true, get: function () { return __importDefault(product_route_1).default; } });
var order_route_1 = require("./order.route");
Object.defineProperty(exports, "orderRoutes", { enumerable: true, get: function () { return __importDefault(order_route_1).default; } });
var banner_routes_1 = require("./banner.routes");
Object.defineProperty(exports, "bannerRoutes", { enumerable: true, get: function () { return __importDefault(banner_routes_1).default; } });
var wishlist_route_1 = require("./wishlist.route");
Object.defineProperty(exports, "wishlistRoutes", { enumerable: true, get: function () { return __importDefault(wishlist_route_1).default; } });
var cart_route_1 = require("./cart.route");
Object.defineProperty(exports, "cartRoutes", { enumerable: true, get: function () { return __importDefault(cart_route_1).default; } });
var review_route_1 = require("./review.route");
Object.defineProperty(exports, "reviewRoutes", { enumerable: true, get: function () { return __importDefault(review_route_1).default; } });
var category_routes_1 = require("./category.routes");
Object.defineProperty(exports, "categoryRoutes", { enumerable: true, get: function () { return __importDefault(category_routes_1).default; } });
var payment_route_1 = require("./payment.route");
Object.defineProperty(exports, "paymentRoutes", { enumerable: true, get: function () { return __importDefault(payment_route_1).default; } });
var upload_routes_1 = require("./upload.routes");
Object.defineProperty(exports, "uploadRoutes", { enumerable: true, get: function () { return __importDefault(upload_routes_1).default; } });
var getImage_routes_1 = require("./getImage.routes");
Object.defineProperty(exports, "getImageRoutes", { enumerable: true, get: function () { return __importDefault(getImage_routes_1).default; } });
