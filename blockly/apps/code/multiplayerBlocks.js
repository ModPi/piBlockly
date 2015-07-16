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

//////
Blockly.Blocks['get_player_name_entity_id'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Player named:");
    this.appendValueInput("playerName")
      .setCheck("String")
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('Returns a specific player');
    this.setColour(20);
  }
};

Blockly.Python['get_player_name_entity_id'] = function(block) {
  var value_playerName = Blockly.Python.valueToCode(block, 'playerName', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.getPlayerEntityId('+value_playerName+')\n';
  return [code, Blockly.Python.ORDER_NONE];
};

//////
Blockly.Blocks['get_player_entity_id'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Player #:")
      .appendField(new Blockly.FieldDropdown([['1', '0'], ['2', '1'], ['3', '2'], ['4', '3']]), "playerNumber");
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setTooltip('Returns a specific player');
      this.setColour(20);
  }
};

Blockly.Python['get_player_entity_id'] = function(block) {
  var value_playerNumber = this.getFieldValue('playerNumber');
  var code = 'mc.getPlayerEntityIds()['+value_playerNumber+']';
  return [code, Blockly.Python.ORDER_NONE];
};

////////
Blockly.Blocks['get_pos_x_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Get X Position of ");
    this.appendValueInput("playerToGet")
        .setCheck("String")
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Returns the X coordinate position of a specific player');
    this.setColour(20);
  }
};

Blockly.Python['get_pos_x_of'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.entity.getPos('+msg+').x';
  return [code, Blockly.Python.ORDER_NONE];
};

////////
Blockly.Blocks['get_pos_y_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Get Y Position of ");
    this.appendValueInput("playerToGet")
        .setCheck("String")
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Returns the Y coordinate position of a specific player');
    this.setColour(20);
  }
};

Blockly.Python['get_pos_y_of'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.entity.getPos('+msg+').y';
  return [code, Blockly.Python.ORDER_NONE];
};

////////
Blockly.Blocks['get_pos_z_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Get Z Position of ");
    this.appendValueInput("playerToGet")
        .setCheck("String");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Returns the Z coordinate position of a specific player');
    this.setColour(20);
  }
};

Blockly.Python['get_pos_z_of'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.entity.getPos('+msg+').z';
  return [code, Blockly.Python.ORDER_NONE];
};

////////
Blockly.Blocks['set_pos_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set position of ");
    this.appendValueInput("playerToGet")
      .setCheck("String");
    this.appendValueInput("xCoord")
      .setCheck("Number")
      .appendField("to coordinates: X ");
    this.appendValueInput("yCoord")
      .setCheck("Number")
      .appendField(" Y ");
    this.appendValueInput("zCoord")
      .setCheck("Number")
      .appendField(" Z ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Moves a specific player to new coordinates');
    this.setColour(20);
  }
};

Blockly.Python['set_pos_of'] = function(block) {
  var value_playerToGet = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var value_xCoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_yCoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zCoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.setPos('+value_playerToGet+', '+value_xCoord+', '+value_yCoord+', '+value_zCoord+');\n';
  return code;
};

////////
Blockly.Blocks['set_tile_pos_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set tile position of ");
    this.appendValueInput("playerToGet")
      .setCheck("String");
    this.appendValueInput("xCoord")
      .setCheck("Number")
      .appendField("to coordinates: X ");
    this.appendValueInput("yCoord")
      .setCheck("Number")
      .appendField(" Y ");
    this.appendValueInput("zCoord")
      .setCheck("Number")
      .appendField(" Z ");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Moves a specific player to new tile');
    this.setColour(20);
  }
};

Blockly.Python['set_tile_pos_of'] = function(block) {
  var value_playerToGet = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var value_xCoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_yCoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zCoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.setTilePos('+value_playerToGet+', '+value_xCoord+', '+value_yCoord+', '+value_zCoord+');\n';
  return code;
};

////////
Blockly.Blocks['get_tile_pos_x_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Get Tile X Position of ");
    this.appendValueInput("playerToGet")
        .setCheck("String")
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Returns the X coordinate Tile position of a specific player');
    this.setColour(20);
  }
};

Blockly.Python['get_tile_pos_x_of'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.entity.getTilePos('+msg+').x';
  return [code, Blockly.Python.ORDER_NONE];
};

////////
Blockly.Blocks['get_tile_pos_y_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Get Tile Y Position of ");
    this.appendValueInput("playerToGet")
        .setCheck("String")
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Returns the Y coordinate Tile position of a specific player');
    this.setColour(20);
  }
};

Blockly.Python['get_tile_pos_y_of'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.entity.getTilePos('+msg+').y';
  return [code, Blockly.Python.ORDER_NONE];
};

////////
Blockly.Blocks['get_tile_pos_z_of'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Get Tile Z Position of ");
    this.appendValueInput("playerToGet")
        .setCheck("String")
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Returns the Z coordinate Tile position of a specific player');
    this.setColour(20);
  }
};

Blockly.Python['get_tile_pos_z_of'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.entity.getTilePos('+msg+').z';
  return [code, Blockly.Python.ORDER_NONE];
};

