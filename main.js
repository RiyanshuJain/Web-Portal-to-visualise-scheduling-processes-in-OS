recalculateServiceTime();

// Initially hiding the priority button
$('.priority-only').hide();

// Home page layout
$(document).ready(function () {
  $('input[type=radio][name=algorithm]').change(function () {

    // If button is priority scheduling then only show the Priority input column else directly show the response time
    if (this.value == 'priority') {
      $('.priority-only').show();
      $('.res_time').show();
      $('.wait_time').show();
      $('.ta_time').show();
      $('#minus').css('left', '842px');
    }
    else {
      $('.priority-only').hide();
      $('.res_time').show();
      $('.wait_time').show();
      $('.ta_time').show();
      $('#minus').css('left', '670px');
    }

    // If button is round robin scheduling then only show the quantum input button
    if (this.value == 'robin') {
      $('.res_time').hide();
      $('.wait_time').hide();
      $('.ta_time').hide();
      $('#quantumParagraph').show();
      $('#ab').hide();
      $('#cd').hide();
      $('#minus').css('left', '346px');
    }
    else {
      $('#quantumParagraph').hide();
      $('.res_time').show();
      $('.wait_time').show();
      $('#ab').show();
      $('#cd').show();
      $('.ta_time').show();
    }

    recalculateServiceTime();
  });
});

// Function that is responsible to add a row based on the last row number which is nothing but arrival time from the last row of table
function addRow() {
  var lastRow = $('#inputTable tr:last');
  var lastRowNumber = parseInt(lastRow.children()[1].innerText);

  var newRow = '<tr><td>P'
    + (lastRowNumber + 1)
    + '</td><td>'
    + (lastRowNumber + 1)
    + '</td><td><input class="exectime" type="text"/></td><td class="priority-only"><input type="text"/></td>'
    + '<td class="res_time"></td>'
    + '<td class="wait_time"></td>'
    + '<td class="ta_time"></td></tr>';

  lastRow.after(newRow);

  // Ajdusting the CSS of the delete row button when a new row is added
  var minus = $('#minus');
  minus.show();
  minus.css('top', (parseFloat(minus.css('top')) + 24) + 'px');

  // If selected option is not priority, then hidde the priority button and show only the response time
  if ($('input[name=algorithm]:checked', '#algorithm').val() != "priority")
    $('.priority-only').hide();


  $('#inputTable tr:last input').change(function () {
    recalculateServiceTime();
  });
}

// function which can delete a row and adjust the CSS of the button
function deleteRow() {
  var lastRow = $('#inputTable tr:last');
  lastRow.remove();

  var minus = $('#minus');
  minus.css('top', (parseFloat(minus.css('top')) - 24) + 'px');

  // if only one row is left, then not showing the delete row button
  if (parseFloat(minus.css('top')) < 150)
    minus.hide();
}

$(".initial").change(function () {
  recalculateServiceTime();
});

// Function to keep track of total execution time, priority array and response time
function recalculateServiceTime() {
  var inputTable = $('#inputTable tr');
  var totalExecuteTime = 0;

  var algorithm = $('input[name=algorithm]:checked', '#algorithm').val();
  if (algorithm == "fcfs") {
    $.each(inputTable, function (key, value) {
      if (key == 0) return true;
      $(value.children[4]).text(totalExecuteTime);

      var executeTime = parseInt($(value.children[2]).children().first().val());
      totalExecuteTime += executeTime;

      $(value.children[5]).text(totalExecuteTime - parseInt($(value.children[2]).children().first().val()));

      $(value.children[6]).text(totalExecuteTime);
    });
  }
  else if (algorithm == "sjf") {
    var executeTimes = [];
    $.each(inputTable, function (key, value) {
      if (key == 0) return true;
      executeTimes[key - 1] = parseInt($(value.children[2]).children().first().val());
    });

    var currentIndex = -1;
    for (var i = 0; i < executeTimes.length; i++) {
      currentIndex = findNextIndex(currentIndex, executeTimes);

      if (currentIndex == -1) return;

      $(inputTable[currentIndex + 1].children[4]).text(totalExecuteTime);

      totalExecuteTime += executeTimes[currentIndex];

      $(inputTable[currentIndex + 1].children[5]).text(totalExecuteTime - executeTimes[currentIndex]);
      $(inputTable[currentIndex + 1].children[6]).text(totalExecuteTime);
    }
  }
  else if (algorithm == "priority") {
    var executeTimes = [];
    var priorities = [];

    $.each(inputTable, function (key, value) {
      if (key == 0) return true;
      executeTimes[key - 1] = parseInt($(value.children[2]).children().first().val());
      priorities[key - 1] = parseInt($(value.children[3]).children().first().val());
    });

    var currentIndex = -1;
    for (var i = 0; i < executeTimes.length; i++) {
      currentIndex = findNextIndexWithPriority(currentIndex, priorities);

      if (currentIndex == -1) return;

      $(inputTable[currentIndex + 1].children[4]).text(totalExecuteTime);

      totalExecuteTime += executeTimes[currentIndex];

      $(inputTable[currentIndex + 1].children[5]).text(totalExecuteTime - executeTimes[currentIndex]);
      $(inputTable[currentIndex + 1].children[6]).text(totalExecuteTime);
    }
  }
  else if (algorithm == "robin") {
    $.each(inputTable, function (key, value) {
      if (key == 0) return true;
      $(value.children[4]).text("");
      $(value.children[5]).text("");
    });
  }
}

