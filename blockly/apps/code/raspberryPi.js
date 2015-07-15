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
Blockly.Blocks['print'] = {
  init: function() {
    this.appendValueInput("message")
        .setCheck("String")
        .appendField("Print: ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Python['print'] = function(block) {
  var valueNum = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
  var code = 'print '+valueNum+'\n';
  return code;
};


Blockly.Blocks['input'] = {
  init: function() {
    this.appendValueInput("message")
        .setCheck("Number")
        .appendField("Input ");
    this.setInputsInline(true);
    this.setTooltip('');
    this.setOutput(true, Boolean);
  }
};

Blockly.Python['input'] = function(block) {
  var valueNum = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
  Blockly.Python.definitions_['define_setMode'] = 'GPIO.setmode(' + valueNum + ')\n'
  var code = 'GPIO.input('+valueNum+')\n';
  return [code, Blockly.Python.ORDER_NONE];
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
  Blockly.Python.definitions_['import_time'] = 'import time as time\n'
  var valueNum = Blockly.Python.valueToCode(block, 'num', Blockly.Python.ORDER_ATOMIC);
  if(!valueNum){
    valueNum = 0;
  }
  var code = 'time.sleep('+valueNum+');\n';
  return code;
};

