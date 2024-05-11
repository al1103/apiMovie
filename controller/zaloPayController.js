// Node v10.15.3
const axios = require("axios").default; // npm install axios
const CryptoJS = require("crypto-js"); // npm install crypto-js
const moment = require("moment"); // npm install moment
const qs = require("qs"); // npm install qs
// APP INFO
const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};
const config2 = {
  key2: "eG4r0GcoNtRGbO8"
};
const config3 = {
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  key2: "eG4r0GcoNtRGbO8"
};


class ZaloPay {
  async createOrder(req, res) {
    const amount = req.body.pointsPay;

    const embed_data = {};
    const items = [
      {
        itemid: "knb",
        itename: "kim nguyen bao",
        itemprice: 198400,
        itemquantity: 1,
      },
    ];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: "zilong",
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: ` Payment for the order #${transID}`,
      bank_code: "zalopayapp",
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    const response = await axios.post(config.endpoint, null, { params: order });
    res.json(response.data);
  }

  async callback(req, res) {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config2.key2).toString();
    console.log("mac =", mac);

    let result = {}; // Define result object
    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      result.return_code = 1;
      result.return_message = "success";
    }
    res.json(result);
  }

  async getOrderByID(req, res) {
    let postData = {
      app_id: config.app_id,
      app_trans_id: "<app_trans_id>", // Input your app_trans_id
    };

    let data =
      postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    let postConfig = {
      method: "post",
      url: config3.endpoint,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData),
    };

    axios(postConfig)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        res.json(response.data);
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).send("Error occurred");
      });
  }
}

module.exports = new ZaloPay();








/////////////////////////////

      // const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();  
      //     const [movies, totalResults] = await Promise.all([ // Fetch movies and total count
      //       MovieDetail.aggregate([
      //         {
      //           $addFields: {
      //             categoryArray: { $objectToArray: "$category" }
      //           }
      //         },
      //         {
      //           $project: {
      //             title: 1,
      //             yearMatch: {
      //               $filter: {
      //                 input: "$categoryArray",
      //                 as: "cat",
      //                 cond: { $eq: ["$$cat.v.group.name", "Năm"] }
      //               }
      //             }
      //           }
      //         },
      //         { $unwind: "$yearMatch" },
      //         {
      //           $match: {
      //             "yearMatch.v.list": {
      //               $elemMatch: {
      //                 "name": year.toString()
      //               }
      //             }
      //           }
      //         },
      //         { $project: { _id: 1, title: 1 } },
      //         { $sort: { _id: -1 } },
      //         { $skip: skip }, 
      //         { $limit: limit }
      //       ]).then((movies) => MovieDetail.populate(movies, { path: "_id" })),
      
      //       MovieDetail.aggregate([ 
      //         { $count: "total" } 
      //       ]).then((result) => result.length > 0 ? result[0].total : 0) // Extract total count
      //     ]);
      ////////////////////////////////////////