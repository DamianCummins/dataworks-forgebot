'use strict';

var path = require('path');
var request = require('request');
var Async = require('async');
var ProgressBar = require('progress');
var sqlite3 = require('sqlite3').verbose();

var outputFile = process.argv[2] || path.resolve(__dirname, 'forgebot.db');
var db = new sqlite3.Database(outputFile);

// Prepares the database connection in serialized mode
db.serialize();
// Creates the database structure
db.run('CREATE TABLE IF NOT EXISTS info (name TEXT PRIMARY KEY, val TEXT DEFAULT NULL)');

process.exit(1);