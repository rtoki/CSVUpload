public with sharing class CSVUploadController {
    @AuraEnabled
    public static String setJSON(String payload, String target, String crud, Boolean allOrNone) {
        Schema.SObjectType objType  = Schema.getGlobalDescribe().get(target);
        
        JSONParser parser = JSON.createParser(payload);
        List<SObject> objs = New List<SObject>();
        Integer n = 1;
        while (parser.nextToken() != null) {
            if (parser.getCurrentToken() == JSONToken.START_ARRAY) {
                while (parser.nextToken() != null) {
                    if (parser.getCurrentToken() == JSONToken.START_OBJECT) {
                        SObject obj = (SObject)parser.readValueAs(Type.forName(target));
                        objs.add(obj);
                        String s = JSON.serialize(obj);
                        parser.skipChildren();
                    }
                }
            }
        }
        
        try {
            JSONGenerator gen = JSON.createGenerator(true);
            gen.writeStartArray();    
            if('update'.equals(crud) ||  'insert'.equals(crud)) {
               Database.SaveResult[] srList;
                if('update'.equals(crud)) {
                    srList = Database.update(objs, allOrNone);
                } else if ('insert'.equals(crud)) {
                    srList = Database.insert(objs, allOrNone);
                }
                for (Database.SaveResult sr : srList) {
                    
                    if (sr.isSuccess()) {
                        // Operation was successful, so get the ID of the record that was processed                    
                        gen.writeStartObject();        
                        gen.writeNumberField('no', n++);
                        gen.writeStringField('status', 'Success');
                        gen.writeStringField('msg', sr.getId());
                        gen.writeEndObject();        
                        
                    } else {
                        // Operation failed, so get all errors                
                        for(Database.Error err : sr.getErrors()) {
                            gen.writeStartObject();
                            gen.writeNumberField('no', n++);
                            gen.writeStringField('status', 'Error');
                            gen.writeStringField('msg', err.getMessage());
                            gen.writeEndObject();        
                        }
                    }
                }
                
            }  else if ('delete'.equals(crud)) {
                Database.DeleteResult[] srList;
                srList = Database.delete(objs, allOrNone);
                
                for (Database.DeleteResult sr : srList) {
                    if (sr.isSuccess()) {
                        // Operation was successful, so get the ID of the record that was processed         
                        gen.writeStartObject(); 
                        gen.writeNumberField('no', n++);
                        gen.writeStringField('status', 'Success');
                        gen.writeStringField('msg', sr.getId());
                        gen.writeEndObject();    
                    } else {
                        // Operation failed, so get all errors                
                        for(Database.Error err : sr.getErrors()) {
                            gen.writeStartObject();   
                            gen.writeNumberField('no', n++);
                            gen.writeStringField('status', 'Error');
                            gen.writeStringField('msg',  err.getMessage());
                            gen.writeEndObject();   
                        }
                    }
                }
                
            }
            gen.writeEndArray();
            return gen.getAsString();
        } catch(DmlException e) {
            return e.getDmlMessage(0);
        }
    }
}