import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const getServer = () => {
  const mcpServer = new McpServer({
    name: 'example-server',
    version: '1.0.0'
  }, {
    capabilities: {
      resources: true
    }
  });

  // Add a simple weather tool
  mcpServer.registerTool('get-weather', {
    description: 'Get the current weather for a location',
    inputSchema: {
      location: z.string().describe('The location to get weather for'),
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
      expression: z.string().describe('The mathematical expression to evaluate'),
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

  // Add a simple notes resource
  const notesDb = {};

  mcpServer.registerResource('notes', {
    description: 'Simple notes storage',
    schema: z.object({
      id: z.string().describe('Note ID'),
      title: z.string().describe('Note title'),
      content: z.string().describe('Note content'),
      timestamp: z.number().describe('Creation timestamp')
    }),
    async list() {
      return Object.values(notesDb);
    },
    async get(id) {
      const note = notesDb[id];
      if (!note) {
        throw new Error(`Note with ID ${id} not found`);
      }
      return note;
    },
    async create(data) {
      const id = String(Date.now());
      const timestamp = Date.now();
      const newNote = { id, timestamp, ...data };
      notesDb[id] = newNote;
      return newNote;
    },
    async update(id, data) {
      const note = notesDb[id];
      if (!note) {
        throw new Error(`Note with ID ${id} not found`);
      }
      const updatedNote = { ...note, ...data };
      notesDb[id] = updatedNote;
      return updatedNote;
    },
    async delete(id) {
      const note = notesDb[id];
      if (!note) {
        throw new Error(`Note with ID ${id} not found`);
      }
      delete notesDb[id];
      return note;
    }
  });

  // Add a tool that uses the notes resource
  mcpServer.registerTool('take-note', {
    description: 'Create a new note',
    inputSchema: z.object({
      title: z.string().describe('Note title'),
      content: z.string().describe('Note content')
    }),
  }, async ({ title, content }, { resources }) => {
    // Create a new note using the resource
    const newNote = await resources.notes.create({ title, content });

    return {
      content: [
        {
          type: 'text',
          text: `Note created successfully with ID: ${newNote.id}`
        }
      ]
    };
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
