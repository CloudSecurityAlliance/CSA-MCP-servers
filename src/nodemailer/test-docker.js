import { spawn } from 'child_process';

async function testContainer() {
  return new Promise((resolve, reject) => {
    console.log('Starting container test...');
    
    // Start the container with stdin/stdout pipes
    const container = spawn('docker', [
      'run',
      '--rm',
      '-i',
      '-e', 'EMAIL_SERVICE=gmail',
      '-e', 'EMAIL_FROM=test@example.com',
      '-e', 'EMAIL_USERNAME=test@example.com',
      '-e', 'EMAIL_PASSWORD=test-password',
      '-e', 'EMAIL_ALLOW_LIST=example.com,@test.com',
      'cloudsecurityallianceorg/mcp-nodemailer'
    ]);

    // Handle container output
    container.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        console.log('\nReceived response:');
        console.log(JSON.stringify(response, null, 2));
        
        // Check for errors
        if (response.error) {
          console.error('Error in response:', response.error);
        }
      } catch (e) {
        console.log('Container output:', data.toString());
      }
    });

    container.stderr.on('data', (data) => {
      console.error('Container stderr:', data.toString());
    });

    // First send initialize request
    setTimeout(() => {
      const initializeRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: {
              supported: true
            },
            sampling: {
              supported: false
            },
            tools: {
              supported: true
            }
          },
          clientInfo: {
            name: 'mcp-nodemailer-test',
            version: '1.0.0'
          }
        }
      };

      console.log('\nSending initialize request:');
      console.log(JSON.stringify(initializeRequest, null, 2));
      container.stdin.write(JSON.stringify(initializeRequest) + '\n');
    }, 2000);

    // After initialization, list tools
    setTimeout(() => {
      const listToolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'ListTools',
        params: {}
      };

      console.log('\nSending ListTools request:');
      console.log(JSON.stringify(listToolsRequest, null, 2));
      container.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    }, 4000);

    // Finally try to send an email
    setTimeout(() => {
      const sendEmailRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'CallTool',
        params: {
          name: 'send_email',
          arguments: {
            to: 'test@example.com',
            subject: 'Test Email',
            message_content: 'This is a test email'
          }
        }
      };

      console.log('\nSending CallTool request:');
      console.log(JSON.stringify(sendEmailRequest, null, 2));
      container.stdin.write(JSON.stringify(sendEmailRequest) + '\n');
    }, 6000);

    // Set a timeout to end the test
    setTimeout(() => {
      console.log('\nTest completed, stopping container...');
      container.kill();
      resolve();
    }, 8000);

    container.on('error', (error) => {
      console.error('Container error:', error);
      reject(error);
    });

    container.on('exit', (code) => {
      console.log('Container exited with code:', code);
      if (code !== null && code !== 0 && code !== 143) { // 143 is normal termination by SIGTERM
        reject(new Error(`Container exited with code ${code}`));
      }
    });
  });
}

// Run the tests
console.log('Starting tests...');
testContainer()
  .then(() => {
    console.log('✅ Tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  });