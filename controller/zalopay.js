
const crypto = require("crypto");

const app_id = "2553";
const key1 = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";
const create_order_url = "https://sb-openapi.zalopay.vn/v2/create";

const embed_data = {};
const items = [{}];
const app_trans_id = Math.floor(Math.random() * 1000000); // Generate a random order's ID.
const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

const param = {
  app_id: app_id,
  app_user: "user123",
  app_time: timestamp.toString(),
  amount: "50000",
  app_trans_id:
    new Date().toISOString().slice(2, 10).replace(/-/g, "") +
    "_" +
    app_trans_id,
  embed_data: JSON.stringify(embed_data),
  item: JSON.stringify(items),
  description: "Lazada - Thanh toán đơn hàng #" + app_trans_id,
  bank_code: "zalopayapp",
};

const data =
  app_id +
  "|" +
  param.app_trans_id +
  "|" +
  param.app_user +
  "|" +
  param.amount +
  "|" +
  param.app_time +
  "|" +
  param.embed_data +
  "|" +
  param.item;
param.mac = crypto.createHmac("sha256", key1).update(data).digest("hex");

axios
  .post(create_order_url, param)
  .then((response) => {
    const result = response.data;
    for (const [key, value] of Object.entries(result)) {
      console.log(`${key} = ${value}`);
    }
  })
  .catch((error) => {
    console.error(error);
  });
