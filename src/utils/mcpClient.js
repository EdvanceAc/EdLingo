// MCP Client Utility for EdLingo
// Handles communication with MCP servers, particularly PostgREST for database operations

/**
 * Run MCP server tool
 * @param {string} serverName - Name of the MCP server
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Arguments for the tool
 * @returns {Promise<any>} Tool execution result
 */
export async function run_mcp(serverName, toolName, args) {
  try {
    // For PostgREST operations, we'll use direct HTTP requests
    if (serverName === 'mcp.config.usrlocalmcp.Postgrest') {
      return await handlePostgrestRequest(toolName, args);
    }
    
    // For other MCP servers, implement as needed
    throw new Error(`MCP server ${serverName} not implemented`);
    
  } catch (error) {
    console.error(`MCP call failed: ${serverName}.${toolName}`, error);
    throw error;
  }
}

/**
 * Handle PostgREST API requests
 * @param {string} toolName - Tool name (postgrestRequest or sqlToRest)
 * @param {Object} args - Request arguments
 * @returns {Promise<any>} API response
 */
async function handlePostgrestRequest(toolName, args) {
  const baseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:3000';
  const apiKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  if (toolName === 'postgrestRequest') {
    const { method, path, body } = args;
    
    const url = `${baseUrl}/rest/v1${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Add prefer header for POST operations
    if (method === 'POST') {
      headers['Prefer'] = 'return=representation';
    }
    
    const requestOptions = {
      method,
      headers
    };
    
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PostgREST request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    }
    
    return await response.text();
  }
  
  if (toolName === 'sqlToRest') {
    // Convert SQL to REST API call
    const { sql } = args;
    return convertSqlToRest(sql);
  }
  
  throw new Error(`Unknown PostgREST tool: ${toolName}`);
}

/**
 * Convert SQL query to PostgREST API request
 * @param {string} sql - SQL query
 * @returns {Object} REST API request details
 */
function convertSqlToRest(sql) {
  // Basic SQL to REST conversion
  // This is a simplified implementation - in production, you'd want a more robust parser
  
  const sqlLower = sql.toLowerCase().trim();
  
  if (sqlLower.startsWith('select')) {
    return parseSelectQuery(sql);
  }
  
  if (sqlLower.startsWith('insert')) {
    return parseInsertQuery(sql);
  }
  
  if (sqlLower.startsWith('update')) {
    return parseUpdateQuery(sql);
  }
  
  if (sqlLower.startsWith('delete')) {
    return parseDeleteQuery(sql);
  }
  
  throw new Error('Unsupported SQL query type');
}

/**
 * Parse SELECT query to REST API call
 * @param {string} sql - SELECT SQL query
 * @returns {Object} REST API request
 */
function parseSelectQuery(sql) {
  // Extract table name
  const fromMatch = sql.match(/from\s+(\w+)/i);
  if (!fromMatch) {
    throw new Error('Could not parse table name from SELECT query');
  }
  
  const tableName = fromMatch[1];
  let path = `/${tableName}`;
  
  // Extract WHERE conditions
  const whereMatch = sql.match(/where\s+(.+?)(?:\s+order\s+by|\s+limit|\s+group\s+by|$)/i);
  if (whereMatch) {
    const whereClause = whereMatch[1].trim();
    const conditions = parseWhereClause(whereClause);
    if (conditions.length > 0) {
      path += '?' + conditions.join('&');
    }
  }
  
  // Extract ORDER BY
  const orderMatch = sql.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/i);
  if (orderMatch) {
    const column = orderMatch[1];
    const direction = orderMatch[2] || 'asc';
    const separator = path.includes('?') ? '&' : '?';
    path += `${separator}order=${column}.${direction}`;
  }
  
  // Extract LIMIT
  const limitMatch = sql.match(/limit\s+(\d+)/i);
  if (limitMatch) {
    const limit = limitMatch[1];
    const separator = path.includes('?') ? '&' : '?';
    path += `${separator}limit=${limit}`;
  }
  
  return {
    method: 'GET',
    path
  };
}

/**
 * Parse INSERT query to REST API call
 * @param {string} sql - INSERT SQL query
 * @returns {Object} REST API request
 */
function parseInsertQuery(sql) {
  // Extract table name
  const intoMatch = sql.match(/insert\s+into\s+(\w+)/i);
  if (!intoMatch) {
    throw new Error('Could not parse table name from INSERT query');
  }
  
  const tableName = intoMatch[1];
  
  // Extract columns and values
  const valuesMatch = sql.match(/\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
  if (!valuesMatch) {
    throw new Error('Could not parse INSERT values');
  }
  
  const columns = valuesMatch[1].split(',').map(col => col.trim().replace(/["'`]/g, ''));
  const values = valuesMatch[2].split(',').map(val => {
    val = val.trim();
    // Remove quotes and try to parse as number or boolean
    if (val.startsWith("'") || val.startsWith('"')) {
      return val.slice(1, -1);
    }
    if (val === 'true' || val === 'false') {
      return val === 'true';
    }
    if (!isNaN(val)) {
      return Number(val);
    }
    return val;
  });
  
  const body = {};
  columns.forEach((col, index) => {
    body[col] = values[index];
  });
  
  return {
    method: 'POST',
    path: `/${tableName}`,
    body
  };
}

/**
 * Parse UPDATE query to REST API call
 * @param {string} sql - UPDATE SQL query
 * @returns {Object} REST API request
 */
