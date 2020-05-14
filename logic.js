/*
*	Reads user provided CSV file
*/
function readCSVFile(e) {
	var file = e.target.files[0];

	if (!file) {
		return;
	}
	
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		// Pass data to start formatting
		displayContents(contents);
	};
	
	reader.readAsText(file);
}


function displayContents(contents) {
	var element = document.getElementById('file-content');
	// Split by content entry
	var text = contents.split('\n');
	
	// Creates 3D array to hold data extracted from CSV File
	// Stores each worker
	var workerData = new Array(3);
	for(var i = 0; i < 3; i++) {
		// Stores each application
		workerData[i] = new Array(3);
		for(var j = 0; j < 3; j++) {
			// Stores each day
			workerData[i][j] = [0];
		}
	}
	
	// Holds what the columns/rows of the table will be
	var tableInfo = new Array(2);
	// Columns
	tableInfo[0] = [];
	// Rows
	tableInfo[1] = ["Word", "Outlook", "Excel"];
	
	
	// Iterate over 3 workers
	for(var k = 0 ; k < 3; k++){
		// Holds index of previously examined data entry
		var previousApp = 0;
		// Tracks distance from start date
		var currentDay = 0;
		// Iterate over entire CSV file
		for(var i = 0; i < text.length; i++) {
			// Stores information from the current data entry being examined
			var newVals = text[i].split(',')
			var currentWorker = (" WORKER" + (k + 1));

			// If that data entry corresponds the worker currently being tallied
			if(newVals[1] == currentWorker)
			{
				var oldVals = text[previousApp].split(',');

				// Calculate time difference between old data entry and new data entry
				currentDay = calculateTimeDifference(currentDay, previousApp, oldVals, newVals, tableInfo, workerData, k);
				
				// update old entry to equal the new entry
				previousApp = i;
				
				//console.log(newVals[0])
				//console.log(newVals[1])
				//console.log(newVals[2])
				
				//console.log(" ");
				
			}
		}
		
	}
	
	
	console.log(tableInfo);
	console.log(workerData);
	
	populateTable(workerData, tableInfo);
	
}

function calculateTimeDifference(currentDay, previousApp, oldVals, newVals, tableInfo, workerData, k) {
	
	
	// Get Dates from old and new dates
	var oldTime = oldVals[0].split(" ");
	var newTime = newVals[0].split(" ");
	var date = oldTime;
	
	// Checks to see if the date has been recorded yet in tableInfo
	var addDate = true;
	for(var j = 0; j < tableInfo[0].length; j++) {
		if(tableInfo[0][j] == date[0]) {
			addDate = false;
		}
		
	}
	// If date is unique, add it to the list of columns of the table
	if(addDate) {
		tableInfo[0].push(date[0]);
	}

	
	var oldDay = oldTime[0][oldTime[0].length-1];
	var newDay = newTime[0][newTime[0].length-1];
	
	
	var oldTime = oldTime[1].split(":");
	var newTime = newTime[1].split(":");
	
	// Calculate time elapsed in minutes between the old and new time
	var minutesDiff = (parseInt(newTime[0]) - parseInt(oldTime[0])) * 60 + parseInt(newTime[1]) - parseInt(oldTime[1]) ;
	
	// If day has changed
	if(parseInt(oldDay) != parseInt(newDay)) {
		currentDay++;
		// Create new date entry
		workerData[k][0].push(0);
		workerData[k][1].push(0);
		workerData[k][2].push(0);
	}else{
		// Update number of minutes worked
		if(oldVals[2] == " WORD\r") {
			workerData[k][0][currentDay] += minutesDiff;
		} else if(oldVals[2] == " OUTLOOK\r") {
			workerData[k][1][currentDay] += minutesDiff;
		} else if(oldVals[2] == " EXCEL\r") {
			workerData[k][2][currentDay] += minutesDiff;
		}
		
	}
	return currentDay;
}


/*
*	Populates table with worker data
*/
function populateTable(workerData, tableInfo) {
	var table = document.getElementById("table")
	
	// Print top row of of dates
	row = table.insertRow(0);
	var cell = row.insertCell(0);
	cell.innerHTML = "Apps/Dates"
	for(var i = 0; i < tableInfo[0].length; i++) {
		cell = row.insertCell(i+1);
		cell.innerHTML = tableInfo[0][i];
	}
	
	// Print rest of rows
	// Iterate over applications
	for(var i = 0; i < workerData[0].length; i++) {
		var row = table.insertRow(i+1);
		cell = row.insertCell(0);
		cell.innerHTML = tableInfo[1][i];
		// Iterate over days
		for(var k = 0; k < workerData[0][i].length; k++) {
			var sum = 0;
			
			var cell1 = row.insertCell(k+1);
			// Iterate and sum over all workers
			for(var j = 0; j < workerData.length; j++) {
				console.log(workerData[j][i][k])
				sum += workerData[j][i][k];
			}

			// Take average of the workers data
			cell1.innerHTML = Math.trunc(sum / 3);
		}
	}
	
	drawChart(tableInfo);	
}


google.charts.load('current', {'packages':['bar']});

/*
*	Displays column chart on page
*/
function drawChart(tableInfo) {
	var data = google.visualization.arrayToDataTable([
	['Date', 'Word', 'Outlook', 'Excel'],
	[tableInfo[0][0], 122, 114, 80],
	[tableInfo[0][1], 111, 127, 80],
	[tableInfo[0][2], 106, 130, 80],
	[tableInfo[0][3], 98, 111, 84],
	[tableInfo[0][4], 99, 117, 87],
	]);
	
	var options = {
		chart: {
			title: 'Worker Time Allocation',
			subtitle: '(Minutes)',
		}
	};
	
	var chart = new google.charts.Bar(document.getElementById('columnchart_material'));
	
	chart.draw(data, google.charts.Bar.convertOptions(options));
}

document.getElementById('file-input').addEventListener('change', readCSVFile, false);