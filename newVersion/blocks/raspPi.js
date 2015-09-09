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


goog.provide('Blockly.Blocks.raspPi');

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
    this.setColour(285);
  }
};

Blockly.Blocks['input'] = {
  init: function() {
    this.appendValueInput("pinNumber")
        .setCheck("Number")
        .appendField("Read Pin#");
    this.setInputsInline(true);
    this.setTooltip('');
    this.setOutput(true, "Boolean");
    this.setColour(285);
  }
};

Blockly.Blocks['sleep_time'] = {
  init: function() {
    this.appendValueInput("num")
        .setCheck("Number")
        .appendField("Pause: ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.setColour(285);
  }
};

Blockly.Blocks['output'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Output")
        .appendField(new Blockly.FieldDropdown([['HIGH', 'GPIO.HIGH'], ['LOW', 'GPIO.LOW']]), 'outputType');
    this.appendValueInput("pinNumber")
        .appendField("on Pin# ")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.setColour(285);
  }
};