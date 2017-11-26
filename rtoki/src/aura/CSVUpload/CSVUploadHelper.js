({
    
    CSVToArray : function(strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"), "\"");
            } else {
                // We found a non-quoted value.
                var strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        // Return the parsed data.
        return (arrData);
    },
    
    CSV2JSON : function(csv) {
        var array = this.CSVToArray(csv);
        var objArray = [];
        for (var i = 1; i < array.length; i++) {
            objArray[i - 1] = {};
            for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                var key = array[0][k];
                objArray[i - 1][key] = array[i][k]
            }
        }
        
        var json = JSON.stringify(objArray);
        var str = json.replace("/},/g", "},\r\n");
        
        return str;
    },
    
    upload : function(cmp, evt, helper, crud) {
        // var file = evt.getSource().get("v.files")[0];
        var target = cmp.get("v.target");
        var allOrNone = cmp.get("v.allOrNone");
        var verbose = cmp.get("v.verbose");
        var file = cmp.find("file").getElement().files[0];
        var spinner = cmp.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");	// show spinner
        console.log("target:" + target);
        console.log("crud:" + crud);
        console.log("allOrNone:" + allOrNone);
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "Shift_JIS");
            reader.onload = function (evt) {
                var result = helper.CSV2JSON(evt.target.result);
                console.log(JSON.parse(result));
                var act = cmp.get("c.setJSON");
                act.setParams({ "payload" : result,  "target": target , "crud":crud, "allOrNone":allOrNone});                
                act.setCallback(this, function(response) {
                    var state = response.getState();
                    var json = '';
                    if (state === "SUCCESS") {
                        json = act.getReturnValue();						
                    } else if (state === "INCOMPLETE") {
                        // do something
                    } else if (state === "ERROR") {
                        var errors = response.getError();
                        if (!errors) {
                            json = "{'no':1,'status':'Error','msg':'Unknown error'}";
                        } else if (errors[0] && errors[0].message) {
                            json = "{'no':1,'status':'Error', 'msg':'" + errors[0].message + "'}";
                        }
                    }
                    if(verbose) {
                        cmp.set('v.mycolumns', [{'label' : 'no', 'fieldName':'no','type':'number','initialWidth': 50},{'label' : 'status', 'fieldName':'status','type':'text','initialWidth': 100},{'label' : 'message', 'fieldName':'msg','type':'text'}]);
                        var parsed = JSON.parse(json);
                        cmp.set("v.mydata", parsed);	// need to parse and pass as an object
                    } else {
                        console.log(json);
                    }
                    $A.util.toggleClass(spinner, "slds-hide");	// hide spinner
                });
                
                
                $A.enqueueAction(act);
            }
            reader.onerror = function (evt) {
                cmp.set('v.mycolumns', [{'label' : 'no', 'fieldName':'no', 'type':'number','initialWidth': 50},{'label' : 'status', 'fieldName':'status','type':'text','initialWidth': 100},{'label' : 'message', 'fieldName':'msg','type':'text'}]);
                cmp.set("v.mydata", [{'no':'1','status':'Error','msg':'error reading file'}]);
                $A.util.toggleClass(spinner, "slds-hide");	// hide spinner
            }
        }
        
    }
    
})