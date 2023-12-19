/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 37.67891848940717, "KoPercent": 62.32108151059283};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.23578584544019585, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2129634200523276, 500, 1500, "Character by ID"], "isController": false}, {"data": [0.18745172868111398, 500, 1500, "All Characters"], "isController": false}, {"data": [0.24091457339136818, 500, 1500, "Create Character"], "isController": false}, {"data": [0.2593248896118987, 500, 1500, "Change Character"], "isController": false}, {"data": [0.3059670781893004, 500, 1500, "DELETE Character by ID"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 93129, 58039, 62.32108151059283, 18159.405598685535, 1, 243926, 14412.5, 28420.9, 35682.0, 243225.98, 185.32654876590257, 1137.52067460506, 12.691375257331652], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Character by ID", 20257, 12964, 63.99763044873377, 16971.499728489012, 1, 243756, 9953.0, 40041.8, 55968.05000000012, 103122.83000000099, 40.3898416268391, 69.09155007506924, 1.839900785610035], "isController": false}, {"data": ["All Characters", 22011, 14966, 67.99327608922812, 16331.142247058277, 2, 243507, 8548.5, 43217.50000000001, 56407.900000000045, 180347.84000000003, 43.80193905817174, 906.1313810976155, 1.7646344763906137], "isController": false}, {"data": ["Create Character", 19069, 12152, 63.72646704074676, 19386.969689024078, 1, 243926, 10628.0, 48676.0, 59573.0, 176667.39999999994, 38.087267759344556, 65.01967894389674, 3.0958743422511215], "isController": false}, {"data": ["Change Character", 17212, 10256, 59.58633511503602, 21453.33825238204, 1, 243910, 10920.0, 53013.0, 73277.0, 242490.0, 34.405008435343696, 55.68415492460662, 3.1260029619899816], "isController": false}, {"data": ["DELETE Character by ID", 14580, 7701, 52.818930041152264, 17075.84766803831, 1, 243886, 7209.0, 47041.5, 55691.799999999974, 167646.65000000002, 29.152362081134743, 42.417839651011434, 2.9076171105670316], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 191,264 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,441 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,437 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,614 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 190,365 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,557 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,290 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,395 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 189,073 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,415 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,286 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,369 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,343 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,339 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4373, 7.534588810971933, 4.695637234373826], "isController": false}, {"data": ["The operation lasted too long: It took 191,640 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,362 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,448 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,670 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,493 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 192,832 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,568 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,742 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,607 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,502 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,365 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,662 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,282 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,531 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 4, 0.00689191750374748, 0.004295117525153282], "isController": false}, {"data": ["The operation lasted too long: It took 191,418 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,366 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,471 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,370 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,524 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,335 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,501 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 180,511 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 190,722 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 49513, 85.30987784076224, 53.166038505728615], "isController": false}, {"data": ["The operation lasted too long: It took 191,387 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,610 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,256 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,318 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,449 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,534 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 3, 0.00516893812781061, 0.0032213381438649614], "isController": false}, {"data": ["The operation lasted too long: It took 191,519 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,357 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,252 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,280 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 187,757 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,506 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,289 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,431 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,346 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,412 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,254 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,562 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,602 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,419 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,592 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,325 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,515 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,351 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,618 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,271 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,266 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,250 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,428 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,536 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,667 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 185,982 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,752 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,348 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 3063, 5.277485828494633, 3.2889862448861256], "isController": false}, {"data": ["The operation lasted too long: It took 191,587 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,621 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,330 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,273 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,564 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 3, 0.00516893812781061, 0.0032213381438649614], "isController": false}, {"data": ["The operation lasted too long: It took 191,405 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,461 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,541 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 189,892 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,513 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,522 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,345 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,480 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 3, 0.00516893812781061, 0.0032213381438649614], "isController": false}, {"data": ["The operation lasted too long: It took 191,585 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,529 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,511 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,323 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,500 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,251 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,304 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,555 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,258 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,397 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,601 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,270 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,247 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,172 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,356 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,608 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,526 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,229 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,530 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 93, 0.1602370819621289, 0.09986148245981381], "isController": false}, {"data": ["The operation lasted too long: It took 191,577 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,337 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,232 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,338 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 181,847 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,393 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 3, 0.00516893812781061, 0.0032213381438649614], "isController": false}, {"data": ["The operation lasted too long: It took 191,312 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,342 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,417 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,599 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,604 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 3, 0.00516893812781061, 0.0032213381438649614], "isController": false}, {"data": ["The operation lasted too long: It took 191,473 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,284 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,308 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,341 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,237 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,333 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,584 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,466 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,528 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 190,954 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,077 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,305 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,248 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,539 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,436 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,464 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,641 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,613 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 2, 0.00344595875187374, 0.002147558762576641], "isController": false}, {"data": ["The operation lasted too long: It took 191,349 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,460 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,272 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,622 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,748 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,478 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,324 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,462 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,490 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,382 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,404 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Программа на вашем хост-компьютере разорвала установленное подключение", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,301 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["The operation lasted too long: It took 191,593 milliseconds, but should not have lasted longer than 180,000 milliseconds.", 1, 0.00172297937593687, 0.0010737793812883205], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 817, 1.4076741501404229, 0.8772777545125579], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 93129, 58039, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 49513, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4373, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 3063, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 817, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 93], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Character by ID", 20257, 12964, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 10662, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1044, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 925, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 291, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 10], "isController": false}, {"data": ["All Characters", 22011, 14966, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 13221, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 966, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 640, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 68, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 22], "isController": false}, {"data": ["Create Character", 19069, 12152, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 10095, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1026, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 606, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 395, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 16], "isController": false}, {"data": ["Change Character", 17212, 10256, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 8775, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 858, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 515, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 37, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 33], "isController": false}, {"data": ["DELETE Character by ID", 14580, 7701, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 6760, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 479, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 377, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 30, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 8], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
