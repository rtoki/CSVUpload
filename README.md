# CSVUpload

CSV file upload to insert/update/delete records on Salesforce.
(New) LWC(Lightning Web Component) version.
Lightning Component version.

## Getting Started

Prototype.

### Prerequisites

Enable Lightning Experience and prepare my domain.
To use LWC, Spring '19 instance is necessary.

### Installing

Lightning Component version:
Install from AppExchange link below.
* https://login.salesforce.com/packaging/installPackage.apexp?p0=04t100000007Xlz&isdtp=p1

LWC version
clone and push via VSCode.

### Usage
Create a lightning page via AppBuilder and assign attributes below:
```
target - Target object name (ex. Account)
insert - Show Insert button (true/false. defualt:true)
update - Show Update button (true/false. defualt:true)
delete - Show Delete button (true/false. defualt:true)
allOrNone - Whether the operation allows partial success. If you specify false for this parameter and a record (true/false. defualt:false)
verbose - Display results in datatable (true/false. default:true)
```
