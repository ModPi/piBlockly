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


goog.provide('Blockly.Blocks.minecraftPi');

goog.require('Blockly.Blocks');

Blockly.Blocks['post_to_chat'] = {
  init: function() {
    this.appendValueInput("msgToPost")
        .appendField("Message:");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.setColour(120);
  }
};

Blockly.Blocks['get_block'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get Block");
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

Blockly.Blocks['get_blocks'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get Cube of Blocks");
    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField("X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");
    this.appendValueInput("xCoordEnd")
        .setCheck("Number")
        .appendField("X Coord End:");
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

Blockly.Blocks['get_block_with_data'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Get Block with Data");
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

Blockly.Blocks['set_block'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Create Block");
    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField(" X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");
    this.appendValueInput("blockType")
        .setCheck("Material")
        .appendField("Block Type");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Creates a block at the given coordinate!');
  }
}

Blockly.Blocks['set_blocks'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Create Cube of Blocks");
    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField("X Coord:");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y Coord:");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z Coord:");
    this.appendValueInput("xCoordEnd")
        .setCheck("Number")
        .appendField("X Coord End:");
    this.appendValueInput("yCoordEnd")
        .setCheck("Number")
        .appendField("Y Coord End:");
    this.appendValueInput("zCoordEnd")
        .setCheck("Number")
        .appendField("Z Coord End:");
    this.appendValueInput("blockType")
        .setCheck("Material")
        .appendField("Block Type");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Creates a cube of blocks from the first coordinate to the second coordinate.');
  }
}

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
  }
};

Blockly.Blocks['save_checkpoint'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Save Checkpoint");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Saves the current state of the world');
    this.setColour(120);
  }
};

Blockly.Blocks['restore_checkpoint'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Restore Checkpoint");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Restores the previous saved state of the world');
    this.setColour(120);
  }
};

Blockly.Blocks['immutable_setting'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Enable the world to be modified?")
      .appendField(new Blockly.FieldDropdown([['True', 'True'], ['False', 'False']]), "immutableWorld");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Enables / Disables the immutability of the world');
    this.setColour(120);
  }
};

Blockly.Blocks['nametag_setting'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set nametags visible?")
      .appendField(new Blockly.FieldDropdown([['True', 'True'], ['False', 'False']]), "visibleNametags");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Enables / Disables visible player nametags');
    this.setColour(120);
  }
};

Blockly.Blocks['autojump_setting'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set autojump?")
      .appendField(new Blockly.FieldDropdown([['True', 'True'], ['False', 'False']]), "autojump");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Enables / Disables autojump');
    this.setColour(120);
  }
};

Blockly.Blocks['camera_set_normal'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set Camera View Normal for ");
    this.appendValueInput("playerToGet")
        .setCheck("String")
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Sets the camera to normal for a specific player');
    this.setColour(120);
    this.setInputsInline(true);
  }
};

Blockly.Blocks['camera_set_fixed'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set Camera View Fixed");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Sets the camera view to be fixed');
    this.setColour(120);
    this.setInputsInline(true);
  }
};

Blockly.Blocks['camera_set_follow'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set Camera to follow ");
    this.appendValueInput("playerToGet")
        .setCheck("String")
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Sets the camera to follow a specific player');
    this.setColour(120);
    this.setInputsInline(true);
  }
};

Blockly.Blocks['camera_set_position'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Set Camera Position to coordinates ");
    this.appendValueInput("xCoord")
        .setCheck("Number")
        .appendField(" X ");
    this.appendValueInput("yCoord")
        .setCheck("Number")
        .appendField("Y ");
    this.appendValueInput("zCoord")
        .setCheck("Number")
        .appendField("Z ");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('Sets the camera to follow a specific player');
    this.setColour(120);
    this.setInputsInline(true);
  }
};
