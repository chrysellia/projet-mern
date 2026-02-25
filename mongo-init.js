// MongoDB initialization script
db = db.getSiblingDB('task-management');

// Create application user
db.createUser({
  user: 'taskapp',
  pwd: 'taskapp123',
  roles: [
    {
      role: 'readWrite',
      db: 'task-management'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('tasks');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "deadline": 1 });
db.tasks.createIndex({ "createdBy": 1 });
db.tasks.createIndex({ "createdAt": -1 });

// Insert initial admin user (optional)
db.users.insertOne({
  username: 'admin',
  email: 'admin@taskmanagement.com',
  password: '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQ', // password: admin123
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully');
