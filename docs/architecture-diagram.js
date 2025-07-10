// This file generates an HTML page with a mermaid diagram showing the interaction flow
// Run with: node docs/architecture-diagram.js
// Then open the generated HTML file in your browser

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { dirname } = path;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCP Client-Server-Anthropic Interaction Diagram</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      text-align: center;
      margin-bottom: 40px;
    }
    .mermaid {
      margin: 40px 0;
    }
    .description {
      background-color: #f8f9fa;
      border-left: 4px solid #4285f4;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .legend {
      margin-top: 30px;
      padding: 15px;
      background-color: #f0f4f8;
      border-radius: 4px;
    }
    .legend h3 {
      margin-top: 0;
      color: #2c3e50;
    }
    .legend ul {
      list-style-type: none;
      padding-left: 10px;
    }
    .legend li {
      margin-bottom: 8px;
    }
    .legend li strong {
      display: inline-block;
      width: 120px;
    }
    .note {
      font-size: 0.9em;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>MCP Client with Anthropic Integration</h1>

  <div class="description">
    <p>This diagram illustrates the interaction flow between the MCP Client, MCP Server, and Anthropic's Claude API. 
    It shows how tools are discovered, executed, and how their results are used as context for AI responses.</p>
  </div>

  <div class="mermaid">
    sequenceDiagram
      autonumber
      participant User
      participant Client as MCP Client
      participant Server as MCP Server
      participant Anthropic as Anthropic API

      User->>Client: Start with server path & query
      Client->>Server: Start server process
      Server-->>Client: Server started

      Client->>Server: Connect via StdioClientTransport
      Server-->>Client: Connection established

      Client->>Server: List available tools
      Server-->>Client: Return tools (get-weather, calculate)

      Note over Client,Server: Tool Execution Phase

      Client->>Server: Execute get-weather tool
      Server->>Server: Process weather request
      Server-->>Client: Return weather data

      Client->>Server: Execute calculate tool
      Server->>Server: Evaluate expression
      Server-->>Client: Return calculation result

      Note over Client,Anthropic: Anthropic Integration Phase

      Client->>Client: Prepare tool results as context
      Client->>Anthropic: Send query with tool context
      Anthropic->>Anthropic: Process query with context
      Anthropic-->>Client: Return intelligent response

      Client->>User: Display formatted response

      Note over Client,Server: Cleanup Phase

      Client->>Server: Disconnect
      Client->>Server: Terminate server process
  </div>

  <div class="mermaid">
    flowchart TB
      subgraph "MCP Client"
        A["Start Client"] --> B["Connect to Server"]
        B --> C["Discover Tools"]
        C --> D["Execute Tools"]
        D --> E["Gather Context"]
        E --> F["Query Anthropic"]
        F --> G["Display Response"]
        G --> H["Cleanup Resources"]
      end

      subgraph "MCP Server"
        S1["Initialize Server"] --> S2["Register Tools"]
        S2 --> S3["Handle Tool Requests"]
        S3 --> S4["Return Results"]
      end

      subgraph "Anthropic API"
        AI1["Receive Query + Context"] --> AI2["Process with Claude"]
        AI2 --> AI3["Generate Response"]
      end

      B -.-> S1
      C -.-> S2
      D -.-> S3
      E -.-> S4
      F -.-> AI1
      AI3 -.-> G
  </div>

  <div class="legend">
    <h3>Component Responsibilities</h3>
    <ul>
      <li><strong>MCP Client:</strong> Manages the overall workflow, connects to the server, executes tools, and integrates with Anthropic.</li>
      <li><strong>MCP Server:</strong> Provides tool definitions and handles tool execution requests.</li>
      <li><strong>Anthropic API:</strong> Processes user queries with the context provided by tool results.</li>
    </ul>
  </div>

  <div class="legend">
    <h3>Data Flow</h3>
    <ul>
      <li><strong>Tool Discovery:</strong> Client retrieves available tools from the server.</li>
      <li><strong>Tool Execution:</strong> Client sends tool requests to server and receives results.</li>
      <li><strong>Context Building:</strong> Tool results are formatted as context for the AI.</li>
      <li><strong>AI Integration:</strong> Context and user query are sent to Anthropic for processing.</li>
      <li><strong>Response Handling:</strong> AI response is received and displayed to the user.</li>
    </ul>
  </div>

  <p class="note">Note: This diagram represents the interaction flow in the MCP Client with Anthropic Integration project. The actual implementation may have additional details not shown here.</p>

  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
</body>
</html>`;

const outputPath = path.join(__dirname, '../mcp-interaction-diagram.html');

fs.writeFileSync(outputPath, html);

console.log(`Diagram HTML generated at: ${outputPath}`);
console.log('Open this file in your browser to view the diagram.');
