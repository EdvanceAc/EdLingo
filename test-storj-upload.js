const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const http = require('http');

async function testStorjUpload() {
    return new Promise((resolve, reject) => {
        console.log('Testing Storj upload endpoint...');
        
        // First check if server is running
         const healthReq = http.request({
             hostname: 'localhost',
             port: 8000,
             path: '/',
             method: 'GET'
         }, (res) => {
             console.log('✅ Server is running on port 8000');
            
            // Create a simple test file
            const testContent = 'This is a test file for Storj upload integration.';
            const testFilePath = path.join(__dirname, 'test-file.txt');
            fs.writeFileSync(testFilePath, testContent);
            
            // Create form data
            const form = new FormData();
            form.append('file', fs.createReadStream(testFilePath));
            form.append('folder', 'test');
            
            // Make request to upload endpoint
             const req = http.request({
                 hostname: 'localhost',
                 port: 8000,
                 path: '/upload',
                 method: 'POST',
                 headers: form.getHeaders()
            }, (uploadRes) => {
                let data = '';
                uploadRes.on('data', chunk => data += chunk);
                uploadRes.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (uploadRes.statusCode === 200) {
                            console.log('✅ Upload successful!');
                            console.log('Response:', JSON.stringify(result, null, 2));
                            if (result.length > 0 && result[0].location) {
                                console.log('📁 File uploaded to:', result[0].location);
                            }
                        } else {
                            console.log('❌ Upload failed:', result);
                        }
                    } catch (parseError) {
                        console.log('❌ Failed to parse response:', data);
                    }
                    
                    // Clean up test file
                    fs.unlinkSync(testFilePath);
                    resolve();
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ Upload request failed:', error.message);
                fs.unlinkSync(testFilePath);
                resolve();
            });
            
            form.pipe(req);
        });
        
        healthReq.on('error', (error) => {
             console.log('❌ Server is not running on port 8000');
             console.log('💡 Make sure to start the server with: node server.js');
            resolve();
        });
        
        healthReq.end();
    });
}

// Check if required dependencies are installed
try {
    require('form-data');
    require('node-fetch');
    testStorjUpload();
} catch (error) {
    console.log('❌ Missing dependencies. Please install:');
    console.log('npm install form-data node-fetch');
}