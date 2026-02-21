const axios = require('axios');

async function testTaskCreationFixed() {
    try {
        console.log('🧪 Testing task creation with fixed backend...');
        
        // First login to get token
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@taskmanager.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('User:', loginResponse.data.user);
        
        // Create a task
        const taskData = {
            title: 'Test Task Fixed',
            description: 'This is a test task with fixed backend',
            status: 'à faire',
            assignedTo: loginResponse.data.user.id // Use user ID from login
        };
        
        console.log('Creating task with data:', taskData);
        
        const taskResponse = await axios.post('http://localhost:5001/api/tasks', taskData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Task created successfully!');
        console.log('Task:', taskResponse.data);
        
        // Test updating the task
        const updateData = {
            title: 'Updated Task Title',
            status: 'en cours'
        };
        
        const updateResponse = await axios.put(
            `http://localhost:5001/api/tasks/${taskResponse.data.task._id}`, 
            updateData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Task updated successfully!');
        console.log('Updated task:', updateResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testTaskCreationFixed();
