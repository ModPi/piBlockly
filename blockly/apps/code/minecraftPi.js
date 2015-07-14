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
  if(!valueNum){
    valueNum = 0;
  }
   //Blockly.Arduino.definitions_['define_liquidcrystal'] =   '#include <LiquidCrystal.h>\n';

  var code = 'time.sleep('+valueNum+');\n';
  return code;
};
/////////
Blockly.Blocks['get_block'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get Block");
    this.setInputsInline(true);
    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField(" X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");
    this.setOutput(true, Number);
    this.setTooltip('Gets the type of the block at a given coordinate.');
  }
}

Blockly.Python['get_block'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);

  if(!value_xcoord){
    value_xcoord = 0;
  }
  if(!value_ycoord){
    value_ycoord = 0;
  }
  if(!value_zcoord){
    value_zcoord = 0;
  }
  var code = 'mc.getBlock('+value_xcoord+', '+value_ycoord+', '+value_zcoord+');\n'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['get_blocks'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get Cube of Blocks");
    this.setInputsInline(true);

    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField(" X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");

    this.appendValueInput("xCoordEnd")
        .setCheck("Number")
        .appendField(" X Coord End:");
    this.appendValueInput("yCoordEnd")
        .setCheck("Number")
        .appendField("Y Coord End:");
    this.appendValueInput("zCoordEnd")
        .setCheck("Number")
        .appendField("Z Coord End:");
    this.setOutput(true, Number);
    this.setTooltip('Gets a cube of blocks from the first coordinate to the second coordinate in the form of a list!.');
  }
}

Blockly.Python['get_blocks'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);

  var value_xcoord_end = Blockly.Python.valueToCode(block, 'xCoordEnd', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord_end = Blockly.Python.valueToCode(block, 'yCoordEnd', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord_end = Blockly.Python.valueToCode(block, 'zCoordEnd', Blockly.Python.ORDER_ATOMIC);

  if(!value_xcoord){
    value_xcoord = 0;
  }
  if(!value_ycoord){
    value_ycoord = 0;
  }
  if(!value_zcoord){
    value_zcoord = 0;
  }
  if(!value_xcoord_end){
    value_xcoord_end = 0;
  }
  if(!value_ycoord_end){
    value_ycoord_end = 0;
  }
  if(!value_zcoord_end){
    value_zcoord_end = 0;
  }
  var code = 'mc.getBlocks('+value_xcoord+', '+value_ycoord+', '+value_zcoord+', ' + value_xcoord_end+', '+value_ycoord_end+', '+value_zcoord_end+ ');\n'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['get_block_with_data'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get Block with Data");
    this.setInputsInline(true);

    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField(" X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");

    this.setOutput(true, Number);
    this.setTooltip('Gets the block type at a given coordinate with it\'s data!');
  }
}

Blockly.Python['get_block_with_data'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);

  if(!value_xcoord){
    value_xcoord = 0;
  }
  if(!value_ycoord){
    value_ycoord = 0;
  }
  if(!value_zcoord){
    value_zcoord = 0;
  }

  var code = 'mc.getBlockWithData(' + value_xcoord + ', '+value_ycoord + ', ' + value_zcoord + ');\n'
  return [code, Blockly.Python.ORDER_NONE];
};


/////////
Blockly.Blocks['set_block'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Create Block");
    this.setInputsInline(true);

    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField(" X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");

    this.setOutput(true, Number);
    this.setTooltip('Creates a block at the given coordinate!');
  }
}

Blockly.Python['set_block'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);

  if(!value_xcoord){
    value_xcoord = 0;
  }
  if(!value_ycoord){
    value_ycoord = 0;
  }
  if(!value_zcoord){
    value_zcoord = 0;
  }

  var code = 'mc.setBlock(' + value_xcoord + ', '+value_ycoord + ', ' + value_zcoord + ');\n'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['set_blocks'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Create Cube of Blocks");
    this.setInputsInline(true);

    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField(" X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");

    this.appendValueInput("xCoordEnd")
        .setCheck("Number")
        .appendField(" X Coord End:");
    this.appendValueInput("yCoordEnd")
        .setCheck("Number")
        .appendField("Y Coord End:");
    this.appendValueInput("zCoordEnd")
        .setCheck("Number")
        .appendField("Z Coord End:");
    this.setOutput(true, Number);
    this.setTooltip('Creates a cube of blocks from the first coordinate to the second coordinate.');
  }
}

Blockly.Python['set_blocks'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);

  var value_xcoord_end = Blockly.Python.valueToCode(block, 'xCoordEnd', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord_end = Blockly.Python.valueToCode(block, 'yCoordEnd', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord_end = Blockly.Python.valueToCode(block, 'zCoordEnd', Blockly.Python.ORDER_ATOMIC);

  if(!value_xcoord){
    value_xcoord = 0;
  }
  if(!value_ycoord){
    value_ycoord = 0;
  }
  if(!value_zcoord){
    value_zcoord = 0;
  }
  if(!value_xcoord_end){
    value_xcoord_end = 0;
  }
  if(!value_ycoord_end){
    value_ycoord_end = 0;
  }
  if(!value_zcoord_end){
    value_zcoord_end = 0;
  }
  var code = 'mc.setBlocks('+value_xcoord+', '+value_ycoord+', '+value_zcoord+', ' + value_xcoord_end+', '+value_ycoord_end+', '+value_zcoord_end+ ');\n'
  return [code, Blockly.Python.ORDER_NONE];
};

//Game Function calls
//*******************
//*******************
//*******************
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