// Finding the next row with respect to priority, higher integer in priority array = higher priority and that process will be evaluated first
function findNextIndexWithPriority(currentIndex, priorities) {
  var currentPriority = 1000000;
  if (currentIndex != -1) currentPriority = priorities[currentIndex];
  var resultPriority = 0;
  var resultIndex = -1;
  var samePriority = false;
  var areWeThereYet = false;

  $.each(priorities, function (key, value) {
    var changeInThisIteration = false;

    if (key == currentIndex) {
      areWeThereYet = true;
      return true;
    }
    if (value <= currentPriority && value >= resultPriority) {
      if (value == resultPriority) {
        if (currentPriority == value && !samePriority) {
          samePriority = true;
          changeInThisIteration = true;
          resultPriority = value;
          resultIndex = key;
        }
      }
      else if (value == currentPriority) {
        if (areWeThereYet) {
          samePriority = true;
          areWeThereYet = false;
          changeInThisIteration = true;
          resultPriority = value;
          resultIndex = key;
        }
      }
      else {
        resultPriority = value;
        resultIndex = key;
      }

      if (value > resultPriority && !changeInThisIteration)
        samePriority = false;
    }
  });
  return resultIndex;
}

function findNextIndex(currentIndex, array) {
  var currentTime = 0;
  if (currentIndex != -1) currentTime = array[currentIndex];
  var resultTime = 1000000;
  var resultIndex = -1;
  var sameTime = false;
  var areWeThereYet = false;

  $.each(array, function (key, value) {
    var changeInThisIteration = false;

    if (key == currentIndex) {
      areWeThereYet = true;
      return true;
    }
    if (value >= currentTime && value <= resultTime) {
      if (value == resultTime) {
        if (currentTime == value && !sameTime) {
          sameTime = true;
          changeInThisIteration = true;
          resultTime = value;
          resultIndex = key;
        }
      }
      else if (value == currentTime) {
        if (areWeThereYet) {
          sameTime = true;
          areWeThereYet = false;
          changeInThisIteration = true;
          resultTime = value;
          resultIndex = key;
        }
      }
      else {
        resultTime = value;
        resultIndex = key;
      }

      if (value < resultTime && !changeInThisIteration)
        sameTime = false;
    }
  });
  return resultIndex;
}

// Function to visualise the processes going on and animate them
function animate() {
  $('fresh').prepend('<div id="curtain" style="position: absolute; right: 0; width:100%; height:100px;"></div>');

  $('#curtain').width($('#resultTable').width());
  $('#curtain').css({ left: $('#resultTable').position().left });

  var sum = 0;
  $('.exectime').each(function () {
    sum += Number($(this).val());
  });

  console.log($('#resultTable').width());
  var distance = $("#curtain").css("width");

  animationStep(sum, 0);
  jQuery('#curtain').animate({ width: '0', marginLeft: distance }, sum * 200 / 2, 'linear');
}

function animationStep(steps, cur) {
  $('#timer').html(cur);
  if (cur < steps) {
    setTimeout(function () {
      animationStep(steps, cur + 1);
    }, 100);
  }
  else {
  }
}

function avg_wt_time() {
  var sum = 0;
  var counter = 0;

  var table = document.getElementById("inputTable");
  for (let i = 1; i < table.rows.length; i++) {

    // GET THE CELLS COLLECTION OF THE CURRENT ROW.
    var objCells = table.rows.item(i).cells;
      sum+= parseInt(objCells.item(5).innerHTML)
      // console.log(parseInt(objCells.item(4).innerHTML))
      counter += 1
    
  }
  // console.log("sum",sum/counter)
  return (sum / counter);
}

