const axios = require('axios');

async function testRegister() {
    try {
        console.log('🧪 Testing registration...');
        
        const userData = {
            username: 'admin',
            email: 'admin@taskmanager.com',
            password: 'admin123',
            role: 'admin'
        };
        
        const response = await axios.post('http://localhost:5000/api/auth/register', userData);
        
        console.log('✅ Registration successful!');
        console.log('Response:', response.data);
        
        // Test login
        console.log('\n🧪 Testing login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: userData.email,
            password: userData.password
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', loginResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testRegister();
