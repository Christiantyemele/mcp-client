# MCP Client with Anthropic Integration - Architecture Diagrams

This document provides visual representations of the interaction between the MCP client, server, and Anthropic's Claude API in the project codebase.

## Sequence Diagram

The following sequence diagram shows the step-by-step interaction flow between all components:

```mermaid
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
```

## Component Flow Diagram

This diagram illustrates the high-level workflow and responsibilities of each component:

```mermaid
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
```

## Key Components

### MCP Client
The client manages the overall workflow by:
1. Starting and connecting to the MCP server
2. Discovering available tools
3. Executing tools to gather context
4. Sending the context and user query to Anthropic
5. Displaying the response and cleaning up resources

### MCP Server
The server is responsible for:
1. Registering tools (get-weather, calculate)
2. Processing tool execution requests
3. Returning results to the client

### Anthropic API
The Anthropic service:
1. Receives the user query along with tool-generated context
2. Processes the information using the Claude model
3. Returns an intelligent response that incorporates the tool results

## Data Flow

1. **Tool Discovery**: Client retrieves available tools from the server
2. **Tool Execution**: Client sends tool requests to the server and receives results
3. **Context Building**: Tool results are formatted as context for the AI
4. **AI Integration**: Context and user query are sent to Anthropic for processing
5. **Response Handling**: AI response is received and displayed to the user

## Implementation Details

- The client uses the `@modelcontextprotocol/sdk` package to connect to the server
- Communication is handled via `StdioClientTransport`
- The server registers tools with descriptions and input schemas
- Tool results are formatted as structured context in the system prompt for Anthropic
- The Anthropic API is accessed using the `@anthropic-ai/sdk` package