function avg_ta_time() {
  var sum = 0;
  var counter = 0;

  var table = document.getElementById("inputTable");
  for (let i = 1; i < table.rows.length; i++) {

    // GET THE CELLS COLLECTION OF THE CURRENT ROW.
    var objCells = table.rows.item(i).cells;
      sum+= parseInt(objCells.item(6).innerHTML)
      // console.log(parseInt(objCells.item(4).innerHTML))
      counter += 1
    
  }
  // console.log("sum",sum/counter)
  return (sum / counter);
}
  // Function to make a new table for visualising the outputs on the basis of the scheduling algorithm selected
  function draw() {
    $('fresh').html('');
    var inputTable = $('#inputTable tr');
    var th = '';
    var td = '';

    var algorithm = $('input[name=algorithm]:checked', '#algorithm').val();
    if (algorithm == "fcfs") {
      $.each(inputTable, function (key, value) {
        if (key == 0) return true;
        var executeTime = parseInt($(value.children[2]).children().first().val());
        th += '<th style="height: 60px; width: ' + executeTime * 20 + 'px;">P' + (key - 1) + '</th>';
        td += '<td>' + executeTime + '</td>';
      });

      $('fresh').html('<table id="resultTable"><tr>'
        + th
        + '</tr><tr>'
        + td
        + '</tr></table>'
      );
    }
    else if (algorithm == "sjf") {
      var executeTimes = [];

      $.each(inputTable, function (key, value) {
        if (key == 0) return true;
        var executeTime = parseInt($(value.children[2]).children().first().val());
        executeTimes[key - 1] = { "executeTime": executeTime, "P": key - 1 };
      });

      executeTimes.sort(function (a, b) {
        if (a.executeTime == b.executeTime)
          return a.P - b.P;
        return a.executeTime - b.executeTime
      });

      $.each(executeTimes, function (key, value) {
        th += '<th style="height: 60px; width: ' + value.executeTime * 20 + 'px;">P' + value.P + '</th>';
        td += '<td>' + value.executeTime + '</td>';
      });

      $('fresh').html('<table id="resultTable"><tr>'
        + th
        + '</tr><tr>'
        + td
        + '</tr></table>'
      );
    }
    else if (algorithm == "priority") {
      var executeTimes = [];

      $.each(inputTable, function (key, value) {
        if (key == 0) return true;
        var executeTime = parseInt($(value.children[2]).children().first().val());
        var priority = parseInt($(value.children[3]).children().first().val());
        executeTimes[key - 1] = { "executeTime": executeTime, "P": key - 1, "priority": priority };
      });

      executeTimes.sort(function (a, b) {
        if (a.priority == b.priority)
          return a.P - b.P;
        return b.priority - a.priority
      });

      $.each(executeTimes, function (key, value) {
        th += '<th style="height: 60px; width: ' + value.executeTime * 20 + 'px;">P' + value.P + '</th>';
        td += '<td>' + value.executeTime + '</td>';
      });

      $('fresh').html('<table id="resultTable" style="width: 60%"><tr>'
        + th
        + '</tr><tr>'
        + td
        + '</tr></table>'
      );
    }
    else if (algorithm == "robin") {
      var quantum = $('#quantum').val();
      var executeTimes = [];

      $.each(inputTable, function (key, value) {
        if (key == 0) return true;
        var executeTime = parseInt($(value.children[2]).children().first().val());
        executeTimes[key - 1] = { "executeTime": executeTime, "P": key - 1 };
      });

      var areWeThereYet = false;
      while (!areWeThereYet) {
        areWeThereYet = true;
        $.each(executeTimes, function (key, value) {
          if (value.executeTime > 0) {
            th += '<th style="height: 60px; width: ' + (value.executeTime > quantum ? quantum : value.executeTime) * 20 + 'px;">P' + value.P + '</th>';
            td += '<td>' + (value.executeTime > quantum ? quantum : value.executeTime) + '</td>';
            value.executeTime -= quantum;
            areWeThereYet = false;
          }
        });
      }
      $('fresh').html('<table id="resultTable" style="width: 70%"><tr>'
        + th
        + '</tr><tr>'
        + td
        + '</tr></table>'
      );
    }
    animate();
    x = avg_wt_time();
    $('#avg_wt').html(Math.round(x * 100) / 100);

    y = avg_ta_time();
    $('#avg_ta').html(Math.round(y * 100) / 100);
  }