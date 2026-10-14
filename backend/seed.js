import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Customer from "./models/customer.model.js";
import Product from "./models/product.model.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Wireless Noise-Canceling Headphones",
    description: "High-fidelity audio with active noise cancellation and 30-hour battery life.",
    price: 199.99,
    category: "Electronics",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ergonomic Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with tactile switches and customizable keymaps.",
    price: 89.99,
    category: "Electronics",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ultra HD Smart Fitness Watch",
    description: "Track your heart rate, sleep patterns, workouts, and notifications in real-time.",
    price: 149.99,
    category: "Electronics",
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Premium Leather Backpack",
    description: "Handcrafted genuine leather backpack with dedicated 15-inch laptop compartment.",
    price: 79.99,
    category: "Fashion",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless vintage wash denim jacket made from 100% durable cotton.",
    price: 64.99,
    category: "Fashion",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ceramic Pour-Over Coffee Maker",
    description: "Brew smooth, full-flavored coffee with this artisan heat-retentive ceramic dripper.",
    price: 34.99,
    category: "Home & Kitchen",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Insulated Stainless Steel Water Bottle",
    description: "Double-wall vacuum insulation keeps beverages ice cold for up to 24 hours.",
    price: 24.99,
    category: "Home & Kitchen",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Minimalist Desk LED Lamp",
    description: "Dimmable eye-caring LED lamp with touch controls and integrated wireless charging pad.",
    price: 42.99,
    category: "Home & Kitchen",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=800&q=80",
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Replace sample products
    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${createdProducts.length} sample products.`);

    // 2. Upsert test users without touching other customer data
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const testUsers = [
      {
        fullName: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        phone: "9876543210",
      },
      {
        fullName: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        phone: "9123456789",
      },
    ];

    for (const user of testUsers) {
      await Customer.findOneAndUpdate({ email: user.email }, user, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    console.log("Seeded test users (john@example.com & jane@example.com) with password: '123456'");

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedData();
