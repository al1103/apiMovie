const Package = require("./models/Package"); // Import Package model

// Tạo các gói dịch vụ trong cơ sở dữ liệu
async function createPackages() {
    
  try {
    console.log("Creating packages...")
    // Tạo gói dịch vụ basic
    await Package.create({
      name: "Basic",
      price: 10, // Giả sử giá của gói basic là 10 đơn vị tiền tệ
      subscriptionPlan: "basic",
    });

    // Tạo gói dịch vụ premium
    await Package.create({
      name: "Premium",
      price: 20, // Giả sử giá của gói premium là 20 đơn vị tiền tệ
      subscriptionPlan: "premium",
    });

    console.log("Packages created successfully.");
  } catch (error) {
    console.error("Error creating packages:", error);
  }
}

// Gọi hàm để tạo các gói dịch vụ
createPackages();
