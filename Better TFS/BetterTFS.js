// ==UserScript==
// @name        Better TFS
// @namespace   nl.patrickkik
// @description Making the task board of TFS a little better.
// @downloadURL https://userscripts.org/scripts/source/169344.user.js
// @updateURL   https://userscripts.org/scripts/source/169344.user.js
// @match       http://tfs.irdeto.intra:8080/tfs/*/*/*/_boards
// @match       https://tfs.irdeto.com/tfs/*/*/*/_boards
// @version     7.3
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

// ========== DEFINING CONSTANTS ==========

var TIMEOUT = 500;
var HIGHLIGHT_MENU_ID = "kik_better_tfs_highlight_menu";
var HIGHLIGHT_MENU_TEXT = "toggle highlighting";
var HIGHLIGHT_MENU_TITLE = "Toggles highlighting of your tasks";
var EXPAND_ALL_MENU_ID = "kik_better_tfs_expand_all_menu";
var EXPAND_ALL_MENU_TEXT = "expand all";
var EXPAND_ALL_MENU_TITLE = "Expands all features";
var COLLAPSE_ALL_MENU_ID = "kik_better_tfs_collapse_all_menu";
var COLLAPSE_ALL_MENU_TEXT = "collapse all";
var COLLAPSE_ALL_MENU_TITLE = "Collapses all features";
var SMART_COLLAPSE_MENU_ID = "kik_smart_collapse_menu";
var SMART_COLLAPSE_MENU_TEXT = "smart collapse";
var SMART_COLLAPSE_MENU_TITLE = "Collapses all non active features:\n"
    + " - all features with tasks in 'in progress' will be expanded;\n"
    + " - all features with tasks in 'to do' and in 'done' will be expanded;\n"
    + " - all features without tasks will be expanded;\n"
    + " - all features with tasks only in 'to do' will be collapsed;\n"
    + " - all features with tasks only in 'done' will be collapsed.";
var HIGHLIGHTING_ENABLED_KEY = "highlightingEnabled";
var EXPORT_MENU_ID = "kik_better_tfs_export_menu";
var EXPORT_MENU_TEXT = "export";
var EXPORT_MENU_TITLE = "Exports all features and tasks";
var $ = unsafeWindow.jQuery;

// Keep the first common task something like the original.
// Add tasks after the first.
var COMMON_TASKS = [
    {
        "title": "--- Select template ---",
        "work": ""
    },
    {
        "title": "Update documentation",
        "work": "2"
    },
    {
        "title": "Review code changes",
        "work": "2"
    }
];



// ========== EXECUTING SCRIPT ==========

waitForTaskboardTableToLoad();


// ========== INITIALIZATION ==========

function waitForTaskboardTableToLoad() {
    var taskboardTable = $("#taskboard");
    table = $(taskboardTable);
    if (!taskboardTable) {
        setTimeout(waitForTaskboardTableToLoad, TIMEOUT);
    }
    else {
        var rows = table.find('tr').length;
        if (!rows) {
            setTimeout(waitForTaskboardTableToLoad, TIMEOUT);
        }
        else {
            if (rows == 0) {
                setTimeout(waitForTaskboardTableToLoad, TIMEOUT);
            }
            else {
				addMenu();
				modifyTileColors(true);
                modifyRowColors(true);
				setTaskTitles(true);
                setCollapsePreferenceSelectors(true);
				smartCollapse();
                addListeners();
            }
        }
    }
}


// ========== MODIFYING THE MENU ==========

function addMenu() {
    var menu = $(".taskboard-views").first();

    var separator = createMenuElement(null, "|", null, null);
    menu.append(separator);

    var menuItem = createMenuElement(EXPAND_ALL_MENU_ID, EXPAND_ALL_MENU_TEXT, EXPAND_ALL_MENU_TITLE, expandAll);
    menu.append(menuItem);
    
    var menuItem = createMenuElement(COLLAPSE_ALL_MENU_ID, COLLAPSE_ALL_MENU_TEXT, COLLAPSE_ALL_MENU_TITLE, collapseAll);
    menu.append(menuItem);
    
    var menuItem = createMenuElement(SMART_COLLAPSE_MENU_ID, SMART_COLLAPSE_MENU_TEXT, SMART_COLLAPSE_MENU_TITLE, smartCollapse);
    menu.append(menuItem);

    var separator = createMenuElement(null, "|", null, null);
    menu.append(separator);

    var menuItem = createMenuElement(HIGHLIGHT_MENU_ID, HIGHLIGHT_MENU_TEXT, HIGHLIGHT_MENU_TITLE, highlightAction);
    menu.append(menuItem);
    
    var separator = createMenuElement(null, "|", null, null);
    menu.append(separator);

/*    var menuItem = createMenuElement(EXPORT_MENU_ID, EXPORT_MENU_TEXT, EXPORT_MENU_TITLE, exportAction);
    menu.append(menuItem);*/
}

function createMenuElement(id, text, title, listener) {
    var aElement = document.createElement("a");
    if (id != null) aElement.id = id;
    aElement.textContent = text;
    if (title != null) aElement.title = title;
    if (listener != null) aElement.addEventListener("click", listener, false);
    if (listener == null) aElement.style.cursor = "default";
    if (id == HIGHLIGHT_MENU_ID && isHighlighting()) aElement.classList.add("selected");

    var liElement = document.createElement("li");
    liElement.appendChild(aElement);

    return liElement;
}


// ========== COLORING THE TASK TILES ==========

function highlightAction() {
    if (isHighlighting()) {
        setHighlighting(false);
          document.getElementById(HIGHLIGHT_MENU_ID).classList.remove("selected")
    }
    else {
        setHighlighting(true);
          document.getElementById(HIGHLIGHT_MENU_ID).classList.add("selected")
    }

    modifyTileColors(false);
    modifyRowColors(false);
}

function modifyTileColors(loop) {
     var tiles = document.getElementsByClassName("tbTileContent");
     var username = getUser();
     var doHighlighting = isHighlighting();

     for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
         
          var assignedTo = tile.getElementsByClassName("witAssignedTo")[0].firstChild.innerHTML;
         
          if (doHighlighting && username == assignedTo) {
               tile.style.backgroundColor = "#FFFFC0";
               tile.style.borderLeftColor = "#C0C080";
          } else {
               tile.style.backgroundColor = "#DCE6F4";
               tile.style.borderLeftColor = "#95B3D7";
          }
     }
    
     if (loop) {
          setTimeout(function(){modifyTileColors(true);}, 4 * TIMEOUT);
     }
}

function isHighlighting() {
    return GM_getValue(HIGHLIGHTING_ENABLED_KEY, true);
}

function setHighlighting(enabled) {
    GM_setValue(HIGHLIGHTING_ENABLED_KEY, enabled);
}


// ========== COLORING THE FEATURE ROWS ==========

function modifyRowColors(loop) {

    iterateRows(modifyRowColorsAction);

     if (loop) {
          setTimeout(function(){modifyRowColors(true);}, 4 * TIMEOUT);
     }
}

function modifyRowColorsAction(row, summaryRow) {
    var toDoCell = row.cells[2].getElementsByTagName("div").length;
    var inProgressCell = row.cells[3].getElementsByTagName("div").length;
    var doneCell = row.cells[4].getElementsByTagName("div").length;

    if (inProgressCell == 0) {
        if (toDoCell == 0) {
            if (doneCell == 0) {
                markRowAsToDo(summaryRow);
            }
            else {
                markRowAsDone(summaryRow);
            }
        }
        else {
            if (doneCell == 0) {
                markRowAsToDo(summaryRow);
            }
            else {
                markRowAsInProgress(row, summaryRow);
            }
        }
    }
    else {
        markRowAsInProgress(row, summaryRow);
    }
}


// ========== ADDING TASK NAME TO TASK TILE ==========

function setTaskTitles(loop) {
     var tiles = document.getElementsByClassName("tbTileContent");
    
     for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
          var id = tile.parentElement.id.substring(5);
          
          tile.title = tile.getElementsByClassName("witTitle")[0].innerHTML;
     }

     if (loop) {
          setTimeout(function(){setTaskTitles(true);}, 4 * TIMEOUT);
     }
}

function getUser() {
     return document.getElementsByClassName("user-menu")[0].getElementsByTagName("span")[0].innerHTML;
}


// ========== COLLAPSE PREFERENCES ==========

function setCollapsePreferenceSelectors(loop) {
    iterateRows(function(row, summaryRow) {
        var cell = row.cells[1];
        var id = cell.id;
        var div = cell.children[0].children[1];
        
        if (div.innerHTML.indexOf("select") == -1) {
            var newOption0 = document.createElement("option");
            newOption0.value = "";
            newOption0.appendChild(document.createTextNode(""));
            var newOption1 = document.createElement("option");
            newOption1.value = "C";
            newOption1.appendChild(document.createTextNode("Keep collapsed"));
            var newOption2 = document.createElement("option");
            newOption2.value = "E";
            newOption2.appendChild(document.createTextNode("Keep expanded"));

            var newSelect = document.createElement("select");
            newSelect.id = "kik_collapse_preference_" + id;
            newSelect.style.fontSize = "8pt";
            newSelect.style.marginLeft = "5px";
            newSelect.appendChild(newOption0);
            newSelect.appendChild(newOption1);
            newSelect.appendChild(newOption2);
            
            newSelect.addEventListener("change", function() {
                if (this.value == "") {
                    GM_deleteValue(id);
                }
                else {
                    GM_setValue(id, this.value);
                }
            });
            
            selectElement = newSelect;

            div.appendChild(newSelect);
        }

    });
    

    if (loop) {
        setTimeout(function(){
            setCollapsePreferenceSelectors(true);
        }, 4 * TIMEOUT);
    }
}


// ========== COLLAPSING AND EXPANDING OF ROWS ==========

function expandAll() {
    iterateRows(expandRow);
}

function expandRow(row, summaryRow) {
    row.style.display = "";
    summaryRow.style.display = "none";
}

function collapseAll() {
    iterateRows(collapseRow);
}

function collapseRow(row, summaryRow) {
    row.style.display = "none";
    summaryRow.style.display = "";
}

function smartCollapse() {
    iterateRows(smartCollapseAction);
    setCollapsePreferenceSelectors(false);
}

function smartCollapseAction(row, summaryRow) {
    var toDoCell = row.cells[2].getElementsByTagName("div").length;
    var inProgressCell = row.cells[3].getElementsByTagName("div").length;
    var doneCell = row.cells[4].getElementsByTagName("div").length;

    if (inProgressCell == 0) {
        if (toDoCell == 0 && doneCell != 0) {
            collapseRow(row, summaryRow);
        }
        else if (toDoCell != 0 && doneCell == 0) {
            collapseRow(row, summaryRow);
        }
        else {
            expandRow(row, summaryRow);
        }
    }
    else {
        expandRow(row, summaryRow);
    }

    // Overriding smart collapse
    var cell = row.cells[1];
    var id = cell.id;
    var div = cell.children[0].children[1];
    var select = div.getElementsByTagName("select")[0];
    if (select) {
        var value = GM_getValue(id);
        if (value) {
            select.value = value;
            if (value == "C") {
                collapseRow(row, summaryRow);
            }
            else if (value == "E") {
                expandRow(row, summaryRow);
            }
        }
        else {
            select.value = "";
        }
    }
}

function iterateRows(rowAction) {
    var board = document.getElementById("taskboard-table");
    
    if (board == null) return;
    
    for (var rowIndex = 1; rowIndex < board.rows.length; rowIndex += 2) {
        var row = board.rows[rowIndex];
        var summaryRow = board.rows[rowIndex + 1];
        rowAction(row, summaryRow);
    }
}

function markRowAsToDo(summaryRow) {
    //summaryRow.cells[1].style.backgroundColor = "#FFFFFF";
}

function markRowAsInProgress(row, summaryRow) {
    var tiles = row.getElementsByClassName("tbTileContent");
    var username = getUser();
    var doHighlighting = isHighlighting();
    
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];

        var assignedTo = tile.getElementsByClassName("witAssignedTo")[0].firstChild.innerHTML;

        if (doHighlighting && username == assignedTo) {
            summaryRow.cells[1].style.backgroundColor = "#FFFFC0";
            return;
        }
    }

    summaryRow.cells[1].style.backgroundColor = "#ff0000";
}

function markRowAsDone(summaryRow) {
    summaryRow.cells[1].style.backgroundColor = "#DDFFDD";
}

// ========== COMMON TASK NAMES ==========

function setUserStoryIdInTitle(row, ids) {
    var us_id = 0;
    var title_row = row.find(".clickableTitle");
    if(title_row.attr("class") != null) {
        var parent = row.parents(".taskboard-parent");
        if(parent.attr("id") != null) {
            if(title_row.html().indexOf(' | ') == -1) {
                us_id = parent.attr("id").replace("taskboard-table_p","");
                title_row.text(us_id + " | " +title_row.html());
            }
        }
    }
    
    return us_id;
}

function higlightBlockedUserStory(us_id, row) {
    if(us_id != 0 ) {
        row.parents(".taskboard-row").css('background','');
        row.parents(".taskboard-row").next().find(".taskboard-parent").css('background','');
        row.parents(".taskboard-row").next().css('background','');
        $.ajax({
                url: 'http://tfs.irdeto.intra:8080/tfs/DefaultCollection/_api/_wit/workitems?__v=3&ids=' + us_id,
                type: 'GET',
                dataType: 'json',
                 xhrFields: {
                withCredentials: true
                },
                dataType: 'json',
                success: function(data, status) {
                    var content = 'yeah';
                    $.each(data.__wrappedArray, function (index, value) {
                        $.each(value, function (index, value) {
                            if(index == "fields") {
                                $.each(value, function (index, value) {
                                    if(index == "80") {
                                        if(value.toLowerCase().indexOf("blocked") != -1) {
                                            row.parents(".taskboard-row").css("display","none");
                                            row.parents(".taskboard-row").next().css("display","");
                                            row.parents(".taskboard-row").next().css('background','#FF8585');
                                            row.parents(".taskboard-row").next().find(".taskboard-parent").css('background','#FF8585');
                                            row.parents(".taskboard-row").css('background','#FF8585');
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
           });
       }
}
    
function addListeners() {
    //Set US number on title
    var rows = $(".tbPivotItem");
    rows.each(function() {
        var row = $(this);
        var us_id = setUserStoryIdInTitle($(this),"0");
        higlightBlockedUserStory(us_id, row);
    });
    
    var modified = false;
    $('.clickableTitle').bind("DOMSubtreeModified",function() { 
        DOMModified($(this)) 
        });
}


function DOMModified(title) {
    $('.clickableTitle').unbind("DOMSubtreeModified",null);
    var rows1 = $(title).parents(".tbPivotItem");
    var us_id1 = setUserStoryIdInTitle(rows1,"2");
    higlightBlockedUserStory(us_id1, rows1);
    $('.clickableTitle').bind("DOMSubtreeModified",function() { 
        DOMModified($(this)) 
        });
        
}
