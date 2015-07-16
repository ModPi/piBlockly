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
Blockly.Blocks['get_pos_x'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get My X");
    this.setColour(230);
    this.setOutput(true, 'Number');
    this.setTooltip('Gets the player\'s x coordinate.');
  }
}
Blockly.Python['get_pos_x'] = function(block) {
  var code = 'mc.player.getPos().x'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['get_pos_y'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get My Y");
    this.setColour(230);
    this.setOutput(true, 'Number');
    this.setTooltip('Gets the player\'s y coordinate.');
  }
}
Blockly.Python['get_pos_y'] = function(block) {
  var code = 'mc.player.getPos().y'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['get_pos_z'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get My Z");
    this.setColour(230);
    this.setOutput(true, 'Number');
    this.setTooltip('Gets the player\'s z coordinate.');
  }
}
Blockly.Python['get_pos_z'] = function(block) {
  var code = 'mc.player.getPos().z'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['get_tile_pos_x'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get My X Tile");
    this.setColour(230);
    this.setOutput(true, 'Number');
    this.setTooltip('Gets the player\'s x coordinate.');
  }
}
Blockly.Python['get_tile_pos_x'] = function(block) {
  var code = 'mc.player.getTilePos().x'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['get_tile_pos_y'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get My Y Tile");
    this.setColour(230);
    this.setOutput(true, 'Number');
    this.setTooltip('Gets the player\'s y coordinate.');
  }
}
Blockly.Python['get_tile_pos_y'] = function(block) {
  var code = 'mc.player.getTilePos().y'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['get_tile_pos_z'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get My Z Tile");
    this.setColour(230);
    this.setOutput(true, 'Number');
    this.setTooltip('Gets the player\'s z coordinate.');
  }
}
Blockly.Python['get_tile_pos_z'] = function(block) {
  var code = 'mc.player.getTilePos().z'
  return [code, Blockly.Python.ORDER_NONE];
};

/////////
Blockly.Blocks['set_pos'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Set My Position");
    this.setColour(230);
    this.setNextStatement(true);
    this.setPreviousStatement(true);
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
    this.setOutput(false);
    this.setTooltip('Sets player position to the given coordinates.');
  }
}

Blockly.Python['set_pos'] = function(block) {
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
  var code = 'mc.player.setPos(' + value_xcoord + ', '+value_ycoord + ', ' + value_zcoord + ');\n'
  return code;
};

/////////
Blockly.Blocks['set_tile_pos'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Set My Tile Position");
    this.setColour(230);
    this.setNextStatement(true);
    this.setPreviousStatement(true);
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
    this.setOutput(false);
    this.setTooltip('Sets player position to the given coordinates.');
  }
}

Blockly.Python['set_tile_pos'] = function(block) {
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
  var code = 'mc.player.setTilePos(' + value_xcoord + ', '+value_ycoord + ', ' + value_zcoord + ');\n'
  return code;
};


