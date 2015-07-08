/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Text blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

//goog.provide('Blockly.Blocks.text');

goog.require('Blockly.Blocks');

/////////
Blockly.Blocks['sleep_time'] = {
  init: function() {
    this.appendValueInput("num")
        .setCheck("Number")
        .appendField("Pause: ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Python['sleep_time'] = function(block) {
  var valueNum = Blockly.Python.valueToCode(block, 'num', Blockly.Python.ORDER_ATOMIC);
  var code = 'time.sleep('+valueNum+');\n';
  return code;
};
////////
Blockly.Blocks['post_to_chat'] = {
  init: function() {
    this.appendValueInput("msgToPost")
        .setCheck("String")
        .appendField("Message:");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Python['post_to_chat'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'msgToPost', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.postToChat('+msg+');\n';
  return code;
};
/////////
Blockly.Blocks['sleep_time'] = {
  init: function() {
    this.appendValueInput("num")
        .setCheck("Number")
        .appendField("Pause: ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Python['sleep_time'] = function(block) {
  var valueNum = Blockly.Python.valueToCode(block, 'num', Blockly.Python.ORDER_ATOMIC);
  var code = 'time.sleep('+valueNum+');\n';
  return code;
};
/////////
Blockly.Blocks['get_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Get Blocks: ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Python['get_block'] = function(block) {
  var valueNum = Blockly.Python.valueToCode(block, 'num', Blockly.Python.ORDER_ATOMIC);
  var code = 'time.sleep('+valueNum+');\n';
  return code;
};

