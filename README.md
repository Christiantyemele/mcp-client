# MCP Client with Anthropic Integration

This is an advanced implementation of a Model Context Protocol (MCP) client in Node.js that integrates with Anthropic's Claude API to provide intelligent responses using MCP tools as context.

## Features

- 🔗 Connects to MCP servers via HTTP transport
- 🛠️ Discovers and executes available MCP tools
- 🤖 Integrates with Anthropic's Claude API
- 📊 Uses MCP tool results as context for AI responses
- 📈 Visualized architecture with interactive diagrams
- 🎯 Provides detailed step-by-step execution logging
- 🧹 Proper cleanup and error handling

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up your Anthropic API key:

```bash
export ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Or modify the code to include your API key directly (not recommended for production).

3. Run the client with a path to an MCP server and optional user query:

```bash
node index.js example-server.js "What is the weather like in New York and what's 25 + 15?"
```

## Usage Examples

### Basic Usage
```bash
node index.js example-server.js
```

### With Custom Query
```bash
node index.js example-server.js "Can you help me with weather information and calculations?"
```

### Using the Example Server
```bash
node index.js example-server.js "What's the weather in Paris and calculate 100 * 5?"
```

## How It Works - Step by Step

This enhanced MCP client performs the following workflow:

### Step 1: MCP Server Startup
- 🚀 Starts the specified MCP server process
- ⏱️ Waits for server initialization (2 seconds)
- ✅ Confirms server is running

### Step 2: MCP Connection
- 🔗 Establishes HTTP transport connection to localhost:3000
- 🤝 Initializes MCP client and connects to server
- ✅ Confirms successful connection

### Step 3: Tool Discovery
- 🔍 Retrieves list of available tools from MCP server
- 📋 Displays tool names, descriptions, and parameters
- 📝 Logs tool capabilities for user reference

### Step 4: Tool Execution
- 🛠️ Executes relevant MCP tools to gather context
- 🌤️ Calls weather tool with location parameter
- 🧮 Calls calculator tool with mathematical expression
- 📊 Collects and stores tool execution results

### Step 5: Anthropic Integration
- 🤖 Sends user query to Anthropic's Claude API
- 📋 Includes MCP tool results as system context
- 🎯 Receives intelligent response based on tool data
- 💬 Displays formatted AI response

### Step 6: Cleanup
- 🔌 Disconnects from MCP server
- 🛑 Terminates server process
- 🧹 Ensures proper resource cleanup

## Example Output

```
🎯 Starting MCP Client with Anthropic Integration
==================================================
📁 Server path: /path/to/example-server.js
❓ User query: "What can you tell me about the weather in New York and what's 15 + 25?"

🚀 Starting MCP server...
✅ MCP server started successfully
🔗 Connecting to MCP server...
✅ Connected to MCP server successfully
🔍 Getting available tools from MCP server...

📋 Available tools:
  - get-weather: Get the current weather for a location
    Parameters: location
  - calculate: Perform a simple calculation
    Parameters: expression

🔄 Executing tools to gather context...
🛠️  Executing tool: get-weather with parameters: { location: 'New York' }
✅ Tool execution result: It's currently sunny and 72°F in New York
🛠️  Executing tool: calculate with parameters: { expression: '15 + 25' }
✅ Tool execution result: The result of 15 + 25 is 40

==================================================
🤖 ANTHROPIC RESPONSE
==================================================
Based on the information I gathered using the available tools:

**Weather in New York:** It's currently sunny and 72°F in New York - perfect weather for outdoor activities!

**Calculation:** 15 + 25 equals 40.

So to answer your question: New York is enjoying beautiful sunny weather at a comfortable 72 degrees Fahrenheit, and the sum of 15 and 25 is 40.

==================================================
✅ Process completed successfully!
🔌 Disconnected from MCP server
🛑 MCP server process terminated
```

## Architecture

The client implements a clean separation of concerns:

- **MCP Integration**: Handles server connection and tool execution
- **Anthropic Integration**: Manages AI API calls with context
- **Process Management**: Handles server lifecycle and cleanup
- **Error Handling**: Comprehensive error management throughout

## MCP Protocol

The Model Context Protocol allows applications to provide context for LLMs in a standardized way. This implementation demonstrates how MCP tools can be used to gather real-time information and provide it as context to AI models, enabling more accurate and contextual responses.

## Architecture Diagram

To visualize the interaction between the MCP client, server, and Anthropic API, we've provided interactive diagrams:

![MCP Architecture Diagram](docs/mcp-diagram.png)

For a more detailed view, check the markdown diagrams in `docs/architecture-diagram.md` or generate an interactive HTML diagram:

```bash
node docs/architecture-diagram.js
# Then open the generated mcp-interaction-diagram.html in your browser
```

## Requirements

- Node.js 18+
- Anthropic API key
- MCP server implementation
