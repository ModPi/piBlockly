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

goog.provide('Blockly.Python.player');

Blockly.Python['get_pos_x'] = function(block) {
  var code = 'mc.player.getPos().x'
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_pos_y'] = function(block) {
  var code = 'mc.player.getPos().y'
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_pos_z'] = function(block) {
  var code = 'mc.player.getPos().z'
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_tile_pos_x'] = function(block) {
  var code = 'mc.player.getTilePos().x'
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_tile_pos_y'] = function(block) {
  var code = 'mc.player.getTilePos().y'
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_tile_pos_z'] = function(block) {
  var code = 'mc.player.getTilePos().z'
  return [code, Blockly.Python.ORDER_NONE];
};

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

Blockly.Python['get_single_player_entity_id'] = function(block) {
  var value_playerNumber = this.getFieldValue('playerNumber');
  var code = 'mc.getPlayerEntityIds()[0]';
  return [code, Blockly.Python.ORDER_NONE];
};