function parseUpdateQuery(sql) {
  // Extract table name
  const tableMatch = sql.match(/update\s+(\w+)/i);
  if (!tableMatch) {
    throw new Error('Could not parse table name from UPDATE query');
  }
  
  const tableName = tableMatch[1];
  
  // Extract SET clause
  const setMatch = sql.match(/set\s+(.+?)\s+where/i);
  if (!setMatch) {
    throw new Error('Could not parse SET clause from UPDATE query');
  }
  
  const setClause = setMatch[1];
  const body = parseSetClause(setClause);
  
  // Extract WHERE conditions
  const whereMatch = sql.match(/where\s+(.+)$/i);
  let path = `/${tableName}`;
  if (whereMatch) {
    const whereClause = whereMatch[1].trim();
    const conditions = parseWhereClause(whereClause);
    if (conditions.length > 0) {
      path += '?' + conditions.join('&');
    }
  }
  
  return {
    method: 'PATCH',
    path,
    body
  };
}

/**
 * Parse DELETE query to REST API call
 * @param {string} sql - DELETE SQL query
 * @returns {Object} REST API request
 */
function parseDeleteQuery(sql) {
  // Extract table name
  const fromMatch = sql.match(/delete\s+from\s+(\w+)/i);
  if (!fromMatch) {
    throw new Error('Could not parse table name from DELETE query');
  }
  
  const tableName = fromMatch[1];
  
  // Extract WHERE conditions
  const whereMatch = sql.match(/where\s+(.+)$/i);
  let path = `/${tableName}`;
  if (whereMatch) {
    const whereClause = whereMatch[1].trim();
    const conditions = parseWhereClause(whereClause);
    if (conditions.length > 0) {
      path += '?' + conditions.join('&');
    }
  }
  
  return {
    method: 'DELETE',
    path
  };
}

/**
 * Parse WHERE clause to PostgREST query parameters
 * @param {string} whereClause - WHERE clause
 * @returns {Array} Query parameters
 */
function parseWhereClause(whereClause) {
  const conditions = [];
  
  // Split by AND (simple implementation)
  const parts = whereClause.split(/\s+and\s+/i);
  
  parts.forEach(part => {
    part = part.trim();
    
    // Handle different operators
    if (part.includes('=')) {
      const [column, value] = part.split('=').map(s => s.trim());
      const cleanValue = value.replace(/["']/g, '');
      conditions.push(`${column}=eq.${cleanValue}`);
    } else if (part.includes('!=') || part.includes('<>')) {
      const [column, value] = part.split(/!=|<>/).map(s => s.trim());
      const cleanValue = value.replace(/["']/g, '');
      conditions.push(`${column}=neq.${cleanValue}`);
    } else if (part.includes('>=')) {
      const [column, value] = part.split('>=').map(s => s.trim());
      const cleanValue = value.replace(/["']/g, '');
      conditions.push(`${column}=gte.${cleanValue}`);
    } else if (part.includes('<=')) {
      const [column, value] = part.split('<=').map(s => s.trim());
      const cleanValue = value.replace(/["']/g, '');
      conditions.push(`${column}=lte.${cleanValue}`);
    } else if (part.includes('>')) {
      const [column, value] = part.split('>').map(s => s.trim());
      const cleanValue = value.replace(/["']/g, '');
      conditions.push(`${column}=gt.${cleanValue}`);
    } else if (part.includes('<')) {
      const [column, value] = part.split('<').map(s => s.trim());
      const cleanValue = value.replace(/["']/g, '');
      conditions.push(`${column}=lt.${cleanValue}`);
    } else if (part.includes(' LIKE ')) {
      const [column, value] = part.split(/\s+like\s+/i).map(s => s.trim());
      const cleanValue = value.replace(/["'%]/g, '');
      conditions.push(`${column}=like.*${cleanValue}*`);
    } else if (part.includes(' IN ')) {
      const [column, valueList] = part.split(/\s+in\s+/i).map(s => s.trim());
      const values = valueList.replace(/[()"']/g, '').split(',').map(v => v.trim());
      conditions.push(`${column}=in.(${values.join(',')})`);
    }
  });
  
  return conditions;
}

/**
 * Parse SET clause to update object
 * @param {string} setClause - SET clause
 * @returns {Object} Update object
 */
function parseSetClause(setClause) {
  const updates = {};
  
  const assignments = setClause.split(',');
  assignments.forEach(assignment => {
    const [column, value] = assignment.split('=').map(s => s.trim());
    let cleanValue = value.replace(/["']/g, '');
    
    // Try to parse as number or boolean
    if (cleanValue === 'true' || cleanValue === 'false') {
      cleanValue = cleanValue === 'true';
    } else if (!isNaN(cleanValue)) {
      cleanValue = Number(cleanValue);
    }
    
    updates[column] = cleanValue;
  });
  
  return updates;
}

/**
 * Get authentication token for API requests
 * @returns {string|null} Auth token
 */
function getAuthToken() {
  // Get token from localStorage or context
  const token = localStorage.getItem('supabase.auth.token');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      return parsed.access_token;
    } catch (error) {
      console.error('Failed to parse auth token:', error);
    }
  }
  return null;
}

/**
 * Set authentication token for API requests
 * @param {string} token - Auth token
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('supabase.auth.token', JSON.stringify({ access_token: token }));
  } else {
    localStorage.removeItem('supabase.auth.token');
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
  localStorage.removeItem('supabase.auth.token');
}

export default {
  run_mcp,
  setAuthToken,
  clearAuthToken
};