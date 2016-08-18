const cluster = require('cluster');
const numCores = require('os').cpus().length

const Queue = require('./lib/queue');
const helper = require('./lib/helper');
const mandelbrot = require('./lib/mandelbrot');

// INPUT FIELDS
const displayDimension = 1001;
const partitionScheme = 'dynamicRowRegion'; // Types are squareRegion, courseGrainRowRegion, dynamicRowRegion
const numWorkers = numCores; // My Computer has 4 cores

const mandelbrotJobs = helper.createMandelbrotJobs(displayDimension, numWorkers, partitionScheme);
const grid = helper.createGrid(displayDimension);

if (cluster.isMaster) {
  let startTime = new Date().getTime();
  const workers = [];
  for (var i = 0; i < numWorkers; i++) {
    var worker = cluster.fork();   
    worker.on('message', message => {
      switch (message.type) {
        case 'work':
          if (mandelbrotJobs.checkLength()) {
            const jobToSend = mandelbrotJobs.takeNext();
            // Pull item off queue and send
            worker.send({
              from: 'master',
              job: jobToSend });
          } else {
            worker.send({
              from: 'master',
              job: [] });
          };
          break;           
        case 'result':
          const i = message.i; // Assuming data exists at this point
          const j = message.j;
          const n = message.n;
          grid[i][j] = n;
          if (!mandelbrotJobs.checkLength()) {
            let endTime = new Date().getTime();
            console.log(grid);
            console.log('Total time', endTime - startTime);
          }    
      }
    });
    workers.push(worker);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });
  
} else {
  process.on('message', (message) => {
    const jobArray = message.job;
    if (jobArray.length) {
      for (var k = 0; k < jobArray.length; k++) {
        const i = jobArray[k].i;
        const j = jobArray[k].j;
        var complex = jobArray[k].complex;
        var iterated = mandelbrot.iterate(complex, 0, 0).n;
        // Do the work and respond with the results
        process.send({
          type: 'result',
          i: i,
          j: j,
          n: iterated,
        });
      }
      // Upon comletion of all jobs, ask for more work
      process.send({
        type: 'work'
      });

    } else {
      // Shut Down
      process.exit();
    }
  });

  // Worker Processes have a HTTP Server
  var app = require('express')();
  app.all('/*', function(req, res) {res.send('process ' + process.pid + ' says hello!').end();})
  
  // Send request for piece of work
  process.send({
    type: 'work'
  });
  var server = app.listen(8000, function() {
    console.log('Process ' + process.pid + ' is listening to all incoming requests');
  });
}