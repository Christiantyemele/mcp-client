import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function startMcpServer(serverPath) {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting MCP server...');
    const serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Log server output for debugging
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data.toString().trim()}`);
    });

    // Give the server time to start
    setTimeout(() => {
      if (serverProcess.killed) {
        reject(new Error('Server process was killed'));
      } else {
        console.log('✅ MCP server started successfully');
        resolve(serverProcess);
      }
    }, 3000);

    serverProcess.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });
  });
}

async function connectToMcpServer(serverPath) {
  console.log('🔗 Connecting to MCP server...');

  try {
    // Set up the stdio transport - it will spawn the server process itself
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath]
    });

    // Create the MCP client
    const client = new Client({
      name: "mcp-anthropic-client",
      version: "1.0.0"
    });

    // Connect to the server
    await client.connect(transport);
    console.log('✅ Connected to MCP server successfully');

    return client;
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    console.error(`Error details:`, error);
    throw error;
  }
}

async function getAvailableTools(client) {
  console.log('🔍 Getting available tools from MCP server...');

  const result = await client.listTools();
  const tools = result.tools;
  console.log('\n📋 Available tools:');
  tools.forEach(tool => {
    console.log(`  - ${tool.name}: ${tool.description}`);
    if (tool.inputSchema && tool.inputSchema.properties) {
      console.log(`    Parameters: ${Object.keys(tool.inputSchema.properties).join(', ')}`);
    }
  });

  return tools;
}

async function executeToolWithParameters(client, toolName, parameters) {
  console.log(`🛠️  Executing tool: ${toolName} with parameters:`, parameters);

  try {
    const result = await client.callTool({
      name: toolName,
      arguments: parameters,
    });

    console.log(`✅ Tool execution result: ${result.content[0].text}`);
    return result.content[0].text;
  } catch (error) {
    console.error(`❌ Error executing tool: ${error.message}`);
    return `Error: ${error.message}`;
  }
}

async function queryAnthropicWithContext(toolResults, userQuery) {
  console.log('🤖 Sending query to Anthropic with MCP tool context...');

  // Prepare the context from tool results
  const toolContext = toolResults.map(result => 
    `Tool: ${result.toolName}\nParameters: ${JSON.stringify(result.parameters)}\nResult: ${result.result}`
  ).join('\n\n');

  const systemPrompt = `You are an AI assistant with access to various tools through the Model Context Protocol (MCP). 
You have executed the following tools and received these results:

${toolContext}

Use this information to provide helpful and accurate responses to the user's questions.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userQuery
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error(`❌ Error querying Anthropic: ${error.message}`);
    return `Error querying Anthropic: ${error.message}`;
  }
}

async function main() {
  console.log('🎯 Starting MCP Client with Anthropic Integration');
  console.log('=' .repeat(50));

  // Check for Anthropic API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required');
    console.error('Please set it with: export ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // Get the server path from command line arguments
  const serverPath = process.argv[2];
  const userQuery = process.argv[3] || "What can you tell me about the weather in New York and what's 15 + 25?";

  if (!serverPath) {
    console.error('Usage: node index.js <path_to_server_script> [user_query]');
    console.error('Example: node index.js example-server.js "What is the weather like in Paris?"');
    process.exit(1);
  }

  // Resolve the full path to the server
  const fullServerPath = resolve(__dirname, serverPath);
  console.log(`📁 Server path: ${fullServerPath}`);
  console.log(`❓ User query: "${userQuery}"`);
  console.log();

  let serverProcess;
  let client;

  try {
    // Step 1 & 2: Connect to the MCP server (it will start the server automatically)
    client = await connectToMcpServer(fullServerPath);

    // Step 3: Get available tools
    const tools = await getAvailableTools(client);

    // Step 4: Execute tools to gather context
    console.log('\n🔄 Executing tools to gather context...');
    const toolResults = [];

    // Execute weather tool if available
    // const weatherTool = tools.find(tool => tool.name === 'get-weather');
    // if (weatherTool) {
    //   const weatherResult = await executeToolWithParameters(client, 'get-weather', { location: 'New York' });
    //   toolResults.push({
    //     toolName: 'get-weather',
    //     parameters: { location: 'New York' },
    //     result: weatherResult
    //   });
    // }

    // Execute calculator tool if available
    const calcTool = tools.find(tool => tool.name === 'calculate');
    if (calcTool) {
      const calcResult = await executeToolWithParameters(client, 'calculate', { expression: '15 + 25' });
      toolResults.push({
        toolName: 'calculate',
        parameters: { expression: '15 + 25' },
        result: calcResult
      });
    }

    // Step 5: Query Anthropic with the gathered context
    console.log('\n' + '='.repeat(50));
    console.log('🤖 ANTHROPIC RESPONSE');
    console.log('='.repeat(50));

    const anthropicResponse = await queryAnthropicWithContext(toolResults, userQuery);
    console.log(anthropicResponse);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Process completed successfully!');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    // Cleanup
    if (client) {
      try {
        await client.close();
        console.log('🔌 Disconnected from MCP server');
      } catch (error) {
        console.error(`Error disconnecting: ${error.message}`);
      }
    }

    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
      console.log('🛑 MCP server process terminated');
    }
  }
}

main().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
