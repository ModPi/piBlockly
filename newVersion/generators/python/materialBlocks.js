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

goog.provide('Blockly.Python.materialBlocks');

goog.require('Blockly.Python');

Blockly.Python['material_air'] = function(block) {
  var code = 'block.Block(0)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_stone'] = function(block) {
  var code = 'block.Block(1)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_stone'] = function(block) {
  var code = 'block.Block(2)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_dirt'] = function(block) {
  var code = 'block.Block(3)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_cobblestone'] = function(block) {
  var code = 'block.Block(4)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_wood_planks'] = function(block) {
  var code = 'block.Block(5)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_sapling'] = function(block) {
  var value_saplingType = this.getFieldValue('saplingType');
  var code = 'block.Block(6, '+value_saplingType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_bedrock'] = function(block) {
  var code = 'block.Block(7)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_water_flowing'] = function(block) {
  var code = 'block.Block(8)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_water_stationary'] = function(block) {
  var code = 'block.Block(9)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_lava_flowing'] = function(block) {
  var code = 'block.Block(10)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_lava_stationary'] = function(block) {
  var code = 'block.Block(11)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_sand'] = function(block) {
  var code = 'block.Block(12)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_gravel'] = function(block) {
  var code = 'block.Block(13)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_gold_ore'] = function(block) {
  var code = 'block.Block(14)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_iron_ore'] = function(block) {
  var code = 'block.Block(15)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_coal_ore'] = function(block) {
  var code = 'block.Block(16)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_wood'] = function(block) {
  var value_woodType = this.getFieldValue('woodType');
  var code = 'block.Block(17, '+value_woodType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_leaves'] = function(block) {
  var code = 'block.Block(18)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_glass'] = function(block) {
  var code = 'block.Block(20)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_lapis_lazuli_ore'] = function(block) {
  var code = 'block.Block(21)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_lapis_lazuli_block'] = function(block) {
  var code = 'block.Block(22)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_sandstone'] = function(block) {
  var code = 'block.Block(24)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_bed'] = function(block) {
  var code = 'block.Block(26)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_cobweb'] = function(block) {
  var code = 'block.Block(30)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_grass_tall'] = function(block) {
  var value_grass_tallType = this.getFieldValue('grass_tallType');
  var code = 'block.Block(31, '+value_grass_tallType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_wool'] = function(block) {
  var value_woolColor = this.getFieldValue('woolColor');
  var code = 'block.Block(35, '+value_woolColor+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_flower_yellow'] = function(block) {
  var code = 'block.Block(37)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_flower_cyan'] = function(block) {
  var code = 'block.Block(38)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_mushroom_brown'] = function(block) {
  var code = 'block.Block(39)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_mushroom_red'] = function(block) {
  var code = 'block.Block(40)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_gold_block'] = function(block) {
  var code = 'block.Block(41)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_iron_block'] = function(block) {
  var code = 'block.Block(42)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_stone_slab_double'] = function(block) {
  var value_stone_slabType = this.getFieldValue('stone_slabType');
  var code = 'block.Block(43, '+value_stone_slabType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_stone_slab'] = function(block) {
  var value_stone_slabType = this.getFieldValue('stone_slabType');
  var code = 'block.Block(44, '+value_stone_slabType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_brick_block'] = function(block) {
  var code = 'block.Block(45)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_tnt'] = function(block) {
  var value_tntType = this.getFieldValue('tntType');
  var code = 'block.Block(46, '+value_tntType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_bookshelf'] = function(block) {
  var code = 'block.Block(47)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_moss_stone'] = function(block) {
  var code = 'block.Block(48)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_obsidian'] = function(block) {
  var code = 'block.Block(49)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_obsidian'] = function(block) {
  var code = 'block.Block(49)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_torch'] = function(block) {
  var value_torchType = this.getFieldValue('torchType');
  var code = 'block.Block(50, '+value_torchType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_fire'] = function(block) {
  var code = 'block.Block(51)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_stairs_wood'] = function(block) {
  var code = 'block.Block(53)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_chest'] = function(block) {
  var code = 'block.Block(54)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_diamond_ore'] = function(block) {
  var code = 'block.Block(56)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_diamond_block'] = function(block) {
  var code = 'block.Block(57)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_crafting_table'] = function(block) {
  var code = 'block.Block(58)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_farmland'] = function(block) {
  var code = 'block.Block(60)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_furnace_inactive'] = function(block) {
  var code = 'block.Block(61)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_furnace_active'] = function(block) {
  var code = 'block.Block(62)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_door_wood'] = function(block) {
  var code = 'block.Block(64)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_ladder'] = function(block) {
  var code = 'block.Block(65)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_stairs_cobblestone'] = function(block) {
  var code = 'block.Block(67)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_door_iron'] = function(block) {
  var code = 'block.Block(71)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_redstone_ore'] = function(block) {
  var code = 'block.Block(73)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_snow'] = function(block) {
  var code = 'block.Block(78)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_ice'] = function(block) {
  var code = 'block.Block(79)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_snow_block'] = function(block) {
  var code = 'block.Block(80)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_cactus'] = function(block) {
  var code = 'block.Block(81)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_clay'] = function(block) {
  var code = 'block.Block(82)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_sugar_cane'] = function(block) {
  var code = 'block.Block(83)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_fence'] = function(block) {
  var code = 'block.Block(85)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_glowstone_block'] = function(block) {
  var code = 'block.Block(89)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_bedrock_invisible'] = function(block) {
  var code = 'block.Block(95)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_stone_brick'] = function(block) {
  var value_stone_brickType = this.getFieldValue('stone_brickType');
  var code = 'block.Block(98, '+value_stone_brickType+')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_glass_pane'] = function(block) {
  var code = 'block.Block(102)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_melon'] = function(block) {
  var code = 'block.Block(103)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_fence_gate'] = function(block) {
  var code = 'block.Block(107)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_glowing_obsidian'] = function(block) {
  var code = 'block.Block(246)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['material_nether_reactor_core'] = function(block) {
  var code = 'block.Block(247)';
  return [code, Blockly.Python.ORDER_NONE];
};

