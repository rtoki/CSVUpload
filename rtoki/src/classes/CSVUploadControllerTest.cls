@isTest 
public class CSVUploadControllerTest {
    static testMethod void validateCSVUploadController() {
        String payload = '[{"Name" : "foobar1" , "Phone " : "03-1234-5678" }, {"Name" : "foobar2" , "Phone " : "03-1234-5678" }]';
		String target = 'Account';
         CSVUploadController.setJSON(payload, target, 'insert', false);
         CSVUploadController.setJSON(payload, target, 'update', false);
        
        List<Account> accs = [SELECT id FROM Account];
        CSVUploadController.setJSON(JSON.serialize(accs), target, 'delete', false);
    }

}