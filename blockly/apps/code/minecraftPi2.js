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
Blockly.Blocks['get_height'] = {
  init: function() {
  	this.appendDummyInput()
  		.appendField("Highest Block at coordinates: ");
    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField("X  ");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y  ");
    this.setInputsInline(true);
    this.setOutput(true, Number);
    this.setTooltip('Returns the height of the tallest block at the specific X and Y coordinate.');
    this.setColour(120);
  }
};

Blockly.Python['get_height'] = function(block) {
  var value_XCoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_YCoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);

  if(!value_XCoord){
  	value_XCoord = 0;
  }
  if(!value_YCoord){
  	value_YCoord = 0;
  }

  var code = 'mc.getHeight('+value_XCoord+', '+value_YCoord+');\n';
  return [code, Blockly.Python.ORDER_NONE];
};
////////