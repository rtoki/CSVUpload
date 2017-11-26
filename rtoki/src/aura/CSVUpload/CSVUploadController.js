({
     insert : function(cmp, evt, helper) {
		helper.upload(cmp, evt, helper, 'insert');
    },
    update : function(cmp, evt, helper) {
		helper.upload(cmp, evt, helper, 'update');
    },
    delete : function(cmp, evt, helper) {
		helper.upload(cmp, evt, helper, 'delete');
    }
})