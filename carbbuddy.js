var jQT = new $.jQTouch({
    icon: 'kilo.png'
});
var db;
$(document).ready(function(){
  $('#createEntry form').submit(createEntry);
  $('#settings form').submit(saveSettings);
  $('#settings').bind('pageAnimationStart',loadSettings);
  $('#plusbutton').bind('click touchend', function() {
    $('#food').val('');
    $('#carbs').val('');
  });
  //Add code to modify dates list
  $('#dates li a').bind('click touchend',function() {
      var dayOffset = this.id;
      var date = new Date();
      date.setDate(date.getDate() - dayOffset);
      sessionStorage.currentDate = date.getMonth() + 1 + '/' +
                                   date.getDate() + '/' +
                                   date.getFullYear();
      refreshEntries();
  });
  var shortName = 'Carbs';
  var version = '1.0';
  var displayName = 'Carbs';
  var maxSize = 65536;
  db = openDatabase(shortName, version, displayName, maxSize);
  db.transaction(
    function(transaction) {
      transaction.executeSql(
        'CREATE TABLE IF NOT EXISTS entries '+
        ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
        '  date DATE NOT NULL, food TEXT NOT NULL, ' +
        '  carbs INTEGER NOT NULL );'
      );
    }
  );
db.transaction(
  function(transaction) {
    transaction.executeSql(
      'CREATE TABLE IF NOT EXISTS entries '+
      ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
      '  date DATE NOT NULL, food TEXT NOT NULL, ' +
      '  carbs INTEGER NOT NULL );'
    );
  }
);


});

function createEntry() {
    var date = sessionStorage.currentDate;
    var carbs = $('#carbs').val();
    var food = $('#food').val();
    db.transaction(
      function(transaction) {
        transaction.executeSql(
          'INSERT INTO entries (date, carbs, food) VALUES (?,?,?);',
          [date, carbs, food],
          function(){
            refreshEntries();
            jQT.goBack();
          },
          errorHandler
        );
      }
    );
    return false;
} // End of createEntry()

function errorHandler(transaction, error){
  alert('Oops. Error was ' + error.message +'(Code '+error.code+')');
}

function refreshEntries() {
  var currentDate = sessionStorage.currentDate;
  $('#date h1').text(currentDate);
  $('#date ul li:gt(0)').remove();
  db.transaction(
    function(transaction) {
      transaction.executeSql(
        'SELECT * FROM entries WHERE date = ? ORDER BY food;',
        [currentDate],
        function (transaction, result) {
          //insert to show summary row
      //    alert('rows = ' + result.rows.length);
          if (result.rows.length>0) {
      //      alert('Change .info background');
            $('.info').css({'display': 'block',
                            'text-align':'left',
                            'font-size':'20px'
                    });
          }
          var totalCarbs = 0;
          for (var i=0;i<result.rows.length;i++) {
            var row = result.rows.item(i);
            var newEntryRow = $('#entryTemplate').clone();
            newEntryRow.removeAttr('id');
            newEntryRow.removeAttr('style');
            newEntryRow.data('entryId', row.id);
            newEntryRow.appendTo('#date ul');
            newEntryRow.find('.entryFood').text(row.food);
            newEntryRow.find('.entryCarbs').text(row.carbs);
            totalCarbs += row.carbs;
            newEntryRow.find('.delete').click(function() {
              var clickedEntry = $(this).parent();
              var clickedEntryId = clickedEntry.data('entryId');
              deleteEntryById(clickedEntryId);
              clickedEntry.slideUp();
            });
          }
          $('.summaryCarbs').html(totalCarbs);
        },
        errorHandler
      );
    }
  );

}

function saveSettings() {
  localStorage.age = $('#age').val();
  localStorage.budget = $('#budget').val();
  localStorage.weight = $('#weight').val();
  jQT.goBack();
  return false;
}

function deleteEntryById(id) {
	alert('Called deleteEntryById on id = ' + id);
  db.transaction(
    function(transaction) {
      transaction.executeSql('DELETE FROM entries WHERE id=?;',
      [id], null, errorHandler);
    }
  );
}

function loadSettings() {
  if (!localStorage.age) {
    localStorage.age = "";
  }
  if (!localStorage.budget) {
    localStorage.budget = "";
  }
  if (!localStorage.weight) {
    localStorage.weight = "";
  }

  $('#age').val(localStorage.age);
  $('#budget').val(localStorage.budget);
  $('#weight').val(localStorage.weight);
}
