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

goog.provide('Blockly.Python.minecraftPi');

Blockly.Python['post_to_chat'] = function(block) {
  var msg = Blockly.Python.valueToCode(block, 'msgToPost', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.postToChat('+msg+')\n';
  return code;
};

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
  var code = 'mc.getBlock('+value_xcoord+', '+value_ycoord+', '+value_zcoord+')\n'
  return [code, Blockly.Python.ORDER_NONE];
};

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
  var code = 'mc.getBlocks('+value_xcoord+', '+value_ycoord+', '+value_zcoord+', ' + value_xcoord_end+', '+value_ycoord_end+', '+value_zcoord_end+ ')\n'
  return [code, Blockly.Python.ORDER_NONE];
};

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

  var code = 'mc.getBlockWithData(' + value_xcoord + ', '+value_ycoord + ', ' + value_zcoord + ')\n'
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['set_block'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);
  var value_blockType = Blockly.Python.valueToCode(block, 'blockType', Blockly.Python.ORDER_ATOMIC);

  if(!value_xcoord){
    value_xcoord = 0;
  }
  if(!value_ycoord){
    value_ycoord = 0;
  }
  if(!value_zcoord){
    value_zcoord = 0;
  }

  var code = 'mc.setBlock(' + value_xcoord + ', '+value_ycoord + ', ' + value_zcoord + ', '+ value_blockType +')\n'
  return code;
};

Blockly.Python['set_blocks'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);

  var value_xcoord_end = Blockly.Python.valueToCode(block, 'xCoordEnd', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord_end = Blockly.Python.valueToCode(block, 'yCoordEnd', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord_end = Blockly.Python.valueToCode(block, 'zCoordEnd', Blockly.Python.ORDER_ATOMIC);
  var value_blockType = Blockly.Python.valueToCode(block, 'blockType', Blockly.Python.ORDER_ATOMIC);

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
  var code = 'mc.setBlocks('+value_xcoord+', '+value_ycoord+', '+value_zcoord+', ' + value_xcoord_end+', '+value_ycoord_end+', '+value_zcoord_end+ ', '+value_blockType+')\n'
  return code;
};

//Game Function calls
//*******************
//*******************
//*******************

Blockly.Python['get_height'] = function(block) {
  var value_XCoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_YCoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);

  if(!value_XCoord){
  	value_XCoord = 0;
  }
  if(!value_YCoord){
  	value_YCoord = 0;
  }

  var code = 'mc.getHeight('+value_XCoord+', '+value_YCoord+')\n';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['save_checkpoint'] = function(block) {
  var code = 'mc.saveCheckpoint()\n';
  return code;
};

Blockly.Python['restore_checkpoint'] = function(block) {
  var code = 'mc.restoreCheckpoint()\n';
  return code;
};

Blockly.Python['immutable_setting'] = function(block) {
  var value_immutableWorld = this.getFieldValue('immutableWorld');
  var code = 'mc.setting("world_immutable", '+ value_immutableWorld +')\n';
  return code;
};

Blockly.Python['nametag_setting'] = function(block) {
  var value_visibleNametags = this.getFieldValue('visibleNametags');
  var code = 'mc.setting("nametags_visible", '+ value_visibleNametags +')\n';
  return code;
};

Blockly.Python['autojump_setting'] = function(block) {
  var value_autojump = this.getFieldValue('autojump');
  var code = 'mc.player.setting("autojump", '+ value_autojump +')\n';
  return code;
};

Blockly.Python['camera_set_normal'] = function(block) {
  var value_playerToGet = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.camera.setNormal('+value_playerToGet+')\n';
  return code;
};

Blockly.Python['camera_set_fixed'] = function(block) {
  var value_autojump = this.getFieldValue('autojump');
  var code = 'mc.camera.setFixed()\n';
  return code;
};

Blockly.Python['camera_set_follow'] = function(block) {
  var value_playerToGet = Blockly.Python.valueToCode(block, 'playerToGet', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.camera.setFollow('+value_playerToGet+')\n';
  return code;
};

Blockly.Python['camera_set_position'] = function(block) {
  var value_xcoord = Blockly.Python.valueToCode(block, 'xCoord', Blockly.Python.ORDER_ATOMIC);
  var value_ycoord = Blockly.Python.valueToCode(block, 'yCoord', Blockly.Python.ORDER_ATOMIC);
  var value_zcoord = Blockly.Python.valueToCode(block, 'zCoord', Blockly.Python.ORDER_ATOMIC);
  var code = 'mc.camera.setPos('+value_xcoord+', '+value_ycoord+', '+value_zcoord+')\n';
  return code;
};

