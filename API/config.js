// api/config.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Find the config.json file in the project root
  const configPath = path.join(process.cwd(), 'config.json');
  
  try {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Send data to frontend (Success)
    res.status(200).json(data);
  } catch (error) {
    // Send error if file not found
    res.status(500).json({ error: 'Failed to load config' });
  }
}
