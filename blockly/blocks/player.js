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


goog.provide('Blockly.Blocks.player');

goog.require('Blockly.Blocks');

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

Blockly.Blocks['get_single_player_entity_id'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Player: ME")
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setTooltip('Returns the ID of a player');
      this.setColour(230);
  }
};