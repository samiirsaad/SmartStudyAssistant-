#!/usr/bin/env node

// Set the directory to be the frontend directory
process.chdir(__dirname);

// Load environment first
require('dotenv').config();

// Now start react-scripts
require('react-scripts/scripts/start');
