const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/auth';

// Test user data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpass123'
};

// Test registration
async function testRegistration() {
    try {
        console.log('\nTesting Registration...');
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();
        console.log('Registration Response:', data);
        return data;
    } catch (error) {
        console.error('Registration Test Failed:', error);
    }
}

// Test login
async function testLogin() {
    try {
        console.log('\nTesting Login...');
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: testUser.username,
                password: testUser.password
            })
        });

        const data = await response.json();
        console.log('Login Response:', data);
        return data;
    } catch (error) {
        console.error('Login Test Failed:', error);
    }
}

// Test forgot password
async function testForgotPassword() {
    try {
        console.log('\nTesting Forgot Password...');
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: testUser.email
            })
        });

        const data = await response.json();
        console.log('Forgot Password Response:', data);
        return data;
    } catch (error) {
        console.error('Forgot Password Test Failed:', error);
    }
}

// Run all tests
async function runTests() {
    console.log('Starting Backend Tests...\n');

    // Test registration
    const registrationResult = await testRegistration();
    if (!registrationResult.success) {
        console.log('Registration test failed, skipping remaining tests');
        return;
    }

    // Test login
    const loginResult = await testLogin();
    if (!loginResult.success) {
        console.log('Login test failed, skipping remaining tests');
        return;
    }

    // Test forgot password
    await testForgotPassword();

    console.log('\nAll tests completed!');
}

// Run the tests
runTests(); 