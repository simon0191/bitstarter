#!/usr/bin/env node

var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlFileContent) {
    return cheerio.load(htmlFileContent);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlFileContent, checksfile) {
    $ = cheerioHtmlFile(htmlFileContent);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};
var getPageContent = function(url,checks) {
    rest.get(url).on('complete', function(result) { 
	doTheMagic(result,checks);
    });
}
var getFileContent = function(path) {
    if(path) {
	return fs.readFileSync(path).toString();
    }
    else {
	return false;
    }
}

var doTheMagic = function(fileContent,checks) {
    console.log(fileContent);
    var checkJson = checkHtmlFile(fileContent,checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json')
        .option('-f, --file <html_file>', 'Path to index.html')
        .option('-u, --url <html_file>', 'URL to de index.html')
        .parse(process.argv);

    var checks = program.checks || CHECKSFILE_DEFAULT;
    if(program.url) {
	getPageContent(program.url,checks);
    }
    else {	
	var fileContent =  getFileContent(program.file) ||  getFileContent(HTMLFILE_DEFAULT);
	doTheMagic(fileContent,checks);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
