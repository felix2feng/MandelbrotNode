const complex = require('./complex');
const expect = require('expect');
const Queue = require('./queue');
const mandelbrot = require('./mandelbrot');

const createGrid = (n) => {
  if (n % 2 === 0) { throw new Error ('Needs to be odd')};

  let result = [];
  for (var i = 0; i < n; i++) {
    result.push([]);
    for (var j = 0; j < n; j++) {
      result[i].push(0);
    }
  }
  return result;
}

const createIndividualJob = (i, j, midPoint) => {
  const real = ((j - midPoint) / midPoint) * 2;
  const imaginary = ((i - midPoint) / midPoint) * 2;
  const complexNumber = mandelbrot.make_complex(real, imaginary);
  return { i: i, j: j, complex: complexNumber };
}

const createMandelbrotJobs = (displayDimension, numWorkers, partitionCase) => {
  const jobQueue = new Queue();
  const midPoint = Math.floor(displayDimension / 2);
  switch (partitionCase) {
    // Divide work into number of workers
    case 'courseGrainRowRegion':
      const rowsPerJob = Math.ceil(displayDimension / numWorkers);
      let currentRow = 0;
      for (var i = 0; i < numWorkers; i++) {
        var rowsWithJobs = [];
        // Go through number of Rows
        for (var j = 0; j < rowsPerJob; j++) {
          if (currentRow < displayDimension) {
            // Go through x axis
            for (var k = 0; k < displayDimension; k++) {
              rowsWithJobs.push(createIndividualJob(currentRow, k, midPoint));
            }
            currentRow++;
          }
        }
        jobQueue.addToQueue(rowsWithJobs);
      }
      return jobQueue  
      break;
    case 'dynamicRowRegion':
      // Go through number of Rows
      for (var j = 0; j < displayDimension; j++) {
        var rowWithJobs = [];
        // Go through x axis
        for (var k = 0; k < displayDimension; k++) {
          rowWithJobs.push(createIndividualJob(j, k, midPoint));
        }
        jobQueue.addToQueue(rowWithJobs);
      }
      return jobQueue      
      break;
    case 'squareRegion':
      // Currently what I have where each square is divided
      for (var i = 0; i < displayDimension; i++) {
        for (var j = 0; j < displayDimension; j++) {
          const real = ((j - midPoint) / midPoint) * 2;
          const imaginary = ((i - midPoint) / midPoint) * 2;
          const complexNumber = mandelbrot.make_complex(real, imaginary);
          jobQueue.addToQueue([createIndividualJob(i, j, midPoint)]);
        }
      }
      return jobQueue
      break;
    default:
      return [];
  }
}


module.exports = { createGrid, createMandelbrotJobs };

const _loopNest = (nestedArray) => {
  let count = 0;
  for (var i = 0; i < nestedArray.items.length; i++) {
    for (var j = 0; j < nestedArray.items[i].length; j++) {
      count++;
    }
  }
  return count;
}

// Expect Tests
const testWorker1 = 1;
const testWorker2 = 5;

const testDimension1 = 1;
const testDimension2 = 5;
// CourseGrain Test
const courseGrain = 'courseGrainRowRegion';
expect(createMandelbrotJobs(testDimension1, testWorker1, courseGrain).checkLength()).toEqual(1);
expect(_loopNest(createMandelbrotJobs(testDimension1, testWorker1, courseGrain))).toEqual(1);
expect(createMandelbrotJobs(testDimension2, testWorker2, courseGrain).checkLength()).toEqual(5);
expect(_loopNest(createMandelbrotJobs(testDimension2, testWorker2, courseGrain))).toEqual(25);

// Dynamic Row Test
const dynamicRow = 'dynamicRowRegion';
expect(createMandelbrotJobs(testDimension1, testWorker1, dynamicRow).checkLength()).toEqual(1);
expect(_loopNest(createMandelbrotJobs(testDimension1, testWorker1, dynamicRow))).toEqual(1);
expect(createMandelbrotJobs(testDimension2, testWorker2, dynamicRow).checkLength()).toEqual(5);
expect(_loopNest(createMandelbrotJobs(testDimension2, testWorker2, dynamicRow))).toEqual(25);

// SquareRegion Test
const squareRegion = 'squareRegion';
expect(createMandelbrotJobs(testDimension1, testWorker1, squareRegion).checkLength()).toEqual(1);
expect(_loopNest(createMandelbrotJobs(testDimension1, testWorker1, squareRegion))).toEqual(1);
expect(createMandelbrotJobs(testDimension2, testWorker2, squareRegion).checkLength()).toEqual(25);
expect(_loopNest(createMandelbrotJobs(testDimension2, testWorker2, squareRegion))).toEqual(25);

console.log('All tests pass');