// Simple test to check authentication
console.log('=== Testing Authentication ===');

// Check if tokens exist
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');
const user = localStorage.getItem('user');

console.log('Access Token:', accessToken ? '✅ Present' : '❌ Missing');
console.log('Refresh Token:', refreshToken ? '✅ Present' : '❌ Missing');
console.log('User Data:', user ? '✅ Present' : '❌ Missing');

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('User Details:', userData);
  } catch (e) {
    console.log('User data is not valid JSON');
  }
}

// Test API call
if (accessToken) {
  console.log('\n=== Testing Team Members API ===');
  
  fetch('http://localhost:8000/api/auth/team-members/', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('API Response Data:', data);
    if (data.results) {
      console.log(`Found ${data.results.length} team members`);
      data.results.forEach(member => {
        console.log(`- ${member.user_name} (${member.employee_id})`);
      });
    }
  })
  .catch(error => {
    console.error('API Error:', error);
  });
} else {
  console.log('\n❌ No access token found. Please log in first.');
} 