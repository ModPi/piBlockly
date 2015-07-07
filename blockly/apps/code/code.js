/**
 * Blockly Apps: Code
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Code application.
 * @author fraser@google.com (Neil Fraser)
 */

// Supported languages.
BlocklyApps.LANGUAGES =
    ['en'];
BlocklyApps.LANG = BlocklyApps.getLang();

document.write('<script type="text/javascript" src="generated/' +
               BlocklyApps.LANG + '.js"></script>\n');


/**
 * Create a namespace for the application.
 */
var Code = {};

/**
 * List of tab names.
 * @private
 */
Code.TABS_ = ['blocks', 'python'];

Code.selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function(clickedName) {

  // Deselect all tabs and hide all panes.
  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    document.getElementById('tab_' + name).className = 'taboff';
    document.getElementById('content_' + name).style.visibility = 'hidden';
  }

  // Select the active tab.
  Code.selected = clickedName;
  document.getElementById('tab_' + clickedName).className = 'tabon';
  // Show the selected pane.
  document.getElementById('content_' + clickedName).style.visibility =
      'visible';
  Code.renderContent();
  Blockly.fireUiEvent(window, 'resize');
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
  
  $('#tab_blocks').click(function() {$('#copy_code').hide()});
  $('#tab_python').click(function() {$('#copy_code').show()});
  Blockly.HSV_SATURATION = 0.99
  Blockly.HSV_VALUE = 0.90
  var content = document.getElementById('content_' + Code.selected);
  // Initialize the pane.
  if (content.id == 'content_xml') {
    var xmlTextarea = document.getElementById('content_xml');
    var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    xmlTextarea.value = xmlText;
    xmlTextarea.focus();
  } else if (content.id == 'content_python') {
    var code = Blockly.Python.workspaceToCodeAlpha();
    content.textContent = addLineNumbers(code);
    if (typeof prettyPrintOne == 'function') {
      code = content.innerHTML;
      code = prettyPrintOne(code, 'python');
      content.innerHTML = code;
    }
    
  }
};

function codeToClipboard() {
  window.prompt("Your code is hightlighted!\nCopy to your clipboard by Ctrl+C, or Cmnd+C (mac)\npush Enter to close the dialog", Blockly.Python.workspaceToCodeAlpha());
}

function addLineNumbers(content) {
  content = content.split('\n');
  for(var i = 0; i < content.length; i++) {
    content[i] = giveFieldWidth(6, String(i+1) + '. ') + content[i];
  }
  return content.join('\n');
}

function giveFieldWidth(fw, string) {
  if(string.length >= fw) return;
  var spacesNeeded = fw - string.length;
  for(var i = 0; i < spacesNeeded; i++) {
    string = ' '.concat(string);
  }
  return string;
}

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
  BlocklyApps.init();

  var rtl = BlocklyApps.isRtl();
  var container = document.getElementById('content_area');
  var onresize = function(e) {
    var bBox = BlocklyApps.getBBox_(container);
    for (var i = 0; i < Code.TABS_.length; i++) {
      var el = document.getElementById('content_' + Code.TABS_[i]);
      el.style.top = bBox.y + 'px';
      el.style.left = bBox.x + 'px';
      // Height and width need to be set, read back, then set again to
      // compensate for scrollbars.
      el.style.height = bBox.height + 'px';
      el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
      el.style.width = bBox.width + 'px';
      el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
    }
    // Make the 'Blocks' tab line up with the toolbox.
    if (Blockly.Toolbox.width) {
      document.getElementById('tab_blocks').style.minWidth =
          (Blockly.Toolbox.width - 38) + 'px';
          // Account for the 19 pixel margin and on each side.
    }
  };
  window.addEventListener('resize', onresize, false);

  var toolbox = document.getElementById('toolbox');
  Blockly.inject(document.getElementById('content_blocks'),
      {path: '../../',
       rtl: rtl,
       toolbox: toolbox});

  // Add to reserved word list: Local variables in execution evironment (runJS)
  // and the infinite loop detection function.
  Blockly.JavaScript.addReservedWords('code,timeouts,checkTimeout');

  BlocklyApps.loadBlocks('');

  if ('BlocklyStorage' in window) {
    // Hook a save function onto unload.
    //BlocklyStorage.backupOnUnload();
  }

  Code.tabClick(Code.selected);
  Blockly.fireUiEvent(window, 'resize');

  /*
  BlocklyApps.bindClick('trashButton',
      function() {Code.discard(); Code.renderContent();});
  BlocklyApps.bindClick('runButton', Code.runJS);
  */


  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    BlocklyApps.bindClick('tab_' + name,
        function(name_) {return function() {Code.tabClick(name_);};}(name));
  }

  // Lazy-load the syntax-highlighting.
  window.setTimeout(BlocklyApps.importPrettify, 1);
};

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', BlocklyApps.initReadonly);
} else {
  window.addEventListener('load', Code.init);
}

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  Catch infinite loops.
 */
Code.runJS = function() {
  Blockly.JavaScript.INFINITE_LOOP_TRAP = '  checkTimeout();\n';
  var timeouts = 0;
  var checkTimeout = function() {
    if (timeouts++ > 1000000) {
      throw BlocklyApps.getMsg('Code_timeout');
    }
  };
  var code = Blockly.JavaScript.workspaceToCode();
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
  try {
    eval(code);
  } catch (e) {
    alert(BlocklyApps.getMsg('Code_badCode').replace('%1', e));
  }
};

/**
 * Discard all blocks from the workspace.
 */
Code.discard = function() {
  var count = Blockly.mainWorkspace.getAllBlocks().length;
  if (count < 2 ||
      window.confirm(BlocklyApps.getMsg('Code_discard').replace('%1', count))) {
    Blockly.mainWorkspace.clear();
    window.location.hash = '';
  }
};
