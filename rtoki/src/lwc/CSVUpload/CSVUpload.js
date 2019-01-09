import { LightningElement, api, wire, track } from 'lwc';
import setJSON from '@salesforce/apex/CSVUploadController.setJSON';

export default class CSVUpload extends LightningElement {

    @api target = "Account";
    @api insertRecord = false;
    @api updateRecord = false;
    @api deleteRecord = false;
    @api allOrNone = false;
    @api verbose = false;
    @track mydata = null;
    @track mycolumns = null;  // List
    @track csvFile = null;
    @track error;

    handleFilesChange(evt) {
        console.log("file");
        //let file = evt.getSource().get("v.files");    /* didn't work */
        this.csvFile = evt.target.files[0];
        console.log("file content: " + this.csvFile);
    }


    handleInsert(evt) {
        console.log("insert");
        this.uploadCSV(evt, 'insert');
    }

    handleUpdate(evt) {
        this.uploadCSV(evt, 'update');
    }

    handleDelete(evt) {
        this.uploadCSV(evt, 'delete');
    }
 

    uploadCSV(evt, crud) {
        console.log("crud:" + crud);
        console.log("target:" + this.target);
        console.log("allOrNone:" + this.allOrNone);
        console.log("verbose:" + this.verbose);
        //var spinner = this.find("mySpinner");
        //$A.util.toggleClass(spinner, "slds-hide");	// show spinner
        if (!this.csvFile) {
            console.log("file not found");
            return;
        }

        let reader = new FileReader();
        let ctx = this; // to control 'this' property in an event handler
        reader.readAsText(this.csvFile, "Shift_JIS");
        reader.onload = function (evt) {
            //console.log(evt.target.result);
            let payload = ctx.CSV2JSON(evt.target.result, ctx.CSVToArray);
            let json = null;
            let error = null;
            console.log("payload:" + payload);
            setJSON({"payload":payload, "target":ctx.target , "crud":crud, "allOrNone":ctx.allOrNone})
                .then(result => {
                    json = result;
                    console.log("apex call setJSON() ===> success: " + json);
                    if(ctx.verbose) {
                        ctx.mycolumns = [{'label' : 'no', 'fieldName':'no','type':'number','initialWidth': 50},{'label' : 'status', 'fieldName':'status','type':'text','initialWidth': 100},{'label' : 'message', 'fieldName':'msg','type':'text'}];
                        ctx.mydata = JSON.parse(json);	// need to parse and pass as an object
                    } else {
                        console.log(json);
                    }
                })
                .catch(error => {
                    error = error;
//                        console.log("error:" + error.errorCode + ', message ' + error.message);
                    if(error && error.message) {
                        json = "{'no':1,'status':'Error', 'msg':'" + error.message + "'}";
                    } else {
                        json = "{'no':1,'status':'Error','msg':'Unknown error'}";
                    }
                    if(ctx.verbose) {
                        ctx.mycolumns = [{'label' : 'no', 'fieldName':'no','type':'number','initialWidth': 50},{'label' : 'status', 'fieldName':'status','type':'text','initialWidth': 100},{'label' : 'message', 'fieldName':'msg','type':'text'}];
                        ctx.mydata = JSON.parse(json);	// need to parse and pass as an object
                    } else {
                        console.log(json);
                    }
                });

                
        }
        reader.onerror = function (evt) {
            ctx.mycolumns = [{'label' : 'no', 'fieldName':'no', 'type':'number','initialWidth': 50},{'label' : 'status', 'fieldName':'status','type':'text','initialWidth': 100},{'label' : 'message', 'fieldName':'msg','type':'text'}];
            ctx.mydata = [{'no':'1','status':'Error','msg':'error reading file'}];
            //$A.util.toggleClass(spinner, "slds-hide");	// hide spinner
        }
        console.log("mydata:" + ctx.mydata);
    }


    CSV2JSON(csv, csv2array) {
        let array = csv2array(csv);
        let objArray = [];
        for (let i = 1; i < array.length; i++) {
            objArray[i - 1] = {};
            for (let k = 0; k < array[0].length && k < array[i].length; k++) {
                let key = array[0][k];
                objArray[i - 1][key] = array[i][k]
            }
        }
        
        let json = JSON.stringify(objArray);
        let str = json.replace("/},/g", "},\r\n");
        
        return str;
    }

    CSVToArray(strData, strDelimiter) {
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
    }




}
