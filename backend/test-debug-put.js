const axios = require('axios');

async function testDebugPut() {
    try {
        console.log('🧪 Testing PUT request with debug...');
        
        // First login to get token
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@taskmanager.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        
        // Create a task first
        const taskData = {
            title: 'Task for PUT Test',
            description: 'This task will be updated',
            status: 'à faire',
            assignedTo: loginResponse.data.user.id
        };
        
        const createResponse = await axios.post('http://localhost:5001/api/tasks', taskData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Task created:', createResponse.data.task._id);
        
        // Now test PUT with different assignedTo values
        const taskId = createResponse.data.task._id;
        
        console.log('\n🔍 Testing PUT with user ID...');
        const putResponse1 = await axios.put(
            `http://localhost:5001/api/tasks/${taskId}`, 
            {
                title: 'Updated with ID',
                assignedTo: loginResponse.data.user.id
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ PUT with ID successful:', putResponse1.data.task.title);
        
        console.log('\n🔍 Testing PUT with email...');
        const putResponse2 = await axios.put(
            `http://localhost:5001/api/tasks/${taskId}`, 
            {
                title: 'Updated with Email',
                assignedTo: 'test@example.com'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ PUT with Email successful:', putResponse2.data.task.title);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testDebugPut();
