const axios = require('axios');

const endpoint = "https://api.cognitive.microsofttranslator.com/";
const subscriptionKey = "3607f2c456904a07a3bb2d9ba0018099";
const region = "global";

async function translate(text, targetLanguage, sourceLanguage = null) {
  try {
    const response = await axios({
      baseURL: endpoint,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-type': 'application/json',
      },
      params: {
        'api-version': '3.0',
        'to': targetLanguage,
        'from': sourceLanguage
      },
      data: [{
        'text': text
      }],
      responseType: 'json'
    });

    return response.data[0].translations[0].text;
  } catch (error) {
    console.error('Error translating text:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { translate };