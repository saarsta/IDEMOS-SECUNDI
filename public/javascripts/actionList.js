var COUNTER;

function loadActionList() {
    COUNTER = 0;
    db_functions.dbGetAllSubjects(true);
    db_functions.getAllApprovedActions();


}

$(function() {
    loadActionList();
});