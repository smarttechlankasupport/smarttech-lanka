const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = fs.readFileSync('./admin_token.txt', 'utf-8').trim();

const testProductCreate = async () => {
  try {
    const formData = new FormData();
    formData.append('name', 'Test WiFi Router');
    formData.append('description', 'High-speed WiFi 6 router with advanced security features');
    formData.append('shortDesc', 'WiFi 6 Router - AX3000');
    formData.append('category', '6a1edc0fbf378ac2a3e590c4'); // Smart Lights category from seeder
    formData.append('price', '5000');
    formData.append('originalPrice', '7500');
    formData.append('stock', '15');
    formData.append('brand', 'SmartTech');
    formData.append('warranty', '2 Year Warranty');
    formData.append('featured', 'true');
    formData.append('tags', JSON.stringify(['wifi', 'router', 'smart', 'home']));
    formData.append('specs', JSON.stringify([
      { key: 'Speed', value: 'AX3000' },
      { key: 'Coverage', value: '200 sqm' },
      { key: 'Ports', value: '4x Gigabit' }
    ]));

    const response = await axios.post(`${API_URL}/products`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log('✅ Product Created!');
    console.log(`Product ID: ${response.data.product._id}`);
    console.log(`Name: ${response.data.product.name}`);
    console.log(`Price: Rs. ${response.data.product.price}`);
    console.log(`Stock: ${response.data.product.stock}`);
  } catch (error) {
    console.error('❌ Error creating product:');
    console.error(`Status: ${error.response?.status}`);
    console.error(`Message: ${error.response?.data?.message || error.message}`);
  }
};

testProductCreate();
