import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const getServer = () => {
  const mcpServer = new McpServer({
    name: 'example-server',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  // Add a simple weather tool
  mcpServer.registerTool('get-weather', {
    description: 'Get the current weather for a location',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The location to get weather for',
        },
      },
      required: ['location'],
    },
  }, async ({ location }) => {
    // In a real implementation, you would call a weather API here
    return {
      content: [
        {
          type: 'text',
          text: `It's currently sunny and 72°F in ${location}`
        }
      ]
    };
  });

  // Add a simple calculator tool
  mcpServer.registerTool('calculate', {
    description: 'Perform a simple calculation',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate',
        },
      },
      required: ['expression'],
    },
  }, async ({ expression }) => {
    try {
      // Note: eval is used for simplicity; in production code, use a safe evaluator
      const result = eval(expression);
      return {
        content: [
          {
            type: 'text',
            text: `The result of ${expression} is ${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error evaluating expression: ${error.message}`
          }
        ]
      };
    }
  });

  return mcpServer;
};

async function main() {
  const server = getServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.log('MCP Server started with stdio transport');
}

main().catch(error => {
  console.error(`Error starting server: ${error.message}`);
  process.exit(1);
});
