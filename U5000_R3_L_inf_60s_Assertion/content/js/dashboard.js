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

    var data = {"OkPercent": 57.734896838355354, "KoPercent": 42.265103161644646};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.19438919400326554, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16338452273411622, 500, 1500, "Character by ID"], "isController": false}, {"data": [0.12796486909823226, 500, 1500, "All Characters"], "isController": false}, {"data": [0.21084384244122684, 500, 1500, "Create Character"], "isController": false}, {"data": [0.2584808259587021, 500, 1500, "Change Character"], "isController": false}, {"data": [0.28091353996737356, 500, 1500, "DELETE Character by ID"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 67370, 28474, 42.265103161644646, 25143.716966008633, 2, 163000, 48968.0, 150887.0, 154811.95, 156978.97, 260.0606048908533, 1430.2377609544787, 26.80405177592596], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Character by ID", 16605, 8337, 50.20776874435411, 22521.692381812645, 5, 148951, 5326.0, 61776.59999999993, 76442.89999999998, 101899.4, 64.47667307356282, 90.10093212451704, 4.044398698235191], "isController": false}, {"data": ["All Characters", 17876, 9203, 51.482434549116135, 42312.43740210329, 8, 163000, 5475.5, 152167.90000000002, 155004.15, 157143.44999999998, 69.0051842673121, 1213.0046671795926, 4.18495443017452], "isController": false}, {"data": ["Create Character", 12846, 4920, 38.29985987856142, 19411.401292231043, 4, 155101, 3379.0, 54576.3, 75679.29999999997, 102095.36000000002, 49.99708097378715, 56.290258236518966, 6.898685161130247], "isController": false}, {"data": ["Change Character", 10848, 3536, 32.59587020648968, 16909.373801622416, 2, 150431, 2687.0, 51714.500000000015, 74066.2, 102857.12, 42.24858431412259, 41.85792280227911, 6.368456590825888], "isController": false}, {"data": ["DELETE Character by ID", 9195, 2478, 26.949429037520392, 14224.103425774882, 6, 149660, 2322.0, 47564.2, 67797.19999999984, 101886.43999999999, 35.88600777432599, 30.687405967536723, 5.504112029862076], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 7777, 27.31263608906371, 11.543713819207362], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 114, 0.40036524548711105, 0.16921478402849932], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Программа на вашем хост-компьютере разорвала установленное подключение", 7, 0.02458383086324366, 0.01039038147543417], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 14355, 50.41441314883754, 21.30770372569393], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2713, 9.527990447425722, 4.027014991836129], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 3506, 12.312987286647468, 5.204096778981743], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: No buffer space available (maximum connections reached?): connect", 2, 0.007023951675212474, 0.0029686804215526197], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 67370, 28474, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 14355, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 7777, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 3506, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2713, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 114], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Character by ID", 16605, 8337, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 4844, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2425, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 975, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 55, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 36], "isController": false}, {"data": ["All Characters", 17876, 9203, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3495, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 3282, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2110, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 303, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 7], "isController": false}, {"data": ["Create Character", 12846, 4920, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 2692, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1611, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 519, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 74, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 24], "isController": false}, {"data": ["Change Character", 10848, 3536, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1925, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 993, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 518, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 83, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 16], "isController": false}, {"data": ["DELETE Character by ID", 9195, 2478, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1399, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 638, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 398, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 31, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
