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

var dummytest;


//A Stupid hack to fix broken NodeList shit in Safari...
Blockly.Xml.domToWorkspace = function (workspace, xml) {
  var seen_list = []
  if (Blockly.RTL) {
    var width = workspace.getMetrics().viewWidth;
  }
  for (var x = 0, xmlChild; xmlChild = xml.childNodes[x]; x++) {
    if(seen_list.indexOf($(xmlChild).attr("id")) >= 0) continue;
    seen_list.push($(xmlChild).attr("id"))
    if (xmlChild.nodeName.toLowerCase() == 'block') {
      var block = Blockly.Xml.domToBlock(workspace, xmlChild);
      var blockX = parseInt(xmlChild.getAttribute('x'), 10);
      var blockY = parseInt(xmlChild.getAttribute('y'), 10);
      if (!isNaN(blockX) && !isNaN(blockY)) {
        block.moveBy(Blockly.RTL ? width - blockX : blockX, blockY);
      }
    }
  }
}


//Hacky override to alphabetise the variables...
var old_all_vars = Blockly.Variables.allVariables;

Blockly.Variables.oldAllVariables = old_all_vars;

Blockly.Variables.allVariables = function(opt){
  var vars = this.oldAllVariables(opt);
  return vars.sort();
}



//Overwriting workspaceToCode so we can control the order of the generated javascript functions.
Blockly.Generator.prototype.workspaceToCodeNoImports = function() {
  var code = [];
  this.init();
  var blocks = Blockly.mainWorkspace.getTopBlocks(true);

  blocks.sort(function(f,s){
      var f_id = f.getFieldValue("NAME") || f.getFieldValue("LIB") || f.getFieldValue("FUN")
      var s_id = s.getFieldValue("NAME") || s.getFieldValue("LIB") || s.getFieldValue("FUN")

      if(f_id > s_id)
        return 1
      else
        return -1
  }) 


  for (var x = 0, block; block = blocks[x]; x++) {
    var line = ""
    if(block.type != "import")
      line = this.blockToCode(block);
    else
      line = "import '"+block.getFieldValue("LIB")+"' \n";

    if (goog.isArray(line)) {
      // Value blocks return tuples of code and operator order.
      // Top-level blocks don't care about operator order.
      line = line[0];
    }
    if (line) {
      if (block.outputConnection && this.scrubNakedValue) {
        // This block is a naked value.  Ask the language's code generator if
        // it wants to append a semicolon, or something.
        line = this.scrubNakedValue(line);
      }
      code.push(line);
    }
  }
  code = code.join('\n');  // Blank line between each section.
  code = this.finish(code);
  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  return code;
};

//Overwriting workspaceToCode so we can control the order of the generated javascript functions.
Blockly.Generator.prototype.workspaceToCodeAlpha = function(workspace) {
  if(!workspace)
    workspace = Blockly.mainWorkspace


  var code = [];
  this.init();
  var blocks = workspace.getTopBlocks(true);

  blocks.sort(function(f,s){
      if(f.getFieldValue("NAME") > s.getFieldValue("NAME"))
        return 1
      else
        return -1
  }) 


  for (var x = 0, block; block = blocks[x]; x++) {
    var line = this.blockToCode(block);
    if (goog.isArray(line)) {
      // Value blocks return tuples of code and operator order.
      // Top-level blocks don't care about operator order.
      line = line[0];
    }
    if (line) {
      if (block.outputConnection && this.scrubNakedValue) {
        // This block is a naked value.  Ask the language's code generator if
        // it wants to append a semicolon, or something.
        line = this.scrubNakedValue(line);
      }
      code.push(line);
    }
  }
  code = code.join('\n');  // Blank line between each section.
  code = this.finish(code);
  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  return code;
};

Blockly.Generator.prototype.evalToJson = function() {
    var js = Blockly.JavaScript.workspaceToCodeAlpha()

    if(js.indexOf("eval") >= 0)
    {
      alert("Code contained 'eval' and is potentially unsafe.  Will not run it.");
      return;
    }

    var to_eval = "new function(){"+ js.replace(/function main/, "this.main = function") +"}"
    var res = eval(to_eval)
    res.main()

    return JSON.stringify(res)
}


//Override name generation so we can keep the dot in the namespace of imported functions
Blockly.Names.prototype.safeName_ = function(name) {
  for(var key in imports)
  {
    if(name.indexOf(key) != -1)
      return name.replace("-","_") 
  }

  if (!name) {
    name = 'unnamed';
  } else {
    // Unfortunately names in non-latin characters will look like
    // _E9_9F_B3_E4_B9_90 which is pretty meaningless.
    name = encodeURI(name.replace(/ /g, '_')).replace(/[^\w]/g, '_');
    // Most languages don't allow names with leading numbers.
    if ('0123456789'.indexOf(name[0]) != -1) {
      name = 'my_' + name;
    }
  }
  return name;
};


//Override functions flyout to accomodate imported functions
Blockly.Procedures.flyoutCategory = function(blocks, gaps, margin, workspace) {
  if (Blockly.Blocks['procedures_defnoreturn']) {
    var block = Blockly.Block.obtain(workspace, 'procedures_defnoreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }
  if (Blockly.Blocks['procedures_defreturn']) {
    var block = Blockly.Block.obtain(workspace, 'procedures_defreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }
  if (Blockly.Blocks['procedures_ifreturn']) {
    var block = Blockly.Block.obtain(workspace, 'procedures_ifreturn');
    block.initSvg();
    blocks.push(block);
    gaps.push(margin * 2);
  }
  if (gaps.length) {
    // Add slightly larger gap between system blocks and user calls.
    gaps[gaps.length - 1] = margin * 3;
  }

  function populateProcedures(procedureList, templateName) {
    for (var x = 0; x < procedureList.length; x++) {
      var block = Blockly.Block.obtain(workspace, templateName);
      block.setFieldValue(procedureList[x][0], 'NAME');
      var tempIds = [];
      for (var t = 0; t < procedureList[x][1].length; t++) {
        tempIds[t] = 'ARG' + t;
      }
      block.setProcedureParameters(procedureList[x][1], tempIds);
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }

  var tuple = Blockly.Procedures.allProcedures();
  populateProcedures(tuple[0], 'procedures_callnoreturn');
  populateProcedures(tuple[1], 'procedures_callreturn');

  
  for(var key in imports){
    var imp = imports[key]

    try{
      //Find the exported functions
      var xml = imp.split("<SEP>")[0]
      var dom = Blockly.Xml.textToDom(xml)
      var all_blocks = dom.getElementsByTagName("block")
      
      var exports = []
      for(var i = 0; i < all_blocks.length; i++)
      {
        var current = all_blocks[i]
        if(current.attributes["type"].value == "export")
        {
          exports.push(current.children[0].innerHTML)
        }
      }

      //Now loop through all the functions to find the ones that were exported
      for(var i = 0; i < all_blocks.length; i++)
      {
        var current = all_blocks[i]

        

        if(current.attributes["type"].value == "procedures_defnoreturn")
        {
          if(exports.indexOf(current.children[1].innerHTML) == -1)
            continue;
          var name = key + "." + current.children[1].innerHTML;
          var param_nodes = current.children[0].children
          var param_names = [];
          for(var j = 0; j < param_nodes.length; j++){
            param_names.push(param_nodes[j].attributes["name"].value);
          } 
          populateProcedures([[name, param_names, false]], 'procedures_callnoreturn');
        } else if (current.attributes["type"].value == "procedures_defreturn"){
          if(exports.indexOf(current.children[1].innerHTML) == -1)
            continue;
          var name = key + "." + current.children[1].innerHTML;
          var param_nodes = current.children[0].children
          var param_names = [];
          for(var j = 0; j < param_nodes.length; j++){
            param_names.push(param_nodes[j].attributes["name"].value);
          } 
          populateProcedures([[name, param_names, true]], 'procedures_callreturn');
        }
      }
  
    }catch(e){
      continue;
    } 
  } 


/*
        var arr = []
        arr.push(name)
        arr.push(param_names)

        if(true){
          arr.push(false)
          populateProcedures(arr, "procedures_callnoreturn")
        } else {
          arr.push(true)
          populateProcedures(arr, "procedures_callreturn")
        }
*/

  //Put function calls to exported functions into the toolbox...

  
};

var BUKKIT_BLOCKS = [["air","blocks.air"], ["grass", "blocks.grass"], ["dirt", "blocks.dirt"], ["stone", "blocks.stone"],
            ["activator_rail", "Material.ACTIVATOR_RAIL"],
["air", "Material.AIR"],
["anvil", "Material.ANVIL"],
["apple", "Material.APPLE"],
["arrow", "Material.ARROW"],
["baked_potato", "Material.BAKED_POTATO"],
["beacon", "Material.BEACON"],
["bed", "Material.BED"],
["bed_block", "Material.BED_BLOCK"],
["bedrock", "Material.BEDROCK"],
["birch_wood_stairs", "Material.BIRCH_WOOD_STAIRS"],
["blaze_powder", "Material.BLAZE_POWDER"],
["blaze_rod", "Material.BLAZE_ROD"],
["boat", "Material.BOAT"],
["bone", "Material.BONE"],
["book", "Material.BOOK"],
["book_and_quill", "Material.BOOK_AND_QUILL"],
["bookshelf", "Material.BOOKSHELF"],
["bow", "Material.BOW"],
["bowl", "Material.BOWL"],
["bread", "Material.BREAD"],
["brewing_stand", "Material.BREWING_STAND"],
["brewing_stand_item", "Material.BREWING_STAND_ITEM"],
["brick", "Material.BRICK"],
["brick_stairs", "Material.BRICK_STAIRS"],
["brown_mushroom", "Material.BROWN_MUSHROOM"],
["bucket", "Material.BUCKET"],
["burning_furnace", "Material.BURNING_FURNACE"],
["cactus", "Material.CACTUS"],
["cake", "Material.CAKE"],
["cake_block", "Material.CAKE_BLOCK"],
["carpet", "Material.CARPET"],
["carrot_item", "Material.CARROT_ITEM"],
["carrot_stick", "Material.CARROT_STICK"],
["cauldron", "Material.CAULDRON"],
["cauldron_item", "Material.CAULDRON_ITEM"],
["chainmail_boots", "Material.CHAINMAIL_BOOTS"],
["chainmail_chestplate", "Material.CHAINMAIL_CHESTPLATE"],
["chainmail_helmet", "Material.CHAINMAIL_HELMET"],
["chainmail_leggings", "Material.CHAINMAIL_LEGGINGS"],
["chest", "Material.CHEST"],
["clay", "Material.CLAY"],
["clay_ball", "Material.CLAY_BALL"],
["clay_brick", "Material.CLAY_BRICK"],
["coal", "Material.COAL"],
["coal_block", "Material.COAL_BLOCK"],
["coal_ore", "Material.COAL_ORE"],
["cobble_wall", "Material.COBBLE_WALL"],
["cobblestone", "Material.COBBLESTONE"],
["cobblestone_stairs", "Material.COBBLESTONE_STAIRS"],
["cocoa", "Material.COCOA"],
["command", "Material.COMMAND"],
["compass", "Material.COMPASS"],
["cooked_beef", "Material.COOKED_BEEF"],
["cooked_chicken", "Material.COOKED_CHICKEN"],
["cooked_fish", "Material.COOKED_FISH"],
["cookie", "Material.COOKIE"],
["crafting_table", "Material.WORKBENCH"],
["crops", "Material.CROPS"],
["daylight_detector", "Material.DAYLIGHT_DETECTOR"],
["dead_bush", "Material.DEAD_BUSH"],
["detector_rail", "Material.DETECTOR_RAIL"],
["diamond", "Material.DIAMOND"],
["diamond_axe", "Material.DIAMOND_AXE"],
["diamond_barding", "Material.DIAMOND_BARDING"],
["diamond_block", "Material.DIAMOND_BLOCK"],
["diamond_boots", "Material.DIAMOND_BOOTS"],
["diamond_chestplate", "Material.DIAMOND_CHESTPLATE"],
["diamond_helmet", "Material.DIAMOND_HELMET"],
["diamond_hoe", "Material.DIAMOND_HOE"],
["diamond_leggings", "Material.DIAMOND_LEGGINGS"],
["diamond_ore", "Material.DIAMOND_ORE"],
["diamond_pickaxe", "Material.DIAMOND_PICKAXE"],
["diamond_spade", "Material.DIAMOND_SPADE"],
["diamond_sword", "Material.DIAMOND_SWORD"],
["diode", "Material.DIODE"],
["diode_block_off", "Material.DIODE_BLOCK_OFF"],
["diode_block_on", "Material.DIODE_BLOCK_ON"],
["dirt", "Material.DIRT"],
["dispenser", "Material.DISPENSER"],
["double_step", "Material.DOUBLE_STEP"],
["dragon_egg", "Material.DRAGON_EGG"],
["dropper", "Material.DROPPER"],
["egg", "Material.EGG"],
["emerald", "Material.EMERALD"],
["emerald_block", "Material.EMERALD_BLOCK"],
["emerald_ore", "Material.EMERALD_ORE"],
["empty_map", "Material.EMPTY_MAP"],
["enchanted_book", "Material.ENCHANTED_BOOK"],
["enchantment_table", "Material.ENCHANTMENT_TABLE"],
["ender_chest", "Material.ENDER_CHEST"],
["ender_pearl", "Material.ENDER_PEARL"],
["ender_portal", "Material.ENDER_PORTAL"],
["ender_portal_frame", "Material.ENDER_PORTAL_FRAME"],
["ender_stone", "Material.ENDER_STONE"],
["exp_bottle", "Material.EXP_BOTTLE"],
["explosive_minecart", "Material.EXPLOSIVE_MINECART"],
["eye_of_ender", "Material.EYE_OF_ENDER"],
["feather", "Material.FEATHER"],
["fence", "Material.FENCE"],
["fence_gate", "Material.FENCE_GATE"],
["fermented_spider_eye", "Material.FERMENTED_SPIDER_EYE"],
["fire", "Material.FIRE"],
["fireball", "Material.FIREBALL"],
["firework", "Material.FIREWORK"],
["firework_charge", "Material.FIREWORK_CHARGE"],
["fishing_rod", "Material.FISHING_ROD"],
["flint", "Material.FLINT"],
["flint_and_steel", "Material.FLINT_AND_STEEL"],
["flower_pot", "Material.FLOWER_POT"],
["flower_pot_item", "Material.FLOWER_POT_ITEM"],
["furnace", "Material.FURNACE"],
["ghast_tear", "Material.GHAST_TEAR"],
["glass", "Material.GLASS"],
["glass_bottle", "Material.GLASS_BOTTLE"],
["glowing_redstone_ore", "Material.GLOWING_REDSTONE_ORE"],
["glowstone", "Material.GLOWSTONE"],
["glowstone_dust", "Material.GLOWSTONE_DUST"],
["gold_axe", "Material.GOLD_AXE"],
["gold_barding", "Material.GOLD_BARDING"],
["gold_block", "Material.GOLD_BLOCK"],
["gold_boots", "Material.GOLD_BOOTS"],
["gold_chestplate", "Material.GOLD_CHESTPLATE"],
["gold_helmet", "Material.GOLD_HELMET"],
["gold_hoe", "Material.GOLD_HOE"],
["gold_ingot", "Material.GOLD_INGOT"],
["gold_leggings", "Material.GOLD_LEGGINGS"],
["gold_nugget", "Material.GOLD_NUGGET"],
["gold_ore", "Material.GOLD_ORE"],
["gold_pickaxe", "Material.GOLD_PICKAXE"],
["gold_plate", "Material.GOLD_PLATE"],
["gold_record", "Material.GOLD_RECORD"],
["gold_spade", "Material.GOLD_SPADE"],
["gold_sword", "Material.GOLD_SWORD"],
["golden_apple", "Material.GOLDEN_APPLE"],
["golden_carrot", "Material.GOLDEN_CARROT"],
["grass", "Material.GRASS"],
["gravel", "Material.GRAVEL"],
["green_record", "Material.GREEN_RECORD"],
["grilled_pork", "Material.GRILLED_PORK"],
["hard_clay", "Material.HARD_CLAY"],
["hay_block", "Material.HAY_BLOCK"],
["hopper", "Material.HOPPER"],
["hopper_minecart", "Material.HOPPER_MINECART"],
["huge_mushroom_1", "Material.HUGE_MUSHROOM_1"],
["huge_mushroom_2", "Material.HUGE_MUSHROOM_2"],
["ice", "Material.ICE"],
["ink_sack", "Material.INK_SACK"],
["iron_axe", "Material.IRON_AXE"],
["iron_barding", "Material.IRON_BARDING"],
["iron_block", "Material.IRON_BLOCK"],
["iron_boots", "Material.IRON_BOOTS"],
["iron_chestplate", "Material.IRON_CHESTPLATE"],
["iron_door", "Material.IRON_DOOR"],
["iron_door_block", "Material.IRON_DOOR_BLOCK"],
["iron_fence", "Material.IRON_FENCE"],
["iron_helmet", "Material.IRON_HELMET"],
["iron_hoe", "Material.IRON_HOE"],
["iron_ingot", "Material.IRON_INGOT"],
["iron_leggings", "Material.IRON_LEGGINGS"],
["iron_ore", "Material.IRON_ORE"],
["iron_pickaxe", "Material.IRON_PICKAXE"],
["iron_plate", "Material.IRON_PLATE"],
["iron_spade", "Material.IRON_SPADE"],
["iron_sword", "Material.IRON_SWORD"],
["item_frame", "Material.ITEM_FRAME"],
["jack_o_lantern", "Material.JACK_O_LANTERN"],
["jukebox", "Material.JUKEBOX"],
["jungle_wood_stairs", "Material.JUNGLE_WOOD_STAIRS"],
["ladder", "Material.LADDER"],
["lapis_block", "Material.LAPIS_BLOCK"],
["lapis_ore", "Material.LAPIS_ORE"],
["lava", "Material.LAVA"],
["lava_bucket", "Material.LAVA_BUCKET"],
["leash", "Material.LEASH"],
["leather", "Material.LEATHER"],
["leather_boots", "Material.LEATHER_BOOTS"],
["leather_chestplate", "Material.LEATHER_CHESTPLATE"],
["leather_helmet", "Material.LEATHER_HELMET"],
["leather_leggings", "Material.LEATHER_LEGGINGS"],
["leaves", "Material.LEAVES"],
["lever", "Material.LEVER"],
["locked_chest", "Material.LOCKED_CHEST"],
["log", "Material.LOG"],
["long_grass", "Material.LONG_GRASS"],
["magma_cream", "Material.MAGMA_CREAM"],
["map", "Material.MAP"],
["melon", "Material.MELON"],
["melon_block", "Material.MELON_BLOCK"],
["melon_seeds", "Material.MELON_SEEDS"],
["melon_stem", "Material.MELON_STEM"],
["milk_bucket", "Material.MILK_BUCKET"],
["minecart", "Material.MINECART"],
["mob_spawner", "Material.MOB_SPAWNER"],
["monster_egg", "Material.MONSTER_EGG"],
["monster_eggs", "Material.MONSTER_EGGS"],
["mossy_cobblestone", "Material.MOSSY_COBBLESTONE"],
["mushroom_soup", "Material.MUSHROOM_SOUP"],
["mycel", "Material.MYCEL"],
["name_tag", "Material.NAME_TAG"],
["nether_brick", "Material.NETHER_BRICK"],
["nether_brick_item", "Material.NETHER_BRICK_ITEM"],
["nether_brick_stairs", "Material.NETHER_BRICK_STAIRS"],
["nether_fence", "Material.NETHER_FENCE"],
["nether_stalk", "Material.NETHER_STALK"],
["nether_star", "Material.NETHER_STAR"],
["nether_warts", "Material.NETHER_WARTS"],
["netherrack", "Material.NETHERRACK"],
["note_block", "Material.NOTE_BLOCK"],
["obsidian", "Material.OBSIDIAN"],
["painting", "Material.PAINTING"],
["paper", "Material.PAPER"],
["piston_base", "Material.PISTON_BASE"],
["piston_extension", "Material.PISTON_EXTENSION"],
["piston_moving_piece", "Material.PISTON_MOVING_PIECE"],
["piston_sticky_base", "Material.PISTON_STICKY_BASE"],
["poisonous_potato", "Material.POISONOUS_POTATO"],
["pork", "Material.PORK"],
["portal", "Material.PORTAL"],
["potato", "Material.POTATO"],
["potato_item", "Material.POTATO_ITEM"],
["potion", "Material.POTION"],
["powered_minecart", "Material.POWERED_MINECART"],
["powered_rail", "Material.POWERED_RAIL"],
["pumpkin", "Material.PUMPKIN"],
["pumpkin_pie", "Material.PUMPKIN_PIE"],
["pumpkin_seeds", "Material.PUMPKIN_SEEDS"],
["pumpkin_stem", "Material.PUMPKIN_STEM"],
["quartz", "Material.QUARTZ"],
["quartz_block", "Material.QUARTZ_BLOCK"],
["quartz_ore", "Material.QUARTZ_ORE"],
["quartz_stairs", "Material.QUARTZ_STAIRS"],
["rails", "Material.RAILS"],
["raw_beef", "Material.RAW_BEEF"],
["raw_chicken", "Material.RAW_CHICKEN"],
["raw_fish", "Material.RAW_FISH"],
["record_10", "Material.RECORD_10"],
["record_11", "Material.RECORD_11"],
["record_12", "Material.RECORD_12"],
["record_3", "Material.RECORD_3"],
["record_4", "Material.RECORD_4"],
["record_5", "Material.RECORD_5"],
["record_6", "Material.RECORD_6"],
["record_7", "Material.RECORD_7"],
["record_8", "Material.RECORD_8"],
["record_9", "Material.RECORD_9"],
["red_mushroom", "Material.RED_MUSHROOM"],
["red_rose", "Material.RED_ROSE"],
["redstone", "Material.REDSTONE"],
["redstone_block", "Material.REDSTONE_BLOCK"],
["redstone_comparator", "Material.REDSTONE_COMPARATOR"],
["redstone_comparator_off", "Material.REDSTONE_COMPARATOR_OFF"],
["redstone_comparator_on", "Material.REDSTONE_COMPARATOR_ON"],
["redstone_lamp_off", "Material.REDSTONE_LAMP_OFF"],
["redstone_lamp_on", "Material.REDSTONE_LAMP_ON"],
["redstone_ore", "Material.REDSTONE_ORE"],
["redstone_torch_off", "Material.REDSTONE_TORCH_OFF"],
["redstone_torch_on", "Material.REDSTONE_TORCH_ON"],
["redstone_wire", "Material.REDSTONE_WIRE"],
["rotten_flesh", "Material.ROTTEN_FLESH"],
["saddle", "Material.SADDLE"],
["sand", "Material.SAND"],
["sandstone", "Material.SANDSTONE"],
["sandstone_stairs", "Material.SANDSTONE_STAIRS"],
["sapling", "Material.SAPLING"],
["seeds", "Material.SEEDS"],
["shears", "Material.SHEARS"],
["sign", "Material.SIGN"],
["sign_post", "Material.SIGN_POST"],
["skull", "Material.SKULL"],
["skull_item", "Material.SKULL_ITEM"],
["slime_ball", "Material.SLIME_BALL"],
["smooth_brick", "Material.SMOOTH_BRICK"],
["smooth_stairs", "Material.SMOOTH_STAIRS"],
["snow", "Material.SNOW"],
["snow_ball", "Material.SNOW_BALL"],
["snow_block", "Material.SNOW_BLOCK"],
["soil", "Material.SOIL"],
["soul_sand", "Material.SOUL_SAND"],
["speckled_melon", "Material.SPECKLED_MELON"],
["spider_eye", "Material.SPIDER_EYE"],
["sponge", "Material.SPONGE"],
["spruce_wood_stairs", "Material.SPRUCE_WOOD_STAIRS"],
["stained_clay", "Material.STAINED_CLAY"],
["stationary_lava", "Material.STATIONARY_LAVA"],
["stationary_water", "Material.STATIONARY_WATER"],
["step", "Material.STEP"],
["stick", "Material.STICK"],
["stone", "Material.STONE"],
["stone_axe", "Material.STONE_AXE"],
["stone_button", "Material.STONE_BUTTON"],
["stone_hoe", "Material.STONE_HOE"],
["stone_pickaxe", "Material.STONE_PICKAXE"],
["stone_plate", "Material.STONE_PLATE"],
["stone_spade", "Material.STONE_SPADE"],
["stone_sword", "Material.STONE_SWORD"],
["storage_minecart", "Material.STORAGE_MINECART"],
["string", "Material.STRING"],
["sugar", "Material.SUGAR"],
["sugar_cane", "Material.SUGAR_CANE"],
["sugar_cane_block", "Material.SUGAR_CANE_BLOCK"],
["sulphur", "Material.SULPHUR"],
["thin_glass", "Material.THIN_GLASS"],
["tnt", "Material.TNT"],
["torch", "Material.TORCH"],
["trap_door", "Material.TRAP_DOOR"],
["trapped_chest", "Material.TRAPPED_CHEST"],
["tripwire", "Material.TRIPWIRE"],
["tripwire_hook", "Material.TRIPWIRE_HOOK"],
["vine", "Material.VINE"],
["wall_sign", "Material.WALL_SIGN"],
["watch", "Material.WATCH"],
["water", "Material.WATER"],
["water_bucket", "Material.WATER_BUCKET"],
["water_lily", "Material.WATER_LILY"],
["web", "Material.WEB"],
["wheat", "Material.WHEAT"],
["wood", "Material.WOOD"],
["wood_axe", "Material.WOOD_AXE"],
["wood_button", "Material.WOOD_BUTTON"],
["wood_door", "Material.WOOD_DOOR"],
["wood_double_step", "Material.WOOD_DOUBLE_STEP"],
["wood_hoe", "Material.WOOD_HOE"],
["wood_pickaxe", "Material.WOOD_PICKAXE"],
["wood_plate", "Material.WOOD_PLATE"],
["wood_spade", "Material.WOOD_SPADE"],
["wood_stairs", "Material.WOOD_STAIRS"],
["wood_step", "Material.WOOD_STEP"],
["wood_sword", "Material.WOOD_SWORD"],
["wooden_door", "Material.WOODEN_DOOR"],
["wool", "Material.WOOL"],
["workbench", "Material.WORKBENCH"],
["written_book", "Material.WRITTEN_BOOK"],
["yellow_flower", "Material.YELLOW_FLOWER"]];

Blockly.Blocks['broadcast_message'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("message")
        .setCheck("String")
        .appendField("Broadcast message");
    this.appendDummyInput()
        .appendField("to entire server");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['broadcast_message'] = function(block) {
  var value_message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'server.broadcastMessage('+value_message+');\n';
  return code;
};


Blockly.Blocks['prebuilt_pose_handshake'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Handshake pose");
    this.setInputsInline(true);
    this.setOutput(true, "Pose");
    this.setTooltip('');
  }
};

Blockly.JavaScript['prebuilt_pose_handshake'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.handshake_pose';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['prebuilt_pose_wave'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Waving pose");
    this.setInputsInline(true);
    this.setOutput(true, "Pose");
    this.setTooltip('');
  }
};

Blockly.JavaScript['prebuilt_pose_wave'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.wave_pose';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['prebuilt_anim_wave'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Waving Animation");
    this.setInputsInline(true);
    this.setOutput(true, "Animation");
    this.setTooltip('');
  }
};

Blockly.JavaScript['prebuilt_anim_wave'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.wave_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['prebuilt_anim_block'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Blocking Animation");
    this.setInputsInline(true);
    this.setOutput(true, "Animation");
    this.setTooltip('');
  }
};

Blockly.JavaScript['prebuilt_anim_block'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.block_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['prebuilt_anim_attack'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Attacking Animation");
    this.setInputsInline(true);
    this.setOutput(true, "Animation");
    this.setTooltip('');
  }
};

Blockly.JavaScript['prebuilt_anim_attack'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.attack_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['prebuilt_anim_walk'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Walking Animation");
    this.setInputsInline(true);
    this.setOutput(true, "Animation");
    this.setTooltip('');
  }
};

Blockly.JavaScript['prebuilt_anim_walk'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.walk_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['stevebot_move'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("location")
        .setCheck("Location")
        .appendField("move SteveBot")
        .appendField(new Blockly.FieldVariable("bot"), "bot")
        .appendField("to Location");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['stevebot_move'] = function(block) {
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  var variable_bot = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  var code = variable_bot+'.moveTo('+value_location+');\n';
  return code;
};

Blockly.Blocks['entitieswithinrange_mod'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("type")
        .setCheck(["Array", "EntityType"])
        .appendField("find entities of type");
    this.appendValueInput("range")
        .setCheck("Number")
        .appendField("find within range");
    this.appendValueInput("entity")
        .appendField("of entity");
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setTooltip('');
  }
};

Blockly.JavaScript['entitieswithinrange_mod'] = function(block) {
  var value_type = Blockly.JavaScript.valueToCode(block, 'type', Blockly.JavaScript.ORDER_ATOMIC);
  var value_range = Blockly.JavaScript.valueToCode(block, 'range', Blockly.JavaScript.ORDER_ATOMIC);
  var value_entity = Blockly.JavaScript.valueToCode(block, 'entity', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'armorstand.entities('+value_entity+', '+value_range+', '+value_type+')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['entitieswithinrange'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("NAME")
        .setCheck("Number")
        .appendField("find all entities within range");
    this.appendValueInput("entity")
        .appendField("of entity");
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setTooltip('');
  }
};

Blockly.JavaScript['entitieswithinrange'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var value_entity = Blockly.JavaScript.valueToCode(block, 'entity', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'armorstand.entities('+value_entity+', '+value_name+')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['skull'] = { 
    init: function() {
              this.setHelpUrl('http://www.example.com/');
              this.appendValueInput("name")
                  .setCheck(["String", "Player"])
                  .appendField("create player head for player");
              this.setOutput(true, "ItemStack");
              this.setTooltip("This will create a new player head for a given player");
          }
}


              
Blockly.JavaScript['skull'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "armorstand.skull("+value_name+")";
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['adddesire'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("desire")
        .appendField("add desire");
    this.appendDummyInput()
        .appendField("to SteveBot")
        .appendField(new Blockly.FieldVariable("bot"), "bot");
    this.appendValueInput("priority")
        .setCheck("Number")
        .appendField("with priority");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['adddesire'] = function(block) {
  var value_desire = Blockly.JavaScript.valueToCode(block, 'desire', Blockly.JavaScript.ORDER_ATOMIC);
  var value_priority = Blockly.JavaScript.valueToCode(block, 'priority', Blockly.JavaScript.ORDER_ATOMIC);
  var variable_bot = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_bot+'.addDesire('+value_desire+', '+value_priority+');\n';;
  return code;
};

Blockly.Blocks['setdesires'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("desires")
        .setCheck("Array")
        .appendField("set desires for SteveBot")
        .appendField(new Blockly.FieldVariable("bot"), "bot")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['setdesires'] = function(block) {
  var value_desires = Blockly.JavaScript.valueToCode(block, 'desires', Blockly.JavaScript.ORDER_ATOMIC);
  var variable_bot = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_bot+'.setDesires('+value_desires+');\n';
  return code;
};

Blockly.Blocks['animblock'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("pose")
        .appendField("new animation frame with")
        .appendField("pose");
    this.appendValueInput("delay")
        .appendField("time to next frame");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};



Blockly.JavaScript['animblock'] = function(block) {
  var value_pose = Blockly.JavaScript.valueToCode(block, 'pose', Blockly.JavaScript.ORDER_ATOMIC);
  var value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '['+value_pose+', '+value_delay+'],\n';
  return code;
};

Blockly.Blocks['animbuilder'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendStatementInput("NAME")
        .setCheck("AnimBlock")
        .appendField("new Animation");
    this.setOutput(true, "Animation");
    this.setTooltip('');
  }
};

Blockly.JavaScript['animbuilder'] = function(block) {
  var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
  var code = 'new armorstand.Animation(['+statements_name+'])';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['change_stevebot_armor'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("item")
        .setCheck("ItemStack")
        .appendField("Change")
        .appendField(new Blockly.FieldDropdown([["Helmet", "Helmet"], ["Chestplate", "Chestplate"], ["Leggings", "Leggings"], ["Boots", "Boots"], ["Weapon", "ItemInHand"]]), "item")
        .appendField("for SteveBot")
        .appendField(new Blockly.FieldVariable("bot"), "bot")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['change_stevebot_armor'] = function(block) {
  var value_item = Blockly.JavaScript.valueToCode(block, 'item', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_item = block.getFieldValue('item');
  var variable_bot = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_bot+'.set'+dropdown_item+'('+value_item+');\n';;
  return code;
};

Blockly.Blocks['setstevebotanim'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("NAME")
        .setCheck("Animation")
        .appendField("Set animation for SteveBot")
        .appendField(new Blockly.FieldVariable("bot"), "NAME")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['setstevebotanim'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var variable_name = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_name+'.setAnimation('+value_name+');\n';
  return code;
};

Blockly.Blocks['stevebot'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("new SteveBot");
    this.appendValueInput("name")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with name");
    this.appendValueInput("location")
        .setCheck("Location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("at location");
    this.appendValueInput("pose")
        .setCheck("Pose")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with initial pose");
    this.appendValueInput("animation")
        .setCheck("Animation")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with animation");
    this.appendValueInput("desires")
        .setCheck("Array")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with desires");
    this.appendValueInput("tiny")
        .setCheck("Boolean")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("is tiny");
    this.appendValueInput("baseplate")
        .setCheck("Boolean")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("has baseplate");
    this.appendValueInput("arms")
        .setCheck("Boolean")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("has arms");
    this.setOutput(true, "SteveBot");
    this.setTooltip('');
  }
};

Blockly.JavaScript['stevebot'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  var value_pose = Blockly.JavaScript.valueToCode(block, 'pose', Blockly.JavaScript.ORDER_ATOMIC);
  var value_animation = Blockly.JavaScript.valueToCode(block, 'animation', Blockly.JavaScript.ORDER_ATOMIC);
  var value_desires = Blockly.JavaScript.valueToCode(block, 'desires', Blockly.JavaScript.ORDER_ATOMIC);
  var value_tiny = Blockly.JavaScript.valueToCode(block, 'tiny', Blockly.JavaScript.ORDER_ATOMIC);
  var value_baseplate = Blockly.JavaScript.valueToCode(block, 'baseplate', Blockly.JavaScript.ORDER_ATOMIC);
  var value_arms = Blockly.JavaScript.valueToCode(block, 'arms', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'new armorstand.SteveBot('+value_name+', '+value_location+', '+value_pose+', '+value_animation+', '+value_desires+', '+value_tiny+', '+value_baseplate+', '+value_arms+')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['equippart'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("equip")
        .setCheck("ItemStack")
        .appendField("equipment")
        .appendField(new Blockly.FieldDropdown([["helmet", "head"], ["chestplate", "body"], ["leggins", "legs"], ["boots", "boot"], ["item in hand", "hand"]]), "pose_part");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['equippart'] = function(block) {
  var value_equip = Blockly.JavaScript.valueToCode(block, 'equip', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_pose_part = block.getFieldValue('pose_part');
  // TODO: Assemble JavaScript into code variable.
  var code = '\''+dropdown_pose_part+'\': '+value_equip+',\n';
  return code;
};

Blockly.Blocks['posepart'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("angle")
        .setCheck("EulerAngle")
        .appendField("angle")
        .appendField(new Blockly.FieldDropdown([["body", "body"], ["head", "head"], ["left arm", "larm"], ["right arm", "rarm"], ["left leg", "lleg"], ["right leg", "rleg"]]), "pose_part");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['posepart'] = function(block) {
  var value_angle = Blockly.JavaScript.valueToCode(block, 'angle', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_pose_part = block.getFieldValue('pose_part');
  // TODO: Assemble JavaScript into code variable.
  var code = '\''+dropdown_pose_part+'\': '+value_angle+',\n';
  return code;
};

Blockly.Blocks['pose'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendStatementInput("posenagles")
        .setCheck("PoseAngles")
        .appendField("new Pose with angles");
    this.appendStatementInput("equips")
        .setCheck("PoseEquips")
        .appendField("with equips");
    this.setOutput(true, "Pose");
    this.setTooltip('');
  }
};

Blockly.JavaScript['pose'] = function(block) {
  var statements_posenagles = Blockly.JavaScript.statementToCode(block, 'posenagles');
  var statements_equips = Blockly.JavaScript.statementToCode(block, 'equips');
  // TODO: Assemble JavaScript into code variable.
  var code = 'new armorstand.Pose({\n'+statements_posenagles+'}, {\n'+statements_equips+'})';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['eulerangle'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("x")
        .appendField(new Blockly.FieldAngle("0"), "x");
    this.appendDummyInput()
        .appendField("y")
        .appendField(new Blockly.FieldAngle("0"), "y");
    this.appendDummyInput()
        .appendField("z")
        .appendField(new Blockly.FieldAngle("0"), "z");
    this.setInputsInline(true);
    this.setOutput(true, "EulerAngle");
    this.setTooltip('');
  }
};

Blockly.JavaScript['eulerangle'] = function(block) {
  var angle_x = block.getFieldValue('x');
  var angle_y = block.getFieldValue('y');
  var angle_z = block.getFieldValue('z');
  var code = 'armorstand.angle('+(angle_x * (Math.PI / 180))+', '+(angle_y * (Math.PI / 180))+', '+(angle_z * (Math.PI / 180))+')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['paste_schematic'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("schematic")
        .setCheck("String")
        .appendField("paste schematic");
    this.appendValueInput("at location")
        .setCheck("Location")
        .appendField("at location");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['paste_schematic'] = function(block) {
  var value_schematic = Blockly.JavaScript.valueToCode(block, 'schematic', Blockly.JavaScript.ORDER_ATOMIC);
  var value_at_location = Blockly.JavaScript.valueToCode(block, 'at location', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'schematics.paste('+value_schematic+', '+value_at_location+');\n';
  return code;
};

Blockly.Blocks['register_command'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("command")
        .setCheck("String")
        .appendField("register command");
    this.appendValueInput("func")
        .appendField("to function");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['register_command'] = function(block) {
  var value_command = Blockly.JavaScript.valueToCode(block, 'command', Blockly.JavaScript.ORDER_ATOMIC);
  var value_func = Blockly.JavaScript.valueToCode(block, 'func', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'events.when("player.PlayerCommandPreprocessEvent", function(info) {\n';
      code+= '  var args = info.getMessage().slice(1).split(" ");\n';
      code+= '  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;\n';
      code+= '  var ARGUMENT_NAMES = /([^\s,]+)/g;\n';
      code+= '  function getParamNames(func) {\n';
      code+= '      var fnStr = func.toString().replace(STRIP_COMMENTS, "");\n';
      code+= '      var result = fnStr.slice(fnStr.indexOf("(")+1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);\n';
      code+= '      if(result === null)\n';
      code+= '          result = [];\n';
      code+= '       return result;\n';
      code+= '  }\n';
      code+= '  var expected_args = getParamNames(('+value_func+'));\n';
      code+= '  if (args.length != expected_args.length) {\n';
      code+= '      info.getPlayer().sendMessage("Expected command arguments: "+expected_args);\n';
      code+= '      return;\n';
      code+= '  }\n';
      code+= '  if (args[0].toUpperCase() == '+value_command+'.toUpperCase())\n';
      code+= '      ('+value_func+').apply(this, [info.getPlayer(), args.slice(1)]);\n';
      code+= '}, me);\n';

  return code;
};

Blockly.Blocks['line_particle'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("particle")
        .setCheck(["String", "Array"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Create line of particles with particle(s)");
    this.appendValueInput("loc1")
        .setCheck("Location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("from location");
    this.appendValueInput("loc2")
        .setCheck("Location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("to location");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['line_particle'] = function(block) {
  var value_particle = Blockly.JavaScript.valueToCode(block, 'particle', Blockly.JavaScript.ORDER_ATOMIC);
  var value_loc1 = Blockly.JavaScript.valueToCode(block, 'loc1', Blockly.JavaScript.ORDER_ATOMIC);
  var value_loc2 = Blockly.JavaScript.valueToCode(block, 'loc2', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'particle.line('+value_particle+', '+value_loc1+', '+value_loc2+');\n';
  return code;
};

Blockly.Blocks['sphere_particle'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("particle")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("create sphere with particle");
    this.appendValueInput("loc1")
        .setCheck("Location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("around location");
    this.appendValueInput("radius")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with radius");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['sphere_particle'] = function(block) {
  var value_particle = Blockly.JavaScript.valueToCode(block, 'particle', Blockly.JavaScript.ORDER_ATOMIC);
  var value_loc1 = Blockly.JavaScript.valueToCode(block, 'loc1', Blockly.JavaScript.ORDER_ATOMIC);
  var value_radius = Blockly.JavaScript.valueToCode(block, 'radius', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'particle.sphere('+value_particle+', '+value_loc1+', '+value_radius+');\n';
  return code;
};

Blockly.Blocks['firework'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(145);
    this.appendDummyInput()
        .appendField("launch firework with colours")
        .appendField(new Blockly.FieldColour("#ff0000"), "c1")
        .appendField(new Blockly.FieldColour("#ff0000"), "c2")
        .appendField(new Blockly.FieldColour("#ff0000"), "c3");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with fading colours")
        .appendField(new Blockly.FieldColour("#ff0000"), "fc1")
        .appendField(new Blockly.FieldColour("#ff0000"), "fc2")
        .appendField(new Blockly.FieldColour("#ff0000"), "fc3");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with pattern")
        .appendField(new Blockly.FieldDropdown([["ball", "BALL"], ["large ball", "BALL_LARGE"], ["burst", "BURST"], ["creeper", "CREEPER"], ["star", "STAR"]]), "pattern");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with flicker")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "flicker");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with trail")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "trail");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with height")
        .appendField(new Blockly.FieldDropdown([["low", "0"], ["higher", "1"], ["highest", "2"]]), "power");
    this.appendValueInput("location")
        .setCheck("Location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("at location");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['firework'] = function(block) {
  var colour_c1 = block.getFieldValue('c1');
  var colour_c2 = block.getFieldValue('c2');
  var colour_c3 = block.getFieldValue('c3');
  var colour_fc1 = block.getFieldValue('fc1');
  var colour_fc2 = block.getFieldValue('fc2');
  var colour_fc3 = block.getFieldValue('fc3');
  var dropdown_pattern = block.getFieldValue('pattern');
  var checkbox_flicker = block.getFieldValue('flicker') == 'TRUE';
  var checkbox_trail = block.getFieldValue('trail') == 'TRUE';
  var dropdown_power = block.getFieldValue('power');
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
    /* first look convert hex to RBG */
  function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
  }
  var main_colors = [hexToRgb(colour_c1), hexToRgb(colour_c2), hexToRgb(colour_c3)];
  var fade_colors = [hexToRgb(colour_fc1), hexToRgb(colour_fc2), hexToRgb(colour_fc3)];
  /* next convert RGB colors to Color.fromRGB bkColor strings to use in generated code */
  function rgbToBkColor(rbg) {
      return 'org.bukkit.Color.fromRGB('+rbg.r+', '+rbg.g+', '+rbg.b+')';
  }
  var main_colors_bkColor = [rgbToBkColor(main_colors[0]), rgbToBkColor(main_colors[1]), rgbToBkColor(main_colors[2])];
  var fade_colors_bkColor = [rgbToBkColor(fade_colors[0]), rgbToBkColor(fade_colors[1]), rgbToBkColor(fade_colors[2])];

  var code = 'var firework = '+value_location+'.getWorld().spawnEntity('+value_location+', org.bukkit.entity.EntityType.FIREWORK);\n';
     code += 'var fireworkmeta = firework.getFireworkMeta();\n';
     code += 'var effect = org.bukkit.FireworkEffect.builder().flicker('+checkbox_flicker+').trail('+checkbox_trail+').withColor([';
     code +=  main_colors_bkColor[0] + ', ' + main_colors_bkColor[1] + ', '+ main_colors_bkColor[2]+']).withFade([';
     code +=  fade_colors_bkColor[0] + ', ' + fade_colors_bkColor[1] + ', '+ fade_colors_bkColor[2]+']).with(org.bukkit.FireworkEffect.Type.'+dropdown_pattern+').build();\n';
     code += 'fireworkmeta.addEffect(effect);\n';
     code += 'fireworkmeta.setPower('+dropdown_power+');\n';
     code += 'firework.setFireworkMeta(fireworkmeta);\n';
     
  return code;
};

Blockly.Blocks['change_item_name'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("item")
        .setCheck("ItemStack")
        .appendField("change item");
    this.appendValueInput("name")
        .setCheck("String")
        .appendField("name to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['change_item_name'] = function(block) {
  var value_item = Blockly.JavaScript.valueToCode(block, 'item', Blockly.JavaScript.ORDER_ATOMIC);
  var value_name = Blockly.JavaScript.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'var itemMeta = '+value_item+'.getItemMeta();\n';
     code += 'itemMeta.setDisplayName('+value_name+');\n';
     code += value_item+'.setItemMeta(itemMeta);\n';
  return code;
};

Blockly.Blocks['item_in_hand'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("player")
        .setCheck("Player")
        .appendField("Get item in hand name for player");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['item_in_hand'] = function(block) {
  var value_player = Blockly.JavaScript.valueToCode(block, 'player', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_player + '.getItemInHand().getItemMeta().getDisplayName()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['texturepack'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("player")
        .setCheck("Player")
        .appendField("change texture pack for player");
    this.appendDummyInput()
        .appendField("to pack at url")
        .appendField(new Blockly.FieldTextInput("url"), "URL");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['texturepack'] = function(block) {
  var value_player = Blockly.JavaScript.valueToCode(block, 'player', Blockly.JavaScript.ORDER_ATOMIC);
  var text_url = block.getFieldValue('URL').replace(/"/g,"");
  var code = value_player+'.setResourcePack(\''+text_url+'\');\n';
  return code;
};

Blockly.Blocks['explosion'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(145);
    this.appendValueInput("location")
        .setCheck("Location")
        .appendField("create explosion that")
        .appendField(new Blockly.FieldDropdown([["destroys blocks", "true"], ["doesn't destroy blocks", "false"]]), "real")
        .appendField(new Blockly.FieldDropdown([["sets fire to blocks", "true"], ["doesn't set fire to blocks", "false"]]), "fire")
        .appendField("at location");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};


Blockly.JavaScript['explosion'] = function(block) {
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_real = block.getFieldValue('real');
  var dropdown_fire = block.getFieldValue('fire');
  var locx = value_location+".getX()";
  var locy = value_location+".getY()";
  var locz = value_location+".getZ()";
  var code = 'world.createExplosion('+locx+', '+locy+', '+locz+', 4, '+dropdown_fire+', '+dropdown_real+');\n';
  return code;
};

Blockly.Blocks['new_recipe'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(160);
    this.appendDummyInput()
        .appendField("Add new recipe for creating");
    this.appendValueInput("num_result")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_CENTRE);
    this.appendDummyInput()
        .appendField("of material");
    this.appendValueInput("recipe_result")
        .setCheck("Material")
        .setAlign(Blockly.ALIGN_CENTRE);
    this.appendStatementInput("recipe_specs")
        .setCheck("RecipeRow");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['new_recipe'] = function(block) {
  var value_num_result = Blockly.JavaScript.valueToCode(block, 'num_result', Blockly.JavaScript.ORDER_ATOMIC);
  var value_recipe_result = Blockly.JavaScript.valueToCode(block, 'recipe_result', Blockly.JavaScript.ORDER_ATOMIC);
  var recipe_specs = Blockly.JavaScript.statementToCode(block, 'recipe_specs');
  var recipe_rows = recipe_specs.split(';');
  var existing_materials = [];
  var recipe_shape = [];
  var shape_letters = ['A','B','C','D','E','F','G','H','I'];

  recipe_rows.forEach(function(recipe_row) {
    if(recipe_shape.length < 3) {
      recipe_shape.push("");
      var row_materials = recipe_row.split(',');
      row_materials.forEach(function(material) {
        material = material.replace(/\s/g, '');
        material = material.replace(/'/g, "");
        if(material == "") {
          recipe_shape[recipe_shape.length - 1] += ' '; 
        } else if(existing_materials.indexOf(material) > -1) {
          recipe_shape[recipe_shape.length - 1] += shape_letters[existing_materials.indexOf(material)];
        } else {
          existing_materials.push(material);
          recipe_shape[recipe_shape.length - 1] += shape_letters[existing_materials.length - 1];
        }
      });
    }
  });
  var code = 'server.addRecipe((new ShapedRecipe(new ItemStack(' + value_recipe_result + ', ' + value_num_result + ')))';
  for (var i = 0; i < 3; i++) {
    if(!recipe_shape[i] || recipe_shape[i].replace(/\s/g, '') == '')  {
      recipe_shape[i] = '   ';
    }
  }
  var final_shape = '';
  recipe_shape.forEach(function(shape_row){
    final_shape += shape_row != '   ' ? "'" + shape_row + "'," : '';
  })
  code += ".shape([" + final_shape.substring(0, final_shape.length - 1) + "])";
  for(var i = 0; i < existing_materials.length; i++) {
    code += ".setIngredient('" + shape_letters[i] + "', " + existing_materials[i] + ")";
  }
  code += ');\n';
  return code;
};


Blockly.Blocks['recipe_row'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(160);
    this.appendDummyInput()
        .appendField("recipe material pattern");
    this.appendDummyInput();
    this.appendValueInput("materialA")
        .setCheck(["String","Material"]);
    this.appendValueInput("materialB")
        .setCheck(["String","Material"]);
    this.appendValueInput("materialC")
        .setCheck(["String","Material"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['recipe_row'] = function(block) {
  var value_materiala = Blockly.JavaScript.valueToCode(block, 'materialA', Blockly.JavaScript.ORDER_ATOMIC);
  var value_materialb = Blockly.JavaScript.valueToCode(block, 'materialB', Blockly.JavaScript.ORDER_ATOMIC);
  var value_materialc = Blockly.JavaScript.valueToCode(block, 'materialC', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_materiala + ', ' + value_materialb + ', ' + value_materialc + ';';
  return code;
};


Blockly.Blocks['tune'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("TEMPO")
        .appendField("tempo");
    this.appendValueInput("PLAYER")
        .appendField("player")
        .setCheck("Player");
    this.appendValueInput("ADD0")
        .appendField("notes")
        .setCheck(["NoteSound", "Array"]);
    this.appendValueInput('ADD1');
    this.setTooltip('');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['call_mutator_item']));
    this.itemCount_ = 2;
  },

  /**
   * Create XML to represent number of text inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x);
      if (x == 0) {
        input.appendField("notes");
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = Blockly.Block.obtain(workspace,
                                           'call_mutator_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = Blockly.Block.obtain(workspace, 'call_mutator_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_);
      if (this.itemCount_ == 0) {
        input.appendField("notes");
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
  
};

Blockly.JavaScript['tune'] = function(block) {
  var value_tempo = Blockly.JavaScript.valueToCode(block, 'TEMPO', Blockly.JavaScript.ORDER_ATOMIC);
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code;
  if (block.itemCount_ == 0) {
    code = '\n';
    return code;
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.JavaScript.valueToCode(block, 'ADD0',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    code = 'playTune('+value_tempo+', '+value_player+', '+ argument0 + ');\n';
    return code;
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
          Blockly.JavaScript.ORDER_COMMA) || '\'\'';
    }
    code = 'playTune('+value_tempo+', ' +value_player+', ' + code.join(',') + ');\n';
    return code;
  }
};


Blockly.Blocks['tone'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("http://www.swantonschool.org/wp-content/uploads/2012/09/Music-Note.png", 20, 20, "*"))
        .appendField(new Blockly.FieldDropdown([
                                                ["Low F#", "lFs"], 
                                                ["G", "G"], 
                                                ["G#", "Gs"], 
                                                ["A", "A"], 
                                                ["A#", "As"], 
                                                ["B", "B"], 
                                                ["C", "C"],
                                                ["C#", "Cs"],
                                                ["D", "D"],
                                                ["D#", "Ds"],
                                                ["E", "E"],
                                                ["F", "F"],
                                                ["F#", "Fs"],
                                                ["High G", "hG"],
                                                ["High G#", "hGs"],
                                                ["High A", "hA"],
                                                ["High A#", "hAs"],
                                                ["High B", "hB"],
                                                ["High C", "hC"],
                                                ["High C#", "hCs"],
                                                ["High D", "hD"],
                                                ["High D#", "hDs"],
                                                ["High E", "hE"],
                                                ["High F", "hF"],
                                                ["High F#", "hFs"]
                                                ]
                                               ), "tone");
    this.setOutput(true, "Tone");
    this.setTooltip('');
  }
};

Blockly.JavaScript['tone'] = function(block) {
  var dropdown_tone = block.getFieldValue('tone');
  // TODO: Assemble JavaScript into code variable.
  var code = 'new Tone(Tones.'+dropdown_tone+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['fast_tempo'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("fast tempo");
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};
Blockly.JavaScript['fast_tempo'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '700';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['rest'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("rest");
    this.setOutput(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['rest'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '\'rest\'';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['regular_tempo'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(230);
    this.appendDummyInput()
        .appendField("regular tempo");
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};
Blockly.JavaScript['regular_tempo'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '500';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['slow_tempo'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(130);
    this.appendDummyInput()
        .appendField("slow tempo");
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};
Blockly.JavaScript['slow_tempo'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '300';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['instrument_bass_drum'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("note")
        .setCheck("Tone")
        .appendField(new Blockly.FieldImage("http://tennysonholloway.com/ts/image_resources/drum.png", 20, 20, "*"));
    this.setOutput(true, "NoteSound");
    this.setTooltip('');
  }
};

Blockly.JavaScript['instrument_bass_drum'] = function(block) {
  var value_note = Blockly.JavaScript.valueToCode(block, 'note', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'bass_drum('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['instrument_bass_guitar'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("note")
        .setCheck("Tone")
        .appendField(new Blockly.FieldImage("http://tennysonholloway.com/ts/image_resources/guitar.png", 20, 20, "*"));
    this.setOutput(true, "NoteSound");
    this.setTooltip('');
  }
};

Blockly.JavaScript['instrument_bass_guitar'] = function(block) {
  var value_note = Blockly.JavaScript.valueToCode(block, 'note', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'bass_guitar('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['instrument_piano'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("note")
        .setCheck("Tone")
        .appendField(new Blockly.FieldImage("http://tennysonholloway.com/ts/image_resources/piano.png", 20, 20, "*"));
    this.setOutput(true, "NoteSound");
    this.setTooltip('');
  }
};

Blockly.JavaScript['instrument_piano'] = function(block) {
  var value_note = Blockly.JavaScript.valueToCode(block, 'note', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'piano('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['instrument_snare_drum'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("note")
        .setCheck("Tone")
        .appendField(new Blockly.FieldImage("http://tennysonholloway.com/ts/image_resources/snaredrum.png", 20, 20, "*"));
    this.setOutput(true, "NoteSound");
    this.setTooltip('');
  }
};

Blockly.JavaScript['instrument_snare_drum'] = function(block) {
  var value_note = Blockly.JavaScript.valueToCode(block, 'note', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'snare_drum('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['instrument_sticks'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("note")
        .setCheck("Tone")
        .appendField(new Blockly.FieldImage("http://tennysonholloway.com/ts/image_resources/drumsticks.png", 20, 20, "*"));
    this.setOutput(true, "NoteSound");
    this.setTooltip('');
  }
};

Blockly.JavaScript['instrument_sticks'] = function(block) {
  var value_note = Blockly.JavaScript.valueToCode(block, 'note', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'sticks('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['flatten'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("tone")
        .setCheck("Tone")
        .appendField("flatten");
    this.setOutput(true, "Tone");
    this.setTooltip('');
  }
};

Blockly.JavaScript['flatten'] = function(block) {
  var value_tone = Blockly.JavaScript.valueToCode(block, 'tone', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'flatten('+value_tone+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['sharpen'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("tone")
        .setCheck("Tone")
        .appendField("sharpen");
    this.setOutput(true, "Tone");
    this.setTooltip('');
  }
};

Blockly.JavaScript['sharpen'] = function(block) {
  var value_tone = Blockly.JavaScript.valueToCode(block, 'tone', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'sharpen('+value_tone+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['high_octave'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("octave")
        .setCheck("Tone")
        .appendField("high");
    this.setOutput(true, "Tone");
    this.setTooltip('');
  }
};
Blockly.Blocks['keyinjso'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(230);
    this.appendValueInput("key")
        .appendField("named value");
    this.appendValueInput("jso")
        .appendField("exists in");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['keyinjso'] = function(block) {
  var value_key = Blockly.JavaScript.valueToCode(block, 'key', Blockly.JavaScript.ORDER_ATOMIC);
  var value_jso = Blockly.JavaScript.valueToCode(block, 'jso', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_key + ' in ' + value_jso;
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['accessjso'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(230);
    this.appendValueInput("NAME")
        .appendField("get value named");
    this.appendValueInput("JSO")
        .appendField("from");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['accessjso'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var value_jso = Blockly.JavaScript.valueToCode(block, 'JSO', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_jso+'['+value_name+']';
  return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['setjso'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(230);
    this.appendValueInput("value")
        .appendField("put value");
    this.appendValueInput("NAME")
        .appendField("named");
    this.appendValueInput("JSO")
        .appendField("in");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['setjso'] = function(block) {
  var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var value_jso = Blockly.JavaScript.valueToCode(block, 'JSO', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_jso+'['+value_name+'] = '+value_value+';\n';
  return code;
};
Blockly.Blocks['spawnfallingblock'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("block")
        .setCheck("Material")
        .appendField("Spawn falling block with type");
    this.appendValueInput("location")
        .setCheck("Location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("at location");
    this.appendValueInput("data")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("(optional) with data");
    this.setOutput(true, "FallingBlock");
    this.setTooltip('');
  }
};

Blockly.JavaScript['spawnfallingblock'] = function(block) {
  var value_block = Blockly.JavaScript.valueToCode(block, 'block', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  var value_data = Blockly.JavaScript.valueToCode(block, 'data', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_location + '.getWorld().spawnFallingBlock(' + value_location + ', ' + value_block + ', ' + (value_data ? value_data : 0) + ')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.Blocks['getblockatlocation'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("location")
        .setCheck("Location")
        .appendField("get block at location");
    this.setInputsInline(true);
    this.setOutput(true, "Block");
    this.setTooltip('');
  }
};


Blockly.JavaScript['getblockatlocation'] = function(block) {
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_location + '.getBlock()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['getblockrel'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("origblock")
        .setCheck("Block")
        .appendField("Get relative block from block");
    this.appendValueInput("relposition")
        .setCheck("BlockFace")
        .appendField("in direction");
    this.setInputsInline(true);
    this.setOutput(true, "Block");
    this.setTooltip('');
  }
}

  Blockly.JavaScript['getblockrel'] = function(block) {
  var value_origblock = Blockly.JavaScript.valueToCode(block, 'origblock', Blockly.JavaScript.ORDER_ATOMIC);
  var value_relposition = Blockly.JavaScript.valueToCode(block, 'relposition', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_origblock + '.getRelative(' + value_relposition + ')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['blockfaces'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("BlockFace")
        .appendField(new Blockly.FieldDropdown([["NORTH", "NORTH"], ["EAST", "EAST"], ["SOUTH", "SOUTH"], ["WEST", "WEST"], ["UP", "UP"], ["DOWN", "DOWN"]]), "relatives");
    this.setInputsInline(true);
    this.setOutput(true, "BlockFace");
    this.setTooltip('');
  }
};

Blockly.JavaScript['blockfaces'] = function(block) {
  var dropdown_relatives = block.getFieldValue('relatives');
  var code = 'org.bukkit.block.BlockFace.' + dropdown_relatives;
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['setvelocity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("fallingblock")
        .setCheck("FallingBlock")
        .appendField("With FallingBlock");
    this.appendValueInput("velocity")
        .setCheck("Velocity")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("set Velocity");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['setvelocity'] = function(block) {
  var value_fallingblock = Blockly.JavaScript.valueToCode(block, 'fallingblock', Blockly.JavaScript.ORDER_ATOMIC);
  var value_velocity = Blockly.JavaScript.valueToCode(block, 'velocity', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_fallingblock + '.setVelocity(' + value_velocity + ');\n';
  return code;
};

Blockly.Blocks['velocity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("x")
        .setCheck("Number")
        .appendField("new Velocity x");
    this.appendValueInput("y")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y");
    this.appendValueInput("z")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("z");
    this.setOutput(true, "Velocity");
    this.setTooltip('');
  }
};

Blockly.JavaScript['velocity'] = function(block) {
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_z = Blockly.JavaScript.valueToCode(block, 'z', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '(new org.bukkit.util.Vector(' + value_x + ', ' + value_y + ', ' + value_z + '))';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['materialat'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("NAME")
        .setCheck("Location")
        .appendField("material at");
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};

Blockly.JavaScript['materialat'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '('+value_name+').getBlock().getType()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['clear_armor'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("armor")
        .setCheck("Player")
        .appendField("Clear armor ")
        .appendField(new Blockly.FieldDropdown([["helmet", "Helmet"], ["chestplate", "Chestplate"], ["legs", "Leggings"], ["boots", "Boots"], ["all", "ALL"]]), "armor")
        .appendField("for player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};



Blockly.JavaScript['clear_armor'] = function(block) {
  var value_armor = Blockly.JavaScript.valueToCode(block, 'armor', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_armor = block.getFieldValue('armor');
  if (dropdown_armor == "ALL") {
    var code =    value_armor + '.getInventory().setHelmet(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.getInventory().setChestplate(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.getInventory().setLeggings(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.getInventory().setBoots(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.updateInventory();\n';
  } else {
    var code = value_armor + '.getInventory().set'+dropdown_armor+'(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.updateInventory();\n';
  }
  return code;
};

Blockly.Blocks['changearmor'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("armor")
        .setCheck("ItemStack")
        .appendField("Change armour piece")
        .appendField(new Blockly.FieldDropdown([["helmet", "Helmet"], ["chestplate", "Chestplate"], ["legs", "Leggings"], ["boots", "Boots"]]), "armor")
        .appendField("to item");
    this.appendValueInput("player")
        .setCheck("Player")
        .appendField("for player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};



Blockly.JavaScript['changearmor'] = function(block) {
  var value_armor = Blockly.JavaScript.valueToCode(block, 'armor', Blockly.JavaScript.ORDER_ATOMIC);
  var value_player = Blockly.JavaScript.valueToCode(block, 'player', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_armor = block.getFieldValue('armor');
  
  var code = value_player + '.getInventory().set'+dropdown_armor+'('+value_armor+');\n';
  code = code + value_player + '.updateInventory();\n';
  return code;
};

Blockly.Blocks['generalsetter'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("set")
        .appendField(new Blockly.FieldVariable("item"), "setee")
        .appendField("'s")
        .appendField(new Blockly.FieldTextInput("default"), "setter");
    this.appendValueInput("value")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Used as a general setter function.');
  }
};

Blockly.JavaScript['generalsetter'] = function(block) {
  var variable_setee = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('setee'), Blockly.Variables.NAME_TYPE);
  var text_setter = block.getFieldValue('setter');
  var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = variable_setee + '.set' + text_setter + '(' + value_value + ');\n';
  return code;
};


Blockly.Blocks['update_sign'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Update sign at location");
    this.appendValueInput("loc")
        .setCheck("Location");
    this.appendDummyInput()
        .appendField("with text");
    this.appendValueInput("list");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['update_sign'] = function(block) {
  /*var value_loc = Blockly.JavaScript.valueToCode(block, 'loc', Blockly.JavaScript.ORDER_ATOMIC);
  var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
  if (typeof value_list == 'string') {
         var code = '(' + value_loc + ').getBlock().getState().setLine(0, \'\');\n';
      code = code + '(' + value_loc + ').getBlock().getState().setLine(1, \'\');\n';
      code = code + '(' + value_loc + ').getBlock().getState().setLine(2, ' + value_list + ');\n';
      code = code + '(' + value_loc + ').getBlock().getState().setLine(3, \'\');\n';
  } else {
    var code = '';
    for (var i = 0; i < value_list.length; i++) {
        code = code + '(' + value_loc + ').getBlock().getState().setLine(' + i + ', ' + value_list[i] + ');\n';
    }

  }
  return code;*/
  var value_loc = Blockly.JavaScript.valueToCode(block, 'loc', Blockly.JavaScript.ORDER_ATOMIC);
  var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'var tempDroneSign = new Drone(me, me.location);\n' +
             'tempDroneSign.setLocation('+value_loc+');\n' +
             'tempDroneSign.sign('+value_list+', 68);\n';
  return code;
};

Blockly.Blocks['rotate_player'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Rotate entity");
    this.appendValueInput("player");
    this.appendDummyInput()
        .appendField("for");
    this.appendValueInput("degrees")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("degrees");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['rotate_player'] = function(block) {
  var value_player = Blockly.JavaScript.valueToCode(block, 'player', Blockly.JavaScript.ORDER_ATOMIC);
  var value_degrees = Blockly.JavaScript.valueToCode(block, 'degrees', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code =  'var tempLoc = '+value_player+'.getLocation();\n';
      code += 'tempLoc.setYaw(tempLoc.getYaw()+'+value_degrees+');\n';
      code += value_player+'.teleport(tempLoc);\n';
  return code;
};
Blockly.Blocks['new_itemstack'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendDummyInput()
        .appendField("new Item of material");
    this.appendValueInput("Material");
    this.appendDummyInput()
        .appendField("amount");
    this.appendValueInput("amount")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setOutput(true, "ItemStack");
    this.setTooltip('');
  }
};

Blockly.JavaScript['new_itemstack'] = function(block) {
  var value_material = Blockly.JavaScript.valueToCode(block, 'Material', Blockly.JavaScript.ORDER_ATOMIC);
  var value_amount = Blockly.JavaScript.valueToCode(block, 'amount', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'new ItemStack('+value_material+', '+value_amount+')'
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['add_lore'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendDummyInput()
        .appendField("add lore");
    this.appendValueInput("lore")
        .setCheck("Array");
    this.appendDummyInput()
        .appendField("to item");
    this.appendValueInput("item")
        .setCheck("ItemStack");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['add_lore'] = function(block) {
  var value_lore = Blockly.JavaScript.valueToCode(block, 'lore', Blockly.JavaScript.ORDER_ATOMIC);
  var value_item = Blockly.JavaScript.valueToCode(block, 'item', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code =        'var itemMeta = (' + value_item + ').getItemMeta();\n';
      code = code + 'itemMeta.setLore(' + value_lore + ');\n';
      code = code + '(' + value_item + ').setItemMeta(itemMeta);\n';
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};





Blockly.Blocks['give_item_to_player'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("Give item");
    this.appendValueInput("ITEM")
        .setCheck("ItemStack");
    this.appendDummyInput()
        .appendField("to player");
    this.appendValueInput("PLAYER")
        .setCheck("Player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};



Blockly.JavaScript['give_item_to_player'] = function(block) {
  var value_item = Blockly.JavaScript.valueToCode(block, 'ITEM', Blockly.JavaScript.ORDER_ATOMIC);
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_player+'.getInventory().addItem(['+value_item+']);\n'+value_player+'.updateInventory();\n';
  return code;
};

Blockly.Blocks['js'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("js")
        .appendField(new Blockly.FieldTextInput("js code"), "func_name");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['js_noret'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("js")
        .appendField(new Blockly.FieldTextInput("js code"), "func_name");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['functionblock'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput()
        .appendField("function")
        .appendField(new Blockly.FieldTextInput("function Name"), "func_name");
    this.setInputsInline(true);
    this.setOutput(true, "Function");
    this.setTooltip('');
  }
};

Blockly.Blocks['functionblock_dropdown'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');

    var functions = Blockly.mainWorkspace.getTopBlocks().filter(function(e){
      if(e.type == "procedures_defreturn" || e.type == "procedures_defnoreturn"){
        return true;
      }

      return false;
    })

    var function_name_tuples;

    if(!Blockly.JavaScript.variableDB_)
      function_name_tuples = [["main","main"]];
    else{
      function_name_tuples = functions.map(
          function(e){
            return [
              e.getFieldValue("NAME"),
              Blockly.JavaScript.variableDB_.getName(e.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE)
            ] 
          }
      );
      if(function_name_tuples.length == 0)
        function_name_tuples = [["main","main"]];
    }

    this.appendDummyInput()
        .appendField("function")
        .appendField(new Blockly.FieldDropdown(function_name_tuples), "func_name")
    this.setInputsInline(true);
    this.setOutput(true, "Function");
    this.setTooltip('');
  }
};

Blockly.Blocks['calljavaon'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/doxygen/df/d08/namespaceorg_1_1bukkit_1_1event.html');
    this.appendValueInput("func")
        .setCheck("Function")
        .appendField("call Java");
    this.appendValueInput("evt")
        .appendField("on");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};


Blockly.Blocks['action_click'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["left click air", "LEFT_CLICK_AIR"], ["left click block", "LEFT_CLICK_BLOCK"], ["right click air", "RIGHT_CLICK_AIR"], ["right click block", "RIGHT_CLICK_BLOCK"]]), "click_type");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['action_click'] = function(block) {
  var dropdown_click_type = block.getFieldValue('click_type');
  // TODO: Assemble JavaScript into code variable.
  var code = dropdown_click_type;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['typeof'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(40);
    this.appendValueInput("NAME")
        .appendField("EntityType of");
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['mob'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(90);
    this.appendDummyInput()
        .appendField("Drone");
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable("d"), "DRONE");
    this.appendDummyInput()
        .appendField("spawns mob of type");
    this.appendValueInput("NAME")
        .setCheck("EntityType");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['eval'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("NAME")
        .appendField("eval")
        .setCheck("String");
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['me'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("me");
    this.setOutput(true, "Player");
    this.setTooltip('');
  }
};

Blockly.Blocks['new_drone'] = {
  init: function() {
    this.setHelpUrl('/book/docs/drone-docs');
    this.setColour(90);
    this.appendDummyInput()
        .appendField("new Drone");
    this.setOutput(true, "Drone");
    this.setTooltip('');
    this.description="Creates a new drone."
  }
};

Blockly.Blocks['new_fluff'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(90);
    this.appendDummyInput()
        .appendField("new Drone");
    this.setOutput(true, "Drone");
    this.setTooltip('');
  }
};

Blockly.Blocks['drone_move'] = {
  init: function() {
    this.setHelpUrl('/book/docs/drone-docs');
    this.setColour(90);
    this.appendDummyInput()
        .appendField("Move Drone");
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable("d"), "DRONE");
    this.appendDummyInput()
        .appendField("in direction");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["up", "up"], ["down", "down"], ["left", "left"], ["right", "right"], ["forward", "fwd"], ["backward", "back"]]), "DIRECTION");
    this.appendDummyInput()
        .appendField("distance");
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("1"), "DISTANCE");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['drone_move_2'] = {
  init: function() {
    this.setHelpUrl('/book/docs/drone-docs');
    this.setColour(90);
    this.appendDummyInput()
        .appendField("Move Drone");
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable("d"), "DRONE");
    this.appendDummyInput()
        .appendField("in direction");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["up", "up"], ["down", "down"], ["left", "left"], ["right", "right"], ["forward", "fwd"], ["backward", "back"]]), "DIRECTION");
    this.appendDummyInput()
        .appendField("distance");
    this.appendValueInput("DISTANCE")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Rotates a drone\'s perspective rightward/clockwise or leftward/counter-clockwise');
  }
};

Blockly.Blocks['drone_rotate'] = {
  init: function() {
    this.setHelpUrl('/book/docs/drone-docs');
    this.setColour(90);
    this.appendDummyInput()
        .appendField("Rotate Drone");
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable("d"), "DRONE");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["clockwise", "clockwise"], ["counter-clockwise", "counter-clockwise"]]), "DIRECTION");
    this.appendValueInput("NUM_ROTATIONS")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("time(s)");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Rotates a drone\'s perspective rightward/clockwise or leftward/counter-clockwise.  Currently doesn\'t work in the simulator.');
  }
};

Blockly.Blocks['block_place'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(90);
    this.appendDummyInput()
        .appendField("Drone");
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable("d"), "DRONE");
    this.appendDummyInput()
        .appendField("places block of type");
    this.appendValueInput("MATERIAL")
        .setCheck("Material");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};


Blockly.Blocks['get_location'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(40);
    this.appendValueInput("THING")
        .setCheck(["Drone", "Player", "Block"])
        .appendField("location of");
    this.setOutput(true, "Location");
    this.setTooltip('');
  }
};

Blockly.Blocks['player'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendValueInput("NAME")
        .setCheck("String")
        .appendField("Player named");
    this.setOutput(true, "Player");
    this.setTooltip('');
  }
};

Blockly.Blocks['world'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(145);
    this.appendDummyInput()
        .appendField("World");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["strike lightning", "strikeLightning"]]), "METHOD");
    this.appendDummyInput()
        .appendField("at");
    this.appendValueInput("LOCATION")
        .setCheck("Location");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['send'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Send message");
    this.appendValueInput("MESSAGE")
        .setCheck("String");
    this.appendDummyInput()
        .appendField("to");
    this.appendValueInput("PLAYER")
        .setCheck("Player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['interval'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(175);
    this.appendDummyInput()
        .appendField("do function");
    this.appendValueInput("FUNCTION")
        .setCheck("Function");
    this.appendDummyInput()
        .appendField("every");
    this.appendValueInput("MILLIS")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("milliseconds");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};


Blockly.Blocks['timeout'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(175);
    this.appendDummyInput()
        .appendField("do function");
    this.appendValueInput("FUNCTION")
        .setCheck("Function");
    this.appendDummyInput()
        .appendField("after");
    this.appendValueInput("MILLIS")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("milliseconds");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['event'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(175);
    this.appendDummyInput()
        .appendField("do function");
    this.appendValueInput("FUNCTION")
        .setCheck("Function");
    this.appendDummyInput()
        .appendField("when");
    this.appendValueInput("EVENT")
        .setCheck("Event");
    this.appendDummyInput()
        .appendField("happens");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.Blocks['get_target_block'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendValueInput("NAME")
        .appendField("get block that player")
        .setCheck("Player");
    this.appendDummyInput()
        .appendField("is looking at");
    this.setInputsInline(true);
    this.setOutput(true, "Block");
    this.setTooltip('');
  }
};
Blockly.JavaScript['get_target_block'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_name+'.getTargetBlock(null, 50)';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['new_event'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(175);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
                    ["block_break", "block.BlockBreakEvent"], 
                    ["player_interact", "player.PlayerInteractEvent"], 
                    ["player_move", "player.PlayerMoveEvent"], 
                    ["player_death", "entity.PlayerDeathEvent"], 
                    ["entity_damage_by_entity", "entity.EntityDamageByEntityEvent"], 
                    ["player_interact_entity", "player.PlayerInteractEntityEvent"],
                    ["player_chat", "player.PlayerChatEvent"],
                    ["lightning_strike", "weather.LightningStrikeEvent"],
                    ["block_place", "block.BlockPlaceEvent"],
                    ["entity_death", "entity.EntityDeathEvent"],
                    ["player_egg_throw", "player.PlayerEggThrowEvent"],
                    ["projectile_hit", "entity.ProjectileHitEvent"],
                    ]), "NAME");
    this.appendDummyInput()
        .appendField("Event");
    this.setInputsInline(true);
    this.setOutput(true, "Event");
    this.setTooltip('');
  }
};


Blockly.Blocks['potion_effect'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Give effect")
        .appendField(new Blockly.FieldDropdown([
                    ["speed", "SPEED"], 
                    ["confusion", "CONFUSION"],
                    ["absorption", "ABSORPTION"],
                    ["blindness", "BLINDNESS"],
                    ["damange_resistance", "DAMAGE_RESISTANCE"],
                    ["fast_digging", "FAST_DIGGING"],
                    ["fire_resistance", "FIRE_RESISTANCE"],
                    ["health_boost", "HEALTH_BOOST"],
                    ["hunger", "HUNGER"],
                    ["increase damage", "INCREASE_DAMAGE"],
                    ["invisibility", "INVISIBILITY"],
                    ["jump", "JUMP"],
                    ["night_vision", "NIGHT_VISION"],
                    ["poison", "POISON"],
                    ["regeneration", "REGENERATION"],
                    ["saturation", "SATURATION"],
                    ["slow", "SLOW"],
                    ["slow_digging", "SLOT_DIGGING"],
                    ["water_breathing", "WATER_BREATHING"],
                    ["weakness", "WEAKNESS"],
                    ["wither", "WITHER"],
                    ]), "EFFECT");
    this.appendValueInput("PLAYER")
        .setCheck("Player")
        .appendField("to Player");
    this.appendDummyInput()
        .appendField("for")
        .appendField(new Blockly.FieldTextInput("10"), "DURATION")
        .appendField("seconds; amplifier:")
        .appendField(new Blockly.FieldTextInput("10"), "AMPLIFIER");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['entity_type'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(40);
    this.appendDummyInput()
        .appendField("EntityType")
        .appendField(new Blockly.FieldDropdown([["pig", "PIG"], 
            ["player", "PLAYER"], ["creeper", "CREEPER"], 
            ["arrow", "ARROW"], ["zombie", "ZOMBIE"],
            ["bat", "BAT"], ["blaze", "BLAZE"],
            ["cave spider", "CAVE_SPIDER"], ["cow", "COW"],
            ["ender dragon", "ENDER_DRAGON"], ["enderman", "ENDERMAN"],
            ["fireball", "FIREBALL"], ["ghast", "GHAST"],
            ["iron_golem", "IRON_GOLEM"], ["magma cube", "MAGMA_CUBE"],
            ["ocelot", "OCELOT"], ["sheep", "SHEEP"], ["skeleton", "SKELETON"],
            ["snowman", "SNOWMAN"], ["spider", "SPIDER"],
            ["villager", "VILLAGER"], ["witch", "WITCH"],
            ["wither", "WITHER"], ["wolf", "WOLF"]]), "TYPE");
    this.setInputsInline(true);
    this.setOutput(true, "EntityType");
    this.setTooltip('');
  }
};

Blockly.Blocks['anon_func'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendStatementInput("CODE")
        .appendField("function");
    this.setOutput(true, "Function");
    this.appendDummyInput()
        .appendField('', 'NAME')
        .appendField('', 'PARAMS');
    this.setTooltip('');
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    this.arguments_ = [];
  },

  /**
   * Update the display of parameters for this procedure definition block.
   * Display a warning if there are duplicately named parameters.
   * @private
   * @this Blockly.Block
   */
  updateParams_: function() {
    // Check for duplicated arguments.
    var badArg = false;
    var hash = {};
    for (var x = 0; x < this.arguments_.length; x++) {
      if (hash['arg_' + this.arguments_[x].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[x].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
    } else {
      this.setWarningText(null);
    }
    // Merge the arguments into a human-readable list.
    var paramString = '';
    if (this.arguments_.length) {
      paramString = Blockly.Msg.PROCEDURES_BEFORE_PARAMS +
          ' ' + this.arguments_.join(', ');
    }
    this.setFieldValue(paramString, 'PARAMS');
  },
  /**
   * Create XML to represent the argument inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    for (var x = 0; x < this.arguments_.length; x++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[x]);
      container.appendChild(parameter);
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        this.arguments_.push(childNode.getAttribute('name'));
      }
    }
    this.updateParams_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = Blockly.Block.obtain(workspace,
                                           'procedures_mutatorcontainer');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.arguments_.length; x++) {
      var paramBlock = Blockly.Block.obtain(workspace, 'procedures_mutatorarg');
      paramBlock.initSvg();
      paramBlock.setFieldValue(this.arguments_[x], 'NAME');
      // Store the old location.
      paramBlock.oldLocation = x;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers("function",
                                     this.workspace, this.arguments_, null);
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    this.arguments_ = [];
    this.paramIds_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      this.arguments_.push(paramBlock.getFieldValue('NAME'));
      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
        this.workspace, this.arguments_, this.paramIds_);
  },
  /**
   * Dispose of any callers.
   * @this Blockly.Block
   */
  dispose: function() {
    var name = this.getFieldValue('NAME');
    Blockly.Procedures.disposeCallers(name, this.workspace);
    // Call parent's destructor.
    Blockly.Block.prototype.dispose.apply(this, arguments);
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return this.arguments_;
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    var change = false;
    for (var x = 0; x < this.arguments_.length; x++) {
      if (Blockly.Names.equals(oldName, this.arguments_[x])) {
        this.arguments_[x] = newName;
        change = true;
      }
    }
    if (change) {
      this.updateParams_();
      // Update the mutator's variables if the mutator is open.
      if (this.mutator.isVisible_()) {
        var blocks = this.mutator.workspace_.getAllBlocks();
        for (var x = 0, block; block = blocks[x]; x++) {
          if (block.type == 'procedures_mutatorarg' &&
              Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
            block.setFieldValue(newName, 'NAME');
          }
        }
      }
    }
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    // Add option to create caller.
    var option = {enabled: true};
    var name = this.getFieldValue('NAME');
    option.text = Blockly.Msg.PROCEDURES_CREATE_DO.replace('%1', name);
    var xmlMutation = goog.dom.createDom('mutation');
    xmlMutation.setAttribute('name', name);
    for (var x = 0; x < this.arguments_.length; x++) {
      var xmlArg = goog.dom.createDom('arg');
      xmlArg.setAttribute('name', this.arguments_[x]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = goog.dom.createDom('block', null, xmlMutation);
    xmlBlock.setAttribute('type', this.callType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (var x = 0; x < this.arguments_.length; x++) {
        var option = {enabled: true};
        var name = this.arguments_[x];
        option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
        var xmlField = goog.dom.createDom('field', null, name);
        xmlField.setAttribute('name', 'VAR');
        var xmlBlock = goog.dom.createDom('block', null, xmlField);
        xmlBlock.setAttribute('type', 'variables_get');
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
      }
    }
  },
  callType_: 'procedures_callnoreturn'
};

Blockly.Blocks['local_var'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("NAME")
        .appendField("set local")
        .appendField(new Blockly.FieldVariable("item"), "VARIABLE")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  getVars: function(){
    var variable = this.getFieldValue('VARIABLE')

    return [variable];
  },
  is_local: true
};

Blockly.Blocks['set_location'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(40);
    this.appendValueInput("ENTITY")
        .appendField("Move");
    this.appendValueInput("LOCATION")
        .setCheck("Location")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['teleport'] = {
  init: function() {
    this.setColour(40);
    this.appendValueInput("ENTITY")
        .appendField("Teleport");
    this.appendValueInput("LOCATION")
        .setCheck("Location")
        .appendField("to");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['dot'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/doxygen/df/d08/namespaceorg_1_1bukkit_1_1event.html');
    this.setColour(330);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable("item"), "THING")
        .appendField("'s")
        .appendField(new Blockly.FieldTextInput("default"), "NAME");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['perform_command'] = {
  init: function() {
    this.setColour(15);
    this.appendValueInput("COMMAND")
        .setCheck("String")
        .appendField("perform command");
    this.appendValueInput("PLAYER")
        .setCheck("Player")
        .appendField("for player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['give_item'] = {
  init: function() {
    this.setColour(15);
    this.appendValueInput("NUMBER")
        .setCheck("Number")
        .appendField("Give");
    this.appendValueInput("ITEM")
        .setCheck("Material")
        .appendField("of item type");
    this.appendValueInput("PLAYER")
        .setCheck("Player")
        .appendField("to player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['remove_items'] = {
  init: function() {
    this.setColour(15);
    this.appendValueInput("NAME")
        .setCheck("Material")
        .appendField("Remove all items of type");
    this.appendValueInput("PLAYER")
        .setCheck("Player")
        .appendField(" from player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['remove_all_items'] = {
  init: function() {
    this.setColour(15);
    this.appendValueInput("PLAYER")
        .setCheck("Player")
        .appendField("Remove all items from player");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ACTIVATOR_RAIL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ACTIVATOR_RAIL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};
Blockly.Blocks['block_type_CRAFTING_TABLE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CRAFTING_TABLE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_AIR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("AIR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ANVIL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ANVIL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_APPLE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("APPLE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ARROW'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ARROW");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BAKED_POTATO'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BAKED_POTATO");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BEACON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BEACON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BED'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BED");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BED_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BED_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BEDROCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BEDROCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BIRCH_WOOD_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BIRCH_WOOD_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BLAZE_POWDER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BLAZE_POWDER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BLAZE_ROD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BLAZE_ROD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BOAT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BOAT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BOOK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BOOK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BOOK_AND_QUILL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BOOK_AND_QUILL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BOOKSHELF'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BOOKSHELF");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BOW'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BOW");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BOWL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BOWL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BREAD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BREAD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BREWING_STAND'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BREWING_STAND");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BREWING_STAND_ITEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BREWING_STAND_ITEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BRICK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BRICK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BRICK_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BRICK_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BROWN_MUSHROOM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BROWN_MUSHROOM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BUCKET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BUCKET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_BURNING_FURNACE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("BURNING_FURNACE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CACTUS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CACTUS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CAKE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CAKE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CAKE_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CAKE_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CARPET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CARPET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CARROT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CARROT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CARROT_ITEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CARROT_ITEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CARROT_STICK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CARROT_STICK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CAULDRON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CAULDRON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CAULDRON_ITEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CAULDRON_ITEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CHAINMAIL_BOOTS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CHAINMAIL_BOOTS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CHAINMAIL_CHESTPLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CHAINMAIL_CHESTPLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CHAINMAIL_HELMET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CHAINMAIL_HELMET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CHAINMAIL_LEGGINGS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CHAINMAIL_LEGGINGS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CHEST'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CHEST");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CLAY'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CLAY");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CLAY_BALL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CLAY_BALL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CLAY_BRICK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CLAY_BRICK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COAL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COAL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COAL_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COAL_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COAL_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COAL_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COBBLE_WALL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COBBLE_WALL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COBBLESTONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COBBLESTONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COBBLESTONE_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COBBLESTONE_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COCOA'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COCOA");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COMMAND'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COMMAND");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COMPASS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COMPASS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COOKED_BEEF'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COOKED_BEEF");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COOKED_CHICKEN'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COOKED_CHICKEN");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COOKED_FISH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COOKED_FISH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_COOKIE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("COOKIE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_CROPS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("CROPS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DAYLIGHT_DETECTOR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DAYLIGHT_DETECTOR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DEAD_BUSH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DEAD_BUSH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DETECTOR_RAIL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DETECTOR_RAIL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_AXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_AXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_BARDING'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_BARDING");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_BOOTS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_BOOTS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_CHESTPLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_CHESTPLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_HELMET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_HELMET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_HOE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_HOE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_LEGGINGS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_LEGGINGS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_PICKAXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_PICKAXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_SPADE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_SPADE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIAMOND_SWORD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIAMOND_SWORD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIODE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIODE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIODE_BLOCK_OFF'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIODE_BLOCK_OFF");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIODE_BLOCK_ON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIODE_BLOCK_ON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DIRT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DIRT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DISPENSER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DISPENSER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DOUBLE_STEP'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DOUBLE_STEP");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DRAGON_EGG'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DRAGON_EGG");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_DROPPER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("DROPPER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EGG'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EGG");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EMERALD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EMERALD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EMERALD_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EMERALD_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EMERALD_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EMERALD_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EMPTY_MAP'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EMPTY_MAP");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ENCHANTED_BOOK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ENCHANTED_BOOK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ENCHANTMENT_TABLE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ENCHANTMENT_TABLE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ENDER_CHEST'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ENDER_CHEST");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ENDER_PEARL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ENDER_PEARL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ENDER_PORTAL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ENDER_PORTAL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ENDER_PORTAL_FRAME'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ENDER_PORTAL_FRAME");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ENDER_STONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ENDER_STONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EXP_BOTTLE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EXP_BOTTLE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EXPLOSIVE_MINECART'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EXPLOSIVE_MINECART");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_EYE_OF_ENDER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("EYE_OF_ENDER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FEATHER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FEATHER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FENCE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FENCE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FENCE_GATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FENCE_GATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FERMENTED_SPIDER_EYE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FERMENTED_SPIDER_EYE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FIRE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FIRE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FIREBALL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FIREBALL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FIREWORK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FIREWORK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FIREWORK_CHARGE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FIREWORK_CHARGE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FISHING_ROD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FISHING_ROD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FLINT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FLINT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FLINT_AND_STEEL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FLINT_AND_STEEL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FLOWER_POT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FLOWER_POT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FLOWER_POT_ITEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FLOWER_POT_ITEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_FURNACE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("FURNACE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GHAST_TEAR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GHAST_TEAR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GLASS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GLASS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GLASS_BOTTLE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GLASS_BOTTLE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GLOWING_REDSTONE_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GLOWING_REDSTONE_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GLOWSTONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GLOWSTONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GLOWSTONE_DUST'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GLOWSTONE_DUST");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_AXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_AXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_BARDING'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_BARDING");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_BOOTS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_BOOTS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_CHESTPLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_CHESTPLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_HELMET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_HELMET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_HOE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_HOE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_INGOT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_INGOT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_LEGGINGS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_LEGGINGS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_NUGGET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_NUGGET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_PICKAXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_PICKAXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_PLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_PLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_RECORD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_RECORD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_SPADE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_SPADE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLD_SWORD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLD_SWORD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLDEN_APPLE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLDEN_APPLE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GOLDEN_CARROT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GOLDEN_CARROT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GRASS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GRASS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GRAVEL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GRAVEL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GREEN_RECORD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GREEN_RECORD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_GRILLED_PORK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("GRILLED_PORK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_HARD_CLAY'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("HARD_CLAY");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_HAY_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("HAY_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_HOPPER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("HOPPER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_HOPPER_MINECART'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("HOPPER_MINECART");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_HUGE_MUSHROOM_1'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("HUGE_MUSHROOM_1");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_HUGE_MUSHROOM_2'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("HUGE_MUSHROOM_2");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ICE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ICE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_INK_SACK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("INK_SACK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_AXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_AXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_BARDING'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_BARDING");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_BOOTS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_BOOTS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_CHESTPLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_CHESTPLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_DOOR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_DOOR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_DOOR_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_DOOR_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_FENCE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_FENCE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_HELMET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_HELMET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_HOE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_HOE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_INGOT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_INGOT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_LEGGINGS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_LEGGINGS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_PICKAXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_PICKAXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_PLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_PLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_SPADE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_SPADE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_IRON_SWORD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("IRON_SWORD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ITEM_FRAME'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ITEM_FRAME");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_JACK_O_LANTERN'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("JACK_O_LANTERN");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_JUKEBOX'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("JUKEBOX");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_JUNGLE_WOOD_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("JUNGLE_WOOD_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LADDER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LADDER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LAPIS_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LAPIS_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LAPIS_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LAPIS_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LAVA'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LAVA");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LAVA_BUCKET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LAVA_BUCKET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEASH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEASH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEATHER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEATHER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEATHER_BOOTS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEATHER_BOOTS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEATHER_CHESTPLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEATHER_CHESTPLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEATHER_HELMET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEATHER_HELMET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEATHER_LEGGINGS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEATHER_LEGGINGS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEAVES'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEAVES");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LEVER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LEVER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LOCKED_CHEST'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LOCKED_CHEST");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LOG'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LOG");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_LONG_GRASS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("LONG_GRASS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MAGMA_CREAM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MAGMA_CREAM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MAP'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MAP");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MELON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MELON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MELON_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MELON_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MELON_SEEDS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MELON_SEEDS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MELON_STEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MELON_STEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MILK_BUCKET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MILK_BUCKET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MINECART'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MINECART");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MOB_SPAWNER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MOB_SPAWNER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MONSTER_EGG'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MONSTER_EGG");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MONSTER_EGGS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MONSTER_EGGS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MOSSY_COBBLESTONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MOSSY_COBBLESTONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MUSHROOM_SOUP'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MUSHROOM_SOUP");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_MYCEL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("MYCEL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NAME_TAG'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NAME_TAG");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHER_BRICK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHER_BRICK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHER_BRICK_ITEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHER_BRICK_ITEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHER_BRICK_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHER_BRICK_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHER_FENCE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHER_FENCE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHER_STALK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHER_STALK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHER_STAR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHER_STAR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHER_WARTS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHER_WARTS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NETHERRACK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NETHERRACK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_NOTE_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("NOTE_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_OBSIDIAN'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("OBSIDIAN");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PAINTING'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PAINTING");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PAPER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PAPER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PISTON_BASE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PISTON_BASE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PISTON_EXTENSION'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PISTON_EXTENSION");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PISTON_MOVING_PIECE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PISTON_MOVING_PIECE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PISTON_STICKY_BASE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PISTON_STICKY_BASE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_POISONOUS_POTATO'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("POISONOUS_POTATO");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PORK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PORK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PORTAL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PORTAL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_POTATO'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("POTATO");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_POTATO_ITEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("POTATO_ITEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_POTION'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("POTION");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_POWERED_MINECART'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("POWERED_MINECART");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_POWERED_RAIL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("POWERED_RAIL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PUMPKIN'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PUMPKIN");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PUMPKIN_PIE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PUMPKIN_PIE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PUMPKIN_SEEDS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PUMPKIN_SEEDS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_PUMPKIN_STEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("PUMPKIN_STEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_QUARTZ'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("QUARTZ");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_QUARTZ_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("QUARTZ_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_QUARTZ_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("QUARTZ_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_QUARTZ_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("QUARTZ_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RAILS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RAILS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RAW_BEEF'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RAW_BEEF");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RAW_CHICKEN'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RAW_CHICKEN");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RAW_FISH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RAW_FISH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_10'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_10");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_11'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_11");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_12'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_12");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_3'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_3");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_4'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_4");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_5'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_5");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_6'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_6");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_7'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_7");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_8'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_8");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RECORD_9'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RECORD_9");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RED_MUSHROOM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RED_MUSHROOM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_RED_ROSE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("RED_ROSE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_COMPARATOR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_COMPARATOR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_COMPARATOR_OFF'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_COMPARATOR_OFF");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_COMPARATOR_ON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_COMPARATOR_ON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_LAMP_OFF'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_LAMP_OFF");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_LAMP_ON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_LAMP_ON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_ORE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_ORE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_TORCH_OFF'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_TORCH_OFF");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_TORCH_ON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_TORCH_ON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_REDSTONE_WIRE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("REDSTONE_WIRE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_ROTTEN_FLESH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("ROTTEN_FLESH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SADDLE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SADDLE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SAND'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SAND");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SANDSTONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SANDSTONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SANDSTONE_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SANDSTONE_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SAPLING'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SAPLING");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SEEDS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SEEDS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SHEARS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SHEARS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SIGN'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SIGN");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SIGN_POST'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SIGN_POST");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SKULL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SKULL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SKULL_ITEM'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SKULL_ITEM");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SLIME_BALL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SLIME_BALL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SMOOTH_BRICK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SMOOTH_BRICK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SMOOTH_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SMOOTH_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SNOW'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SNOW");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SNOW_BALL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SNOW_BALL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SNOW_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SNOW_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SOIL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SOIL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SOUL_SAND'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SOUL_SAND");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SPECKLED_MELON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SPECKLED_MELON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SPIDER_EYE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SPIDER_EYE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SPONGE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SPONGE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SPRUCE_WOOD_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SPRUCE_WOOD_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STAINED_CLAY'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STAINED_CLAY");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STATIONARY_LAVA'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STATIONARY_LAVA");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STATIONARY_WATER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STATIONARY_WATER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STEP'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STEP");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STICK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STICK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE_AXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE_AXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE_BUTTON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE_BUTTON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE_HOE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE_HOE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE_PICKAXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE_PICKAXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE_PLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE_PLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE_SPADE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE_SPADE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STONE_SWORD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STONE_SWORD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STORAGE_MINECART'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STORAGE_MINECART");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_STRING'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("STRING");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SUGAR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SUGAR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SUGAR_CANE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SUGAR_CANE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SUGAR_CANE_BLOCK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SUGAR_CANE_BLOCK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_SULPHUR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("SULPHUR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_THIN_GLASS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("THIN_GLASS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_TNT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("TNT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_TORCH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("TORCH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_TRAP_DOOR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("TRAP_DOOR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_TRAPPED_CHEST'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("TRAPPED_CHEST");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_TRIPWIRE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("TRIPWIRE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_TRIPWIRE_HOOK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("TRIPWIRE_HOOK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_VINE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("VINE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WALL_SIGN'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WALL_SIGN");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WATCH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WATCH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WATER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WATER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WATER_BUCKET'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WATER_BUCKET");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WATER_LILY'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WATER_LILY");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WEB'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WEB");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WHEAT'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WHEAT");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_AXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_AXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_BUTTON'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_BUTTON");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_DOOR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_DOOR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_DOUBLE_STEP'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_DOUBLE_STEP");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_HOE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_HOE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_PICKAXE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_PICKAXE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_PLATE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_PLATE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_SPADE'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_SPADE");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_STAIRS'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_STAIRS");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_STEP'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_STEP");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOD_SWORD'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOD_SWORD");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOODEN_DOOR'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOODEN_DOOR");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WOOL'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WOOL");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WORKBENCH'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WORKBENCH");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_WRITTEN_BOOK'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("WRITTEN_BOOK");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};


Blockly.Blocks['block_type_YELLOW_FLOWER'] = {
  init: function() {
    this.setHelpUrl('http://jd.bukkit.org/rb/apidocs/org/bukkit/Material.html');
    this.setColour(290);
    this.appendDummyInput()
        .appendField("YELLOW_FLOWER");
    this.setInputsInline(true);
    this.setOutput(true, "Material");
    this.setTooltip('');
  }
};

Blockly.Blocks['set_meta'] = {
  init: function() {
    this.setColour(145);
    this.appendValueInput("VAL")
        .setCheck("String")
        .appendField("set hidden data");
    this.appendValueInput("KEY")
        .setCheck("String")
        .appendField("named");
    this.appendValueInput("LOCATION")
        .setCheck("Location")
        .appendField("at location");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['get_meta'] = {
  init: function() {
    this.setColour(145);
    this.appendValueInput("KEY")
        .setCheck("String")
        .appendField("get hidden data named");
    this.appendValueInput("LOCATION")
        .setCheck("Location")
        .appendField("at location");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};



var imports = {}

Blockly.Blocks['import'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(0);

    var me = this
    var do_import = function(t){
      $.get("/programs/"+t+".txt?full_text=true",
        function(d){
          imports[t] = d
          
          me.setColour(145); 
      })
      return t;
    }

    var import_timeout = undefined;

    this.appendDummyInput()
        .appendField("import ")
        .appendField(new Blockly.FieldTextInput("lib_name", function(t){
          if(import_timeout){
            clearInterval(import_timeout);
          } 
          import_timeout = setTimeout(function(){
            do_import(t);
          }, 1000)

          return t
        }), "LIB")

    this.setInputsInline(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['export'] = {
  init: function() {
    this.setColour(145);

    this.appendDummyInput()
        .appendField("export ")
        .appendField(new Blockly.FieldTextInput("fun_name"), "FUN")

    this.setInputsInline(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['spawn_entity'] = {
  init: function() {
    this.setColour(145);
    this.appendValueInput("ENTITY")
        .appendField("Spawn entity of type");
    this.appendValueInput("LOCATION")
        .appendField("at location");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};


Blockly.Blocks['new_object'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(260);
    this.appendDummyInput()
        .appendField("new object");
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['put_object'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(260);
    this.appendValueInput("VALUE")
        .appendField("put value");
    this.appendDummyInput()
        .appendField("called")
        .appendField(new Blockly.FieldTextInput("name"), "NAME")
        .appendField("in")
        .appendField(new Blockly.FieldVariable("variable"), "VAR");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['get_object'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(260);
    this.appendDummyInput()
        .appendField("get value named")
        .appendField(new Blockly.FieldTextInput("name"), "NAME")
        .appendField("from")
        .appendField(new Blockly.FieldVariable("variable"), "VAR");
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['call_mutator_item'] = {
  /**
   * Mutator block for add items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField("input");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};

Blockly.Blocks['call_mutator_container'] = {
  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField("inputs");
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  }
};

Blockly.Blocks['call'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("OBJ")
        .appendField("on");
    this.appendDummyInput()
        .appendField("call")
        .appendField(new Blockly.FieldTextInput("fun"), "FUN");
    this.appendValueInput("ADD0")
        .appendField("with");
    this.appendValueInput('ADD1');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.setMutator(new Blockly.Mutator(['call_mutator_item']));
    this.itemCount_ = 2;
  },

  /**
   * Create XML to represent number of text inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x);
      if (x == 0) {
        input.appendField("with");
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = Blockly.Block.obtain(workspace,
                                           'call_mutator_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = Blockly.Block.obtain(workspace, 'call_mutator_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_);
      if (this.itemCount_ == 0) {
        input.appendField("with");
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
  
};


//Call and return (pretty much duplicates from the above block.  Should probably clean up after learning more about Blockly.


Blockly.Blocks['callret'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("OBJ")
        .appendField("on");
    this.appendDummyInput()
        .appendField("call")
        .appendField(new Blockly.FieldTextInput("fun"), "FUN");
    this.appendValueInput("ADD0")
        .appendField("with");
    this.appendValueInput('ADD1');
    this.setOutput(true);
    this.setTooltip('');
    this.setMutator(new Blockly.Mutator(['call_mutator_item']));
    this.itemCount_ = 2;
  },

  /**
   * Create XML to represent number of text inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x);
      if (x == 0) {
        input.appendField("with");
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = Blockly.Block.obtain(workspace,
                                           'call_mutator_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = Blockly.Block.obtain(workspace, 'call_mutator_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_);
      if (this.itemCount_ == 0) {
        input.appendField("with");
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
  
};

/**
 * @license
 * Visual Blocks Language
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
 * @fileoverview Generating JavaScript for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

//goog.provide('Blockly.JavaScript.text');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['js'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  // TODO: Assemble JavaScript into code variable.
  // TODO: Change ORDER_NONE to the correct strength.
  return [text_func_name, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['js_noret'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  // TODO: Assemble JavaScript into code variable.
  // TODO: Change ORDER_NONE to the correct strength.
  return text_func_name+"\n";
};

Blockly.JavaScript['functionblock'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  // TODO: Assemble JavaScript into code variable.
  var code = text_func_name.replace(" ", "_");
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['functionblock_dropdown'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  // TODO: Assemble JavaScript into code variable.
  if(!text_func_name) text_func_name = "";
  var code = text_func_name.replace(" ", "_");
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['calljavaon'] = function(block) {
  var value_func = Blockly.JavaScript.valueToCode(block, 'func', Blockly.JavaScript.ORDER_ATOMIC);
  var value_evt = Blockly.JavaScript.valueToCode(block, 'evt', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = ''+value_evt+'.'+value_func+'()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['typeof'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_name+'.getType()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['mob'] = function(block) {
  this.setHelpUrl('/book/docs/drone-docs');
  var variable_drone = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_drone+'.mob('+value_name+');\n';
  return code;
};

Blockly.JavaScript['eval'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'eval('+value_name+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['me'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'me';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['new_drone'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'new Drone(me, me.location)';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['drone_move'] = function(block) {
  var variable_drone = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var text_distance = block.getFieldValue('DISTANCE');
  // TODO: Assemble JavaScript into code variable.
  var code = variable_drone + "." + dropdown_direction + "("+text_distance+");\n";
  return code;
};

Blockly.JavaScript['drone_move_2'] = function(block) {
  var variable_drone = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var value_distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_drone + "." + dropdown_direction + "("+value_distance+");\n";
  return code;
};

Blockly.JavaScript['drone_rotate'] = function(block) {
  var variable_drone = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var value_num_rotations = Blockly.JavaScript.valueToCode(block, 'NUM_ROTATIONS', Blockly.JavaScript.ORDER_ATOMIC) % 4;
  if(dropdown_direction == "counter-clockwise")
    value_num_rotations = 4 - value_num_rotations
  // TODO: Assemble JavaScript into code variable.
  var code = variable_drone + ".turn("+value_num_rotations+");\n";
  return code;
};

Blockly.JavaScript['block_place'] = function(block) {
  var value_material = Blockly.JavaScript.valueToCode(block, 'MATERIAL', Blockly.JavaScript.ORDER_ATOMIC);
  var variable_drone = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_drone + ".box(" + value_material + ");\n";
  return code;
};

/**
Blockly.JavaScript['new_material'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = dropdown_name;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
**/

Blockly.JavaScript['get_location'] = function(block) {
  var value_thing = Blockly.JavaScript.valueToCode(block, 'THING', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_thing + ".getLocation()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['player'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'player('+value_name+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.JavaScript['world'] = function(block) {
  var dropdown_method = block.getFieldValue('METHOD');
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "world."+dropdown_method+"("+value_location+");\n";
  return code;
};

Blockly.JavaScript['send'] = function(block) {
  var value_message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_player+".sendMessage("+value_message+");\n";
  return code;
};

Blockly.JavaScript['interval'] = function(block) {
  var value_function = Blockly.JavaScript.valueToCode(block, 'FUNCTION', Blockly.JavaScript.ORDER_ATOMIC);
  var value_millis = Blockly.JavaScript.valueToCode(block, 'MILLIS', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "interval(me,"+value_function+","+value_millis+");\n";
  return code;
};

Blockly.JavaScript['timeout'] = function(block) {
  var value_function = Blockly.JavaScript.valueToCode(block, 'FUNCTION', Blockly.JavaScript.ORDER_ATOMIC);
  var value_millis = Blockly.JavaScript.valueToCode(block, 'MILLIS', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "setTimeout("+value_function+","+value_millis+");\n";
  return code;
};

Blockly.JavaScript['event'] = function(block) {
  var value_function = Blockly.JavaScript.valueToCode(block, 'FUNCTION', Blockly.JavaScript.ORDER_ATOMIC);
  var value_event = Blockly.JavaScript.valueToCode(block, 'EVENT', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "events.when("+value_event+","+value_function+", me);\n";
  return code;
};

Blockly.JavaScript['new_event'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = "'"+dropdown_name+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.JavaScript['potion_effect'] = function(block) {
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  var text_duration = block.getFieldValue('DURATION');
  var text_amplifier = block.getFieldValue('AMPLIFIER');
  var dropdown_effect = block.getFieldValue('EFFECT');
  // TODO: Assemble JavaScript into code variable.
  var code = value_player + ".addPotionEffect(new PotionEffect(PotionEffectType."+dropdown_effect+","+(text_duration*20)+","+text_amplifier+" ));\n";
  // TODO: Change ORDER_NONE to the correct strength.
  return code
};

Blockly.JavaScript['entity_type'] = function(block) {
  var dropdown_type = block.getFieldValue('TYPE');
  // TODO: Assemble JavaScript into code variable.
  var code = 'EntityType.'+dropdown_type;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.JavaScript['anon_func'] = function(block) {
  var statements_code = Blockly.JavaScript.statementToCode(block, 'CODE');
  // TODO: Assemble JavaScript into code variable.
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.JavaScript.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function('+args.join(', ')+'){\n';
  code += statements_code;
  code += '}';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['local_var'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var variable_variable = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = 'var ' + variable_variable + " = " + value_name + ";\n";
  return code;
};

Blockly.JavaScript['set_location'] = function(block) {
  var value_entity = Blockly.JavaScript.valueToCode(block, 'ENTITY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_entity+'.setLocation('+value_location+');\n';
  return code;
};

Blockly.JavaScript['teleport'] = function(block) {
  var value_entity = Blockly.JavaScript.valueToCode(block, 'ENTITY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_entity+'.teleport('+value_location+');\n';
  return code;
};


Blockly.JavaScript['dot'] = function(block) {
  var variable_thing = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('THING'), Blockly.Variables.NAME_TYPE);
  var text_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = variable_thing + '.get' + text_name.charAt(0).toUpperCase() + text_name.slice(1) + '()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['perform_command'] = function(block) {
  var value_command = Blockly.JavaScript.valueToCode(block, 'COMMAND', Blockly.JavaScript.ORDER_ATOMIC);
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  var code = "var evt = new org.bukkit.event.player.PlayerCommandPreprocessEvent("+value_player+", ('/'+"+value_command+"));\n";
  code = code + "server.getPluginManager().callEvent(evt);\n";
  code = code + "if (!evt.isCancelled()) {\n";
  code = code + value_player + ".performCommand("+value_command+");\n";
  code = code + "}\n";
  return code;
};

Blockly.JavaScript['give_item'] = function(block) {
  var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
  var value_item = Blockly.JavaScript.valueToCode(block, 'ITEM', Blockly.JavaScript.ORDER_ATOMIC);
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_player + ".getInventory().addItem([new ItemStack("+value_item+","+value_number+")]);\n"+value_player+".updateInventory();\n";
  return code;
};

Blockly.JavaScript['remove_items'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_player + ".getInventory().remove("+value_name+");\n"+value_player+".updateInventory();\n";
  return code;
};


Blockly.JavaScript['remove_all_items'] = function(block) {
  var value_player = Blockly.JavaScript.valueToCode(block, 'PLAYER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_player + ".getInventory().clear();\n";
  return code;
};


Blockly.JavaScript['set_meta'] = function(block) {
  var value_key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'setMeta('+ value_key +','+ value_val+','+ value_location+');\n';
  return code;
};


Blockly.JavaScript['get_meta'] = function(block) {
  var value_key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'getMeta('+ value_key +','+ value_location+')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};







Blockly.JavaScript['block_type_ACTIVATOR_RAIL'] = function(block) {
  var code = 'Material.ACTIVATOR_RAIL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['block_type_CRAFTING_TABLE'] = function(block) {
  var code = 'Material.WORKBENCH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_AIR'] = function(block) {
  var code = 'Material.AIR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ANVIL'] = function(block) {
  var code = 'Material.ANVIL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_APPLE'] = function(block) {
  var code = 'Material.APPLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ARROW'] = function(block) {
  var code = 'Material.ARROW';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BAKED_POTATO'] = function(block) {
  var code = 'Material.BAKED_POTATO';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BEACON'] = function(block) {
  var code = 'Material.BEACON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BED'] = function(block) {
  var code = 'Material.BED';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BED_BLOCK'] = function(block) {
  var code = 'Material.BED_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BEDROCK'] = function(block) {
  var code = 'Material.BEDROCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BIRCH_WOOD_STAIRS'] = function(block) {
  var code = 'Material.BIRCH_WOOD_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BLAZE_POWDER'] = function(block) {
  var code = 'Material.BLAZE_POWDER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BLAZE_ROD'] = function(block) {
  var code = 'Material.BLAZE_ROD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BOAT'] = function(block) {
  var code = 'Material.BOAT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BONE'] = function(block) {
  var code = 'Material.BONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BOOK'] = function(block) {
  var code = 'Material.BOOK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BOOK_AND_QUILL'] = function(block) {
  var code = 'Material.BOOK_AND_QUILL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BOOKSHELF'] = function(block) {
  var code = 'Material.BOOKSHELF';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BOW'] = function(block) {
  var code = 'Material.BOW';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BOWL'] = function(block) {
  var code = 'Material.BOWL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BREAD'] = function(block) {
  var code = 'Material.BREAD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BREWING_STAND'] = function(block) {
  var code = 'Material.BREWING_STAND';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BREWING_STAND_ITEM'] = function(block) {
  var code = 'Material.BREWING_STAND_ITEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BRICK'] = function(block) {
  var code = 'Material.BRICK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BRICK_STAIRS'] = function(block) {
  var code = 'Material.BRICK_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BROWN_MUSHROOM'] = function(block) {
  var code = 'Material.BROWN_MUSHROOM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BUCKET'] = function(block) {
  var code = 'Material.BUCKET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_BURNING_FURNACE'] = function(block) {
  var code = 'Material.BURNING_FURNACE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CACTUS'] = function(block) {
  var code = 'Material.CACTUS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CAKE'] = function(block) {
  var code = 'Material.CAKE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CAKE_BLOCK'] = function(block) {
  var code = 'Material.CAKE_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CARPET'] = function(block) {
  var code = 'Material.CARPET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};



Blockly.JavaScript['block_type_CARROT_ITEM'] = function(block) {
  var code = 'Material.CARROT_ITEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CARROT_STICK'] = function(block) {
  var code = 'Material.CARROT_STICK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CAULDRON'] = function(block) {
  var code = 'Material.CAULDRON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CAULDRON_ITEM'] = function(block) {
  var code = 'Material.CAULDRON_ITEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CHAINMAIL_BOOTS'] = function(block) {
  var code = 'Material.CHAINMAIL_BOOTS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CHAINMAIL_CHESTPLATE'] = function(block) {
  var code = 'Material.CHAINMAIL_CHESTPLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CHAINMAIL_HELMET'] = function(block) {
  var code = 'Material.CHAINMAIL_HELMET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CHAINMAIL_LEGGINGS'] = function(block) {
  var code = 'Material.CHAINMAIL_LEGGINGS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CHEST'] = function(block) {
  var code = 'Material.CHEST';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CLAY'] = function(block) {
  var code = 'Material.CLAY';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CLAY_BALL'] = function(block) {
  var code = 'Material.CLAY_BALL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CLAY_BRICK'] = function(block) {
  var code = 'Material.CLAY_BRICK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COAL'] = function(block) {
  var code = 'Material.COAL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COAL_BLOCK'] = function(block) {
  var code = 'Material.COAL_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COAL_ORE'] = function(block) {
  var code = 'Material.COAL_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COBBLE_WALL'] = function(block) {
  var code = 'Material.COBBLE_WALL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COBBLESTONE'] = function(block) {
  var code = 'Material.COBBLESTONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COBBLESTONE_STAIRS'] = function(block) {
  var code = 'Material.COBBLESTONE_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COCOA'] = function(block) {
  var code = 'Material.COCOA';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COMMAND'] = function(block) {
  var code = 'Material.COMMAND';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COMPASS'] = function(block) {
  var code = 'Material.COMPASS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COOKED_BEEF'] = function(block) {
  var code = 'Material.COOKED_BEEF';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COOKED_CHICKEN'] = function(block) {
  var code = 'Material.COOKED_CHICKEN';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COOKED_FISH'] = function(block) {
  var code = 'Material.COOKED_FISH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_COOKIE'] = function(block) {
  var code = 'Material.COOKIE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_CROPS'] = function(block) {
  var code = 'Material.CROPS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DAYLIGHT_DETECTOR'] = function(block) {
  var code = 'Material.DAYLIGHT_DETECTOR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DEAD_BUSH'] = function(block) {
  var code = 'Material.DEAD_BUSH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DETECTOR_RAIL'] = function(block) {
  var code = 'Material.DETECTOR_RAIL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND'] = function(block) {
  var code = 'Material.DIAMOND';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_AXE'] = function(block) {
  var code = 'Material.DIAMOND_AXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_BARDING'] = function(block) {
  var code = 'Material.DIAMOND_BARDING';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_BLOCK'] = function(block) {
  var code = 'Material.DIAMOND_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_BOOTS'] = function(block) {
  var code = 'Material.DIAMOND_BOOTS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_CHESTPLATE'] = function(block) {
  var code = 'Material.DIAMOND_CHESTPLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_HELMET'] = function(block) {
  var code = 'Material.DIAMOND_HELMET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_HOE'] = function(block) {
  var code = 'Material.DIAMOND_HOE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_LEGGINGS'] = function(block) {
  var code = 'Material.DIAMOND_LEGGINGS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_ORE'] = function(block) {
  var code = 'Material.DIAMOND_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_PICKAXE'] = function(block) {
  var code = 'Material.DIAMOND_PICKAXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_SPADE'] = function(block) {
  var code = 'Material.DIAMOND_SPADE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIAMOND_SWORD'] = function(block) {
  var code = 'Material.DIAMOND_SWORD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIODE'] = function(block) {
  var code = 'Material.DIODE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIODE_BLOCK_OFF'] = function(block) {
  var code = 'Material.DIODE_BLOCK_OFF';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIODE_BLOCK_ON'] = function(block) {
  var code = 'Material.DIODE_BLOCK_ON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DIRT'] = function(block) {
  var code = 'Material.DIRT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DISPENSER'] = function(block) {
  var code = 'Material.DISPENSER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DOUBLE_STEP'] = function(block) {
  var code = 'Material.DOUBLE_STEP';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DRAGON_EGG'] = function(block) {
  var code = 'Material.DRAGON_EGG';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_DROPPER'] = function(block) {
  var code = 'Material.DROPPER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EGG'] = function(block) {
  var code = 'Material.EGG';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EMERALD'] = function(block) {
  var code = 'Material.EMERALD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EMERALD_BLOCK'] = function(block) {
  var code = 'Material.EMERALD_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EMERALD_ORE'] = function(block) {
  var code = 'Material.EMERALD_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EMPTY_MAP'] = function(block) {
  var code = 'Material.EMPTY_MAP';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ENCHANTED_BOOK'] = function(block) {
  var code = 'Material.ENCHANTED_BOOK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ENCHANTMENT_TABLE'] = function(block) {
  var code = 'Material.ENCHANTMENT_TABLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ENDER_CHEST'] = function(block) {
  var code = 'Material.ENDER_CHEST';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ENDER_PEARL'] = function(block) {
  var code = 'Material.ENDER_PEARL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ENDER_PORTAL'] = function(block) {
  var code = 'Material.ENDER_PORTAL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ENDER_PORTAL_FRAME'] = function(block) {
  var code = 'Material.ENDER_PORTAL_FRAME';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ENDER_STONE'] = function(block) {
  var code = 'Material.ENDER_STONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EXP_BOTTLE'] = function(block) {
  var code = 'Material.EXP_BOTTLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EXPLOSIVE_MINECART'] = function(block) {
  var code = 'Material.EXPLOSIVE_MINECART';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_EYE_OF_ENDER'] = function(block) {
  var code = 'Material.EYE_OF_ENDER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FEATHER'] = function(block) {
  var code = 'Material.FEATHER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FENCE'] = function(block) {
  var code = 'Material.FENCE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FENCE_GATE'] = function(block) {
  var code = 'Material.FENCE_GATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FERMENTED_SPIDER_EYE'] = function(block) {
  var code = 'Material.FERMENTED_SPIDER_EYE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FIRE'] = function(block) {
  var code = 'Material.FIRE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FIREBALL'] = function(block) {
  var code = 'Material.FIREBALL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FIREWORK'] = function(block) {
  var code = 'Material.FIREWORK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FIREWORK_CHARGE'] = function(block) {
  var code = 'Material.FIREWORK_CHARGE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FISHING_ROD'] = function(block) {
  var code = 'Material.FISHING_ROD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FLINT'] = function(block) {
  var code = 'Material.FLINT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FLINT_AND_STEEL'] = function(block) {
  var code = 'Material.FLINT_AND_STEEL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FLOWER_POT'] = function(block) {
  var code = 'Material.FLOWER_POT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FLOWER_POT_ITEM'] = function(block) {
  var code = 'Material.FLOWER_POT_ITEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_FURNACE'] = function(block) {
  var code = 'Material.FURNACE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GHAST_TEAR'] = function(block) {
  var code = 'Material.GHAST_TEAR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GLASS'] = function(block) {
  var code = 'Material.GLASS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GLASS_BOTTLE'] = function(block) {
  var code = 'Material.GLASS_BOTTLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GLOWING_REDSTONE_ORE'] = function(block) {
  var code = 'Material.GLOWING_REDSTONE_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GLOWSTONE'] = function(block) {
  var code = 'Material.GLOWSTONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GLOWSTONE_DUST'] = function(block) {
  var code = 'Material.GLOWSTONE_DUST';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_AXE'] = function(block) {
  var code = 'Material.GOLD_AXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_BARDING'] = function(block) {
  var code = 'Material.GOLD_BARDING';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_BLOCK'] = function(block) {
  var code = 'Material.GOLD_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_BOOTS'] = function(block) {
  var code = 'Material.GOLD_BOOTS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_CHESTPLATE'] = function(block) {
  var code = 'Material.GOLD_CHESTPLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_HELMET'] = function(block) {
  var code = 'Material.GOLD_HELMET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_HOE'] = function(block) {
  var code = 'Material.GOLD_HOE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_INGOT'] = function(block) {
  var code = 'Material.GOLD_INGOT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_LEGGINGS'] = function(block) {
  var code = 'Material.GOLD_LEGGINGS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_NUGGET'] = function(block) {
  var code = 'Material.GOLD_NUGGET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_ORE'] = function(block) {
  var code = 'Material.GOLD_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_PICKAXE'] = function(block) {
  var code = 'Material.GOLD_PICKAXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_PLATE'] = function(block) {
  var code = 'Material.GOLD_PLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_RECORD'] = function(block) {
  var code = 'Material.GOLD_RECORD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_SPADE'] = function(block) {
  var code = 'Material.GOLD_SPADE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLD_SWORD'] = function(block) {
  var code = 'Material.GOLD_SWORD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLDEN_APPLE'] = function(block) {
  var code = 'Material.GOLDEN_APPLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GOLDEN_CARROT'] = function(block) {
  var code = 'Material.GOLDEN_CARROT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GRASS'] = function(block) {
  var code = 'Material.GRASS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GRAVEL'] = function(block) {
  var code = 'Material.GRAVEL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GREEN_RECORD'] = function(block) {
  var code = 'Material.GREEN_RECORD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_GRILLED_PORK'] = function(block) {
  var code = 'Material.GRILLED_PORK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_HARD_CLAY'] = function(block) {
  var code = 'Material.HARD_CLAY';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_HAY_BLOCK'] = function(block) {
  var code = 'Material.HAY_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_HOPPER'] = function(block) {
  var code = 'Material.HOPPER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_HOPPER_MINECART'] = function(block) {
  var code = 'Material.HOPPER_MINECART';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_HUGE_MUSHROOM_1'] = function(block) {
  var code = 'Material.HUGE_MUSHROOM_1';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_HUGE_MUSHROOM_2'] = function(block) {
  var code = 'Material.HUGE_MUSHROOM_2';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ICE'] = function(block) {
  var code = 'Material.ICE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_INK_SACK'] = function(block) {
  var code = 'Material.INK_SACK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_AXE'] = function(block) {
  var code = 'Material.IRON_AXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_BARDING'] = function(block) {
  var code = 'Material.IRON_BARDING';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_BLOCK'] = function(block) {
  var code = 'Material.IRON_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_BOOTS'] = function(block) {
  var code = 'Material.IRON_BOOTS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_CHESTPLATE'] = function(block) {
  var code = 'Material.IRON_CHESTPLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_DOOR'] = function(block) {
  var code = 'Material.IRON_DOOR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_DOOR_BLOCK'] = function(block) {
  var code = 'Material.IRON_DOOR_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_FENCE'] = function(block) {
  var code = 'Material.IRON_FENCE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_HELMET'] = function(block) {
  var code = 'Material.IRON_HELMET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_HOE'] = function(block) {
  var code = 'Material.IRON_HOE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_INGOT'] = function(block) {
  var code = 'Material.IRON_INGOT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_LEGGINGS'] = function(block) {
  var code = 'Material.IRON_LEGGINGS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_ORE'] = function(block) {
  var code = 'Material.IRON_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_PICKAXE'] = function(block) {
  var code = 'Material.IRON_PICKAXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_PLATE'] = function(block) {
  var code = 'Material.IRON_PLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_SPADE'] = function(block) {
  var code = 'Material.IRON_SPADE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_IRON_SWORD'] = function(block) {
  var code = 'Material.IRON_SWORD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ITEM_FRAME'] = function(block) {
  var code = 'Material.ITEM_FRAME';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_JACK_O_LANTERN'] = function(block) {
  var code = 'Material.JACK_O_LANTERN';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_JUKEBOX'] = function(block) {
  var code = 'Material.JUKEBOX';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_JUNGLE_WOOD_STAIRS'] = function(block) {
  var code = 'Material.JUNGLE_WOOD_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LADDER'] = function(block) {
  var code = 'Material.LADDER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LAPIS_BLOCK'] = function(block) {
  var code = 'Material.LAPIS_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LAPIS_ORE'] = function(block) {
  var code = 'Material.LAPIS_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LAVA'] = function(block) {
  var code = 'Material.LAVA';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LAVA_BUCKET'] = function(block) {
  var code = 'Material.LAVA_BUCKET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEASH'] = function(block) {
  var code = 'Material.LEASH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEATHER'] = function(block) {
  var code = 'Material.LEATHER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEATHER_BOOTS'] = function(block) {
  var code = 'Material.LEATHER_BOOTS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEATHER_CHESTPLATE'] = function(block) {
  var code = 'Material.LEATHER_CHESTPLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEATHER_HELMET'] = function(block) {
  var code = 'Material.LEATHER_HELMET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEATHER_LEGGINGS'] = function(block) {
  var code = 'Material.LEATHER_LEGGINGS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEAVES'] = function(block) {
  var code = 'Material.LEAVES';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LEVER'] = function(block) {
  var code = 'Material.LEVER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LOCKED_CHEST'] = function(block) {
  var code = 'Material.LOCKED_CHEST';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LOG'] = function(block) {
  var code = 'Material.LOG';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_LONG_GRASS'] = function(block) {
  var code = 'Material.LONG_GRASS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MAGMA_CREAM'] = function(block) {
  var code = 'Material.MAGMA_CREAM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MAP'] = function(block) {
  var code = 'Material.MAP';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MELON'] = function(block) {
  var code = 'Material.MELON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MELON_BLOCK'] = function(block) {
  var code = 'Material.MELON_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MELON_SEEDS'] = function(block) {
  var code = 'Material.MELON_SEEDS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MELON_STEM'] = function(block) {
  var code = 'Material.MELON_STEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MILK_BUCKET'] = function(block) {
  var code = 'Material.MILK_BUCKET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MINECART'] = function(block) {
  var code = 'Material.MINECART';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MOB_SPAWNER'] = function(block) {
  var code = 'Material.MOB_SPAWNER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MONSTER_EGG'] = function(block) {
  var code = 'Material.MONSTER_EGG';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MONSTER_EGGS'] = function(block) {
  var code = 'Material.MONSTER_EGGS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MOSSY_COBBLESTONE'] = function(block) {
  var code = 'Material.MOSSY_COBBLESTONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MUSHROOM_SOUP'] = function(block) {
  var code = 'Material.MUSHROOM_SOUP';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_MYCEL'] = function(block) {
  var code = 'Material.MYCEL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NAME_TAG'] = function(block) {
  var code = 'Material.NAME_TAG';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHER_BRICK'] = function(block) {
  var code = 'Material.NETHER_BRICK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHER_BRICK_ITEM'] = function(block) {
  var code = 'Material.NETHER_BRICK_ITEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHER_BRICK_STAIRS'] = function(block) {
  var code = 'Material.NETHER_BRICK_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHER_FENCE'] = function(block) {
  var code = 'Material.NETHER_FENCE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHER_STALK'] = function(block) {
  var code = 'Material.NETHER_STALK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHER_STAR'] = function(block) {
  var code = 'Material.NETHER_STAR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHER_WARTS'] = function(block) {
  var code = 'Material.NETHER_WARTS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NETHERRACK'] = function(block) {
  var code = 'Material.NETHERRACK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_NOTE_BLOCK'] = function(block) {
  var code = 'Material.NOTE_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_OBSIDIAN'] = function(block) {
  var code = 'Material.OBSIDIAN';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PAINTING'] = function(block) {
  var code = 'Material.PAINTING';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PAPER'] = function(block) {
  var code = 'Material.PAPER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PISTON_BASE'] = function(block) {
  var code = 'Material.PISTON_BASE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PISTON_EXTENSION'] = function(block) {
  var code = 'Material.PISTON_EXTENSION';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PISTON_MOVING_PIECE'] = function(block) {
  var code = 'Material.PISTON_MOVING_PIECE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PISTON_STICKY_BASE'] = function(block) {
  var code = 'Material.PISTON_STICKY_BASE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_POISONOUS_POTATO'] = function(block) {
  var code = 'Material.POISONOUS_POTATO';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PORK'] = function(block) {
  var code = 'Material.PORK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PORTAL'] = function(block) {
  var code = 'Material.PORTAL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_POTATO'] = function(block) {
  var code = 'Material.POTATO';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_POTATO_ITEM'] = function(block) {
  var code = 'Material.POTATO_ITEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_POTION'] = function(block) {
  var code = 'Material.POTION';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_POWERED_MINECART'] = function(block) {
  var code = 'Material.POWERED_MINECART';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_POWERED_RAIL'] = function(block) {
  var code = 'Material.POWERED_RAIL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PUMPKIN'] = function(block) {
  var code = 'Material.PUMPKIN';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PUMPKIN_PIE'] = function(block) {
  var code = 'Material.PUMPKIN_PIE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PUMPKIN_SEEDS'] = function(block) {
  var code = 'Material.PUMPKIN_SEEDS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_PUMPKIN_STEM'] = function(block) {
  var code = 'Material.PUMPKIN_STEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_QUARTZ'] = function(block) {
  var code = 'Material.QUARTZ';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_QUARTZ_BLOCK'] = function(block) {
  var code = 'Material.QUARTZ_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_QUARTZ_ORE'] = function(block) {
  var code = 'Material.QUARTZ_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_QUARTZ_STAIRS'] = function(block) {
  var code = 'Material.QUARTZ_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RAILS'] = function(block) {
  var code = 'Material.RAILS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RAW_BEEF'] = function(block) {
  var code = 'Material.RAW_BEEF';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RAW_CHICKEN'] = function(block) {
  var code = 'Material.RAW_CHICKEN';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RAW_FISH'] = function(block) {
  var code = 'Material.RAW_FISH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_10'] = function(block) {
  var code = 'Material.RECORD_10';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_11'] = function(block) {
  var code = 'Material.RECORD_11';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_12'] = function(block) {
  var code = 'Material.RECORD_12';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_3'] = function(block) {
  var code = 'Material.RECORD_3';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_4'] = function(block) {
  var code = 'Material.RECORD_4';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_5'] = function(block) {
  var code = 'Material.RECORD_5';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_6'] = function(block) {
  var code = 'Material.RECORD_6';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_7'] = function(block) {
  var code = 'Material.RECORD_7';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_8'] = function(block) {
  var code = 'Material.RECORD_8';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RECORD_9'] = function(block) {
  var code = 'Material.RECORD_9';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RED_MUSHROOM'] = function(block) {
  var code = 'Material.RED_MUSHROOM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_RED_ROSE'] = function(block) {
  var code = 'Material.RED_ROSE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE'] = function(block) {
  var code = 'Material.REDSTONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_BLOCK'] = function(block) {
  var code = 'Material.REDSTONE_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_COMPARATOR'] = function(block) {
  var code = 'Material.REDSTONE_COMPARATOR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_COMPARATOR_OFF'] = function(block) {
  var code = 'Material.REDSTONE_COMPARATOR_OFF';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_COMPARATOR_ON'] = function(block) {
  var code = 'Material.REDSTONE_COMPARATOR_ON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_LAMP_OFF'] = function(block) {
  var code = 'Material.REDSTONE_LAMP_OFF';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_LAMP_ON'] = function(block) {
  var code = 'Material.REDSTONE_LAMP_ON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_ORE'] = function(block) {
  var code = 'Material.REDSTONE_ORE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_TORCH_OFF'] = function(block) {
  var code = 'Material.REDSTONE_TORCH_OFF';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_TORCH_ON'] = function(block) {
  var code = 'Material.REDSTONE_TORCH_ON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_REDSTONE_WIRE'] = function(block) {
  var code = 'Material.REDSTONE_WIRE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_ROTTEN_FLESH'] = function(block) {
  var code = 'Material.ROTTEN_FLESH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SADDLE'] = function(block) {
  var code = 'Material.SADDLE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SAND'] = function(block) {
  var code = 'Material.SAND';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SANDSTONE'] = function(block) {
  var code = 'Material.SANDSTONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SANDSTONE_STAIRS'] = function(block) {
  var code = 'Material.SANDSTONE_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SAPLING'] = function(block) {
  var code = 'Material.SAPLING';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SEEDS'] = function(block) {
  var code = 'Material.SEEDS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SHEARS'] = function(block) {
  var code = 'Material.SHEARS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SIGN'] = function(block) {
  var code = 'Material.SIGN';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SIGN_POST'] = function(block) {
  var code = 'Material.SIGN_POST';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SKULL'] = function(block) {
  var code = 'Material.SKULL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SKULL_ITEM'] = function(block) {
  var code = 'Material.SKULL_ITEM';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SLIME_BALL'] = function(block) {
  var code = 'Material.SLIME_BALL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SMOOTH_BRICK'] = function(block) {
  var code = 'Material.SMOOTH_BRICK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SMOOTH_STAIRS'] = function(block) {
  var code = 'Material.SMOOTH_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SNOW'] = function(block) {
  var code = 'Material.SNOW';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SNOW_BALL'] = function(block) {
  var code = 'Material.SNOW_BALL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SNOW_BLOCK'] = function(block) {
  var code = 'Material.SNOW_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SOIL'] = function(block) {
  var code = 'Material.SOIL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SOUL_SAND'] = function(block) {
  var code = 'Material.SOUL_SAND';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SPECKLED_MELON'] = function(block) {
  var code = 'Material.SPECKLED_MELON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SPIDER_EYE'] = function(block) {
  var code = 'Material.SPIDER_EYE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SPONGE'] = function(block) {
  var code = 'Material.SPONGE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SPRUCE_WOOD_STAIRS'] = function(block) {
  var code = 'Material.SPRUCE_WOOD_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STAINED_CLAY'] = function(block) {
  var code = 'Material.STAINED_CLAY';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STATIONARY_LAVA'] = function(block) {
  var code = 'Material.STATIONARY_LAVA';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STATIONARY_WATER'] = function(block) {
  var code = 'Material.STATIONARY_WATER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STEP'] = function(block) {
  var code = 'Material.STEP';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STICK'] = function(block) {
  var code = 'Material.STICK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE'] = function(block) {
  var code = 'Material.STONE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE_AXE'] = function(block) {
  var code = 'Material.STONE_AXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE_BUTTON'] = function(block) {
  var code = 'Material.STONE_BUTTON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE_HOE'] = function(block) {
  var code = 'Material.STONE_HOE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE_PICKAXE'] = function(block) {
  var code = 'Material.STONE_PICKAXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE_PLATE'] = function(block) {
  var code = 'Material.STONE_PLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE_SPADE'] = function(block) {
  var code = 'Material.STONE_SPADE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STONE_SWORD'] = function(block) {
  var code = 'Material.STONE_SWORD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STORAGE_MINECART'] = function(block) {
  var code = 'Material.STORAGE_MINECART';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_STRING'] = function(block) {
  var code = 'Material.STRING';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SUGAR'] = function(block) {
  var code = 'Material.SUGAR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SUGAR_CANE'] = function(block) {
  var code = 'Material.SUGAR_CANE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SUGAR_CANE_BLOCK'] = function(block) {
  var code = 'Material.SUGAR_CANE_BLOCK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_SULPHUR'] = function(block) {
  var code = 'Material.SULPHUR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_THIN_GLASS'] = function(block) {
  var code = 'Material.THIN_GLASS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_TNT'] = function(block) {
  var code = 'Material.TNT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_TORCH'] = function(block) {
  var code = 'Material.TORCH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_TRAP_DOOR'] = function(block) {
  var code = 'Material.TRAP_DOOR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_TRAPPED_CHEST'] = function(block) {
  var code = 'Material.TRAPPED_CHEST';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_TRIPWIRE'] = function(block) {
  var code = 'Material.TRIPWIRE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_TRIPWIRE_HOOK'] = function(block) {
  var code = 'Material.TRIPWIRE_HOOK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_VINE'] = function(block) {
  var code = 'Material.VINE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WALL_SIGN'] = function(block) {
  var code = 'Material.WALL_SIGN';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WATCH'] = function(block) {
  var code = 'Material.WATCH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WATER'] = function(block) {
  var code = 'Material.WATER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WATER_BUCKET'] = function(block) {
  var code = 'Material.WATER_BUCKET';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WATER_LILY'] = function(block) {
  var code = 'Material.WATER_LILY';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WEB'] = function(block) {
  var code = 'Material.WEB';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WHEAT'] = function(block) {
  var code = 'Material.WHEAT';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD'] = function(block) {
  var code = 'Material.WOOD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_AXE'] = function(block) {
  var code = 'Material.WOOD_AXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_BUTTON'] = function(block) {
  var code = 'Material.WOOD_BUTTON';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_DOOR'] = function(block) {
  var code = 'Material.WOOD_DOOR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_DOUBLE_STEP'] = function(block) {
  var code = 'Material.WOOD_DOUBLE_STEP';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_HOE'] = function(block) {
  var code = 'Material.WOOD_HOE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_PICKAXE'] = function(block) {
  var code = 'Material.WOOD_PICKAXE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_PLATE'] = function(block) {
  var code = 'Material.WOOD_PLATE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_SPADE'] = function(block) {
  var code = 'Material.WOOD_SPADE';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_STAIRS'] = function(block) {
  var code = 'Material.WOOD_STAIRS';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_STEP'] = function(block) {
  var code = 'Material.WOOD_STEP';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOD_SWORD'] = function(block) {
  var code = 'Material.WOOD_SWORD';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOODEN_DOOR'] = function(block) {
  var code = 'Material.WOODEN_DOOR';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WOOL'] = function(block) {
  var code = 'Material.WOOL';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WORKBENCH'] = function(block) {
  var code = 'Material.WORKBENCH';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_WRITTEN_BOOK'] = function(block) {
  var code = 'Material.WRITTEN_BOOK';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['block_type_YELLOW_FLOWER'] = function(block) {
  var code = 'Material.YELLOW_FLOWER';
  return [code, Blockly.JavaScript.ORDER_NONE];
};




Blockly.JavaScript['import'] = function(block) {
  var text_lib = block.getFieldValue('LIB');

  var xml = imports[text_lib].split("<SEP>")[0]
  var js = imports[text_lib].split("<SEP>")[1]

  //Find the exported things
  var dom = Blockly.Xml.textToDom(xml)
  var all_blocks = dom.getElementsByTagName("block")
  
  var exports = []
  for(var i = 0; i < all_blocks.length; i++)
  {
    var current = all_blocks[i]
    if(current.attributes["type"].value == "export")
    {
      var fun_name = current.children[0].innerHTML ;
      exports.push("this."+fun_name+"="+fun_name); 
    }
  }
  


  // TODO: Assemble JavaScript into code variable.

  //Gives all the imported functions a namespace prefix
  var code = "var " + text_lib.replace("-","_") + " = new function(){\n" + js + "\n"+ exports.join(";\n") +"\n}"
  return code;
};

Blockly.JavaScript['export'] = function(block) {
  return ""  
};


Blockly.JavaScript['spawn_entity'] = function(block) {
  var value_entity = Blockly.JavaScript.valueToCode(block, 'ENTITY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "world.spawnEntity("+value_location+","+value_entity+")";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['new_object'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '{}';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['put_object'] = function(block) {
  var value_value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
  var text_name = block.getFieldValue('NAME');
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_var + '.' + text_name + "=" + value_value + ";\n";
  return code;
};

Blockly.JavaScript['get_object'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_var + '.' + text_name;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['call'] = function(block) {
  var value_obj = Blockly.JavaScript.valueToCode(block, 'OBJ', Blockly.JavaScript.ORDER_ATOMIC);
  var text_fun = block.getFieldValue('FUN');
  var value_with = Blockly.JavaScript.valueToCode(block, 'WITH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code;
  if (block.itemCount_ == 0) {
    code = value_obj + "." + text_fun + '();\n';
    return code;
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.JavaScript.valueToCode(block, 'ADD0',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    code = value_obj + "." + text_fun + '(' + argument0 + ');\n';
    return code;
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.JavaScript.valueToCode(block, 'ADD0',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.JavaScript.valueToCode(block, 'ADD1',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    code =value_obj + "." +  text_fun + '(' + argument0 + ',' + argument1 + ');\n';
    return code;
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
          Blockly.JavaScript.ORDER_COMMA) || '\'\'';
    }
    code = value_obj + "." +  text_fun+ '(' + code.join(',') + ');\n';
    return code;
  }
};


Blockly.JavaScript['callret'] = function(block) {
  var value_obj = Blockly.JavaScript.valueToCode(block, 'OBJ', Blockly.JavaScript.ORDER_ATOMIC);
  var text_fun = block.getFieldValue('FUN');
  var value_with = Blockly.JavaScript.valueToCode(block, 'WITH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code;
  if (block.itemCount_ == 0) {
    code = value_obj + "." + text_fun + '()';
    return [code, Blockly.JavaScript.ORDER_NONE];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.JavaScript.valueToCode(block, 'ADD0',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    code = value_obj + "." + text_fun + '(' + argument0 + ')';
    return [code, Blockly.JavaScript.ORDER_NONE];
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.JavaScript.valueToCode(block, 'ADD0',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.JavaScript.valueToCode(block, 'ADD1',
        Blockly.JavaScript.ORDER_NONE) || '\'\'';
    code =value_obj + "." +  text_fun + '(' + argument0 + ',' + argument1 + ')';
    return [code, Blockly.JavaScript.ORDER_NONE];
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
          Blockly.JavaScript.ORDER_COMMA) || '\'\'';
    }
    code = value_obj + "." +  text_fun+ '(' + code.join(',') + ')';
    return [code, Blockly.JavaScript.ORDER_NONE];
  }
};

Blockly.Blocks['particle_HUGE_EXPLOSION'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('HUGE_EXPLOSION');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_HUGE_EXPLOSION'] = function(block) {
    var code = 'particle.particles.HUGE_EXPLOSION';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_LARGE_EXPLOSION'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('LARGE_EXPLOSION');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_LARGE_EXPLOSION'] = function(block) {
    var code = 'particle.particles.LARGE_EXPLOSION';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_FIREWORKS_SPARK'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('FIREWORKS_SPARK');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_FIREWORKS_SPARK'] = function(block) {
    var code = 'particle.particles.FIREWORKS_SPARK';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_BUBBLE'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('BUBBLE');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_BUBBLE'] = function(block) {
    var code = 'particle.particles.BUBBLE';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_SUSPEND'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('SUSPEND');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_SUSPEND'] = function(block) {
    var code = 'particle.particles.SUSPEND';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_DEPTH_SUSPEND'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('DEPTH_SUSPEND');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_DEPTH_SUSPEND'] = function(block) {
    var code = 'particle.particles.DEPTH_SUSPEND';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_TOWN_AURA'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('TOWN_AURA');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_TOWN_AURA'] = function(block) {
    var code = 'particle.particles.TOWN_AURA';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_CRIT'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('CRIT');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_CRIT'] = function(block) {
    var code = 'particle.particles.CRIT';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_MAGIC_CRIT'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('MAGIC_CRIT');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_MAGIC_CRIT'] = function(block) {
    var code = 'particle.particles.MAGIC_CRIT';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_MOB_SPELL'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('MOB_SPELL');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_MOB_SPELL'] = function(block) {
    var code = 'particle.particles.MOB_SPELL';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_MOB_SPELL_AMBIENT'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('MOB_SPELL_AMBIENT');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_MOB_SPELL_AMBIENT'] = function(block) {
    var code = 'particle.particles.MOB_SPELL_AMBIENT';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_SPELL'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('SPELL');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_SPELL'] = function(block) {
    var code = 'particle.particles.SPELL';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_INSTANT_SPELL'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('INSTANT_SPELL');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_INSTANT_SPELL'] = function(block) {
    var code = 'particle.particles.INSTANT_SPELL';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_WITCH_MAGIC'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('WITCH_MAGIC');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_WITCH_MAGIC'] = function(block) {
    var code = 'particle.particles.WITCH_MAGIC';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_NOTE'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('NOTE');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_NOTE'] = function(block) {
    var code = 'particle.particles.NOTE';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_PORTAL'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('PORTAL');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_PORTAL'] = function(block) {
    var code = 'particle.particles.PORTAL';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_ENCHANTMENT_TABLE'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('ENCHANTMENT_TABLE');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_ENCHANTMENT_TABLE'] = function(block) {
    var code = 'particle.particles.ENCHANTMENT_TABLE';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_EXPLODE'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('EXPLODE');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_EXPLODE'] = function(block) {
    var code = 'particle.particles.EXPLODE';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_FLAME'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('FLAME');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_FLAME'] = function(block) {
    var code = 'particle.particles.FLAME';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_LAVA'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('LAVA');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_LAVA'] = function(block) {
    var code = 'particle.particles.LAVA';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_FOOTSTEP'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('FOOTSTEP');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_FOOTSTEP'] = function(block) {
    var code = 'particle.particles.FOOTSTEP';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_SPLASH'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('SPLASH');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_SPLASH'] = function(block) {
    var code = 'particle.particles.SPLASH';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_LARGE_SMOKE'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('LARGE_SMOKE');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_LARGE_SMOKE'] = function(block) {
    var code = 'particle.particles.LARGE_SMOKE';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_CLOUD'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('CLOUD');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_CLOUD'] = function(block) {
    var code = 'particle.particles.CLOUD';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_RED_DUST'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('RED_DUST');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_RED_DUST'] = function(block) {
    var code = 'particle.particles.RED_DUST';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_SNOWBALL_POOF'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('SNOWBALL_POOF');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_SNOWBALL_POOF'] = function(block) {
    var code = 'particle.particles.SNOWBALL_POOF';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_DRIP_WATER'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('DRIP_WATER');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_DRIP_WATER'] = function(block) {
    var code = 'particle.particles.DRIP_WATER';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_DRIP_LAVA'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('DRIP_LAVA');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_DRIP_LAVA'] = function(block) {
    var code = 'particle.particles.DRIP_LAVA';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_SNOW_SHOVEL'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('SNOW_SHOVEL');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_SNOW_SHOVEL'] = function(block) {
    var code = 'particle.particles.SNOW_SHOVEL';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_SLIME'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('SLIME');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_SLIME'] = function(block) {
    var code = 'particle.particles.SLIME';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_HEART'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('HEART');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_HEART'] = function(block) {
    var code = 'particle.particles.HEART';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_ANGRY_VILLAGER'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('ANGRY_VILLAGER');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_ANGRY_VILLAGER'] = function(block) {
    var code = 'particle.particles.ANGRY_VILLAGER';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.Blocks['particle_HAPPY_VILLAGER'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.appendDummyInput()
            .appendField('HAPPY_VILLAGER');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
    }
};
Blockly.JavaScript['particle_HAPPY_VILLAGER'] = function(block) {
    var code = 'particle.particles.HAPPY_VILLAGER';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['point_particle'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("particle")
        .appendField("spawn particle");
    this.appendValueInput("location")
        .setCheck("Location")
        .appendField("at location");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['point_particle'] = function(block) {
  var value_particle = Blockly.JavaScript.valueToCode(block, 'particle', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'particle.point('+value_particle+', '+value_location+');\n';
  return code;
};


Blockly.Blocks['fluff'] = {
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField("...");
    this.appendStatementInput("stuff")
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  
  overrideColor: function(color){
    this.svg_.svgPath_.setAttribute("fill", color) 
    this.svg_.svgPathLight_.setAttribute("fill", color) 
    this.svg_.svgPathDark_.setAttribute("fill", color) 
  },

  getColour: function(){
    this.svg_.updateColour = function(){
      this.svgPath_.setAttribute("fill", "white") 
      this.svgPathLight_.setAttribute("fill", "white") 
      this.svgPathLight_.setAttribute("stroke", "white") 
      this.svgPathDark_.setAttribute("fill", "white") 

      $(this.svgGroup_).find("text")[0].setAttribute("class", "blocklyTextBlack")
    }
    //this.overrideColor("white")
  }
}

Blockly.JavaScript['fluff'] = function(block){
  var code = Blockly.JavaScript.statementToCode(block, 'stuff');
  return code 
}

Blockly.Block.prototype.fluff = function(){
  var old_parent_connection = this.previousConnection.targetConnection
  var old_child            = this.nextConnection.targetBlock()
  var old_child_connection = this.nextConnection.targetConnection



  var new_parent = Blockly.Block.obtain(this.workspace,"fluff") 
  new_parent.initSvg()
  new_parent.render()

  this.unplug()
  this.setParent(null)

  if(this.nextConnection.otherConnection)
    this.nextConnection.disconnect()

  new_parent.inputList[1].connection.connect(this.previousConnection)

  if(old_child)
    old_child.setParent(null)

  old_parent_connection.connect(new_parent.previousConnection)
  if(old_child_connection)
    new_parent.nextConnection.connect(old_child_connection)

  new_parent.overrideColor("white")
}


Blockly.Blocks['cloud_write'] = {
  init: function() {
    this.appendValueInput("mod_name")
        .appendField("write data for mod named")
        .setCheck("String")
    this.appendValueInput("key")
        .appendField("with key")
        .setCheck("String")
    this.appendValueInput("value")
        .appendField("and value")
        .setCheck("String")
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['cloud_read'] = {
  init: function() {
    this.appendValueInput("mod_name")
        .appendField("read data for mod named")
        .setCheck("String")
    this.appendValueInput("key")
        .appendField("with key")
        .setCheck("String")
    this.setInputsInline(true);
    this.setOutput(true);
  }
};

Blockly.JavaScript['cloud_write'] = function(block) {
  var mod_name = Blockly.JavaScript.valueToCode(block, 'mod_name', Blockly.JavaScript.ORDER_ATOMIC);
  var key = Blockly.JavaScript.valueToCode(block, 'key', Blockly.JavaScript.ORDER_ATOMIC);
  var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'cloud.write('+mod_name+', '+key+','+ value+');\n';
  return code;
};

Blockly.JavaScript['cloud_read'] = function(block) {
  var mod_name = Blockly.JavaScript.valueToCode(block, 'mod_name', Blockly.JavaScript.ORDER_ATOMIC);
  var key = Blockly.JavaScript.valueToCode(block, 'key', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'cloud.read('+mod_name+', '+key+')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


//End multi player











//Single player

Blockly.Blocks['creatures'] = {
  init: function() {
    this.setColour(135);
    this.appendValueInput("CREATURES")
        .appendField("Creatures")
        .setCheck("Array");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['creatures'] = function(block) {
  var creatures = Blockly.JavaScript.valueToCode(block, 'CREATURES', Blockly.JavaScript.ORDER_NONE);
  var code = 'this.creatures =' + 
                creatures
             + "\n;\n"
  return code;
};


Blockly.Blocks['body_part'] = {
  init: function() {
    this.setColour(195);
    this.appendDummyInput()
        .appendField("Body Part");
    this.appendValueInput("TAGS")
        .appendField("Tags");
    this.appendValueInput("SIZE")
        .appendField("Size");
    this.appendValueInput("COLOR")
        .appendField("Color")
        .setCheck("Colour")
    this.appendValueInput("JOINTS")
        .appendField("Joints")
        .setCheck("Array");
    this.setOutput(true, "Part");
  }
};

Blockly.JavaScript['body_part'] = function(block) {
  var value_tags = Blockly.JavaScript.valueToCode(block, 'TAGS', Blockly.JavaScript.ORDER_NONE);
  var value_size = Blockly.JavaScript.valueToCode(block, 'SIZE', Blockly.JavaScript.ORDER_NONE);
  var value_color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_NONE);
  var joints = Blockly.JavaScript.valueToCode(block, 'JOINTS', Blockly.JavaScript.ORDER_NONE);
  // TODO: Assemble JavaScript into code variable.
  var code = '{\n'+
             '   "tags":' + value_tags + ',\n' +
             '   "size":' + value_size + ',\n' +
             '   "color":' + value_color + ',\n' +
             '   "joints": ' + joints + '\n' +
             '\n}'
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['add_joint'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField("Add Joint to Part");
    this.appendValueInput("PART")
    this.appendValueInput("JOINT")
        .appendField("Joint")
        .setCheck("Joint");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['add_joint'] = function(block) {
  var value_part = Blockly.JavaScript.valueToCode(block, 'PART', Blockly.JavaScript.ORDER_NONE);
  var joint = Blockly.JavaScript.valueToCode(block, 'JOINT', Blockly.JavaScript.ORDER_NONE);

  var code = value_part + "[\"joints\"].push("+joint+");\n"

  return code;
};

Blockly.Blocks['set_height'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField("Set part height");
    this.appendValueInput("PART")
    this.appendValueInput("HEIGHT")
        .appendField("Height")
        .setCheck("Number");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['set_height'] = function(block) {
  var value_part = Blockly.JavaScript.valueToCode(block, 'PART', Blockly.JavaScript.ORDER_NONE);
  var height = Blockly.JavaScript.valueToCode(block, 'HEIGHT', Blockly.JavaScript.ORDER_NONE);

  var code = value_part + "[\"height\"] = "+height+";\n"

  return code;
};


Blockly.Blocks['joint'] = {
  init: function() {
   this.setColour(20);
    this.appendDummyInput()
        .appendField("Joint from")
        .appendField(new Blockly.FieldDropdown([["top", "top"], ["bottom", "bottom"], ["left", "left"], ["right", "right"], ["front", "front"], ["back", "back"]]), "FROM")
        .appendField("to")
        .appendField(new Blockly.FieldDropdown([["top", "top"], ["bottom", "bottom"], ["left", "left"], ["right", "right"], ["front", "front"], ["back", "back"]]), "TO");
    this.appendValueInput("OFFSET")
        .appendField("Offset");
    this.appendValueInput("PART")
        .setCheck("Part")
        .appendField("Part");
    this.setOutput(true, "Joint");
  }
};

Blockly.JavaScript['joint'] = function(block) {
  var from = block.getFieldValue('FROM');
  var to = block.getFieldValue('TO');
  var offset = Blockly.JavaScript.valueToCode(block, 'OFFSET', Blockly.JavaScript.ORDER_NONE);
  var part = Blockly.JavaScript.valueToCode(block, 'PART', Blockly.JavaScript.ORDER_NONE);

  var code = '{\n' +
             '   "side": "'+from+'",\n' +
             '   "offset": '+offset+',\n' +
             '   "attached": {\n' +
             '     "side": "'+to+'",\n' +
             '     "part": ' + part + '\n' +
             '    }\n' +
             '}\n'
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['vector3'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.appendValueInput("X")
        .setCheck("Number")
        .appendField("x");
    this.appendValueInput("Y")
        .setCheck("Number")
        .appendField("y");
    this.appendValueInput("Z")
        .setCheck("Number")
        .appendField("z");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};


Blockly.JavaScript['vector3'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC);
  var y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC);
  var z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "["+[x,y,z].join(",")+"]";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['gui'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("GUI")
        .appendField(new Blockly.FieldTextInput("url"), "url");
    this.setInputsInline(true);
    this.setTooltip('');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(170);
  }
};

Blockly.JavaScript['gui'] = function(block) {
  var gui = block.getFieldValue('url');
  return "this.gui=\""+gui +"\";\n";
};

//End single player
//NPC

Blockly.Blocks['newgoal'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(240);
    this.appendValueInput("goalnpc")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("add goal for NPC")
        .setCheck("NPC");
    this.appendValueInput("shouldexecute")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("starts when");
    this.appendValueInput("run")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("run");
    this.appendValueInput("priority")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("with priority")
        .setCheck("Number");
    this.setTooltip('A NPC will try to execute the run function when the starts when function returns true.');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};



Blockly.JavaScript['newgoal'] = function(block) {
  var value_goalnpc = Blockly.JavaScript.valueToCode(block, 'goalnpc', Blockly.JavaScript.ORDER_ATOMIC);
  var value_shouldexecute = Blockly.JavaScript.valueToCode(block, 'shouldexecute', Blockly.JavaScript.ORDER_ATOMIC);
  var value_run = Blockly.JavaScript.valueToCode(block, 'run', Blockly.JavaScript.ORDER_ATOMIC);
  var value_priority = Blockly.JavaScript.valueToCode(block, 'priority', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'var goal = { npc : '+value_goalnpc+', reset : function() {}, run : '+value_run+', shouldExecute : '+value_shouldexecute+' }; \n goal = new Packages.net.citizensnpcs.api.ai.Goal(goal); \n ';
      code = code + value_goalnpc+'.getDefaultGoalController().addGoal(goal,'+value_priority+'); \n';
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};

Blockly.Blocks['newnpc'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(240);
    this.appendValueInput("type")
        .setCheck("EntityType")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("create new NPC with type");
    this.appendValueInput("named")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("named");
    this.appendValueInput("loc")
        .setCheck("Location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("at location");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("invulnerable")
        .appendField(new Blockly.FieldDropdown([["true", "true"], ["false", "false"]]), "tf");
    this.setOutput(true);
    this.setTooltip('This block creates a new NPC, and spawns it at the given location.');
  }
};

Blockly.JavaScript['newnpc'] = function(block) {
  var value_type = Blockly.JavaScript.valueToCode(block, 'type', Blockly.JavaScript.ORDER_ATOMIC);
  var value_named = Blockly.JavaScript.valueToCode(block, 'named', Blockly.JavaScript.ORDER_ATOMIC);
  var value_loc = Blockly.JavaScript.valueToCode(block, 'loc', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_tf = block.getFieldValue('tf');
  var code = 'citizens.citizen('+value_type+', '+value_named+', '+value_loc+', '+dropdown_tf+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.Blocks['npc_navigate'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(240);
    this.appendValueInput("NPC")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("set navigation of NPC")
        .setCheck("NPC");
    this.appendValueInput("location")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("to location")
        .setCheck("Location");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('The NPC will try to move to the given location.');
  }
};

Blockly.JavaScript['npc_navigate'] = function(block) {
  var value_npc = Blockly.JavaScript.valueToCode(block, 'NPC', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_npc+'.getNavigator().setTarget('+value_location+');\n';
  return code;
};

Blockly.Blocks['npc_navigate_entity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(240);
    this.appendValueInput("npc")
        .setCheck("NPC")
        .appendField("set navigation of NPC");
    this.appendValueInput("entity")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("to entity");
    this.appendValueInput("aggro")
        .setCheck("Boolean")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("is aggressive");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('The NPC will try to move to the given entity.');
  }
};

Blockly.JavaScript['npc_navigate_entity'] = function(block) {
  var value_npc = Blockly.JavaScript.valueToCode(block, 'npc', Blockly.JavaScript.ORDER_ATOMIC);
  var value_entity = Blockly.JavaScript.valueToCode(block, 'entity', Blockly.JavaScript.ORDER_ATOMIC);
  var value_aggro = Blockly.JavaScript.valueToCode(block, 'aggro', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_npc+'.getNavigator().setTarget('+value_entity+', '+value_aggro+');\n';
  return code;
};


Blockly.Blocks['navigation_events'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(240);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["NavigationBeginEvent", "NavigationBeginEvent"], ["NavigationCancelEvent", "NavigationCancelEvent"], ["NavigationCompleteEvent", "NavigationCompleteEvent"], ["NavigationReplaceEvent", "NavigationReplaceEvent"], ["NavigationStuckEvent", "NavigationStuckEvent"]]), "navigation events");
    this.setOutput(true);
    this.setTooltip('These are events related to NPC Navigation.');
  }
};

Blockly.JavaScript['navigation_events'] = function(block) {
  var dropdown_navigation_events = block.getFieldValue('navigation events');
  // TODO: Assemble JavaScript into code variable.
  var code = 'citizens.events.'+dropdown_navigation_events;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['npc_events'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(240);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["NPCSpawnEvent", "NPCSpawnEvent"], ["NPCCollisionEvent", "NPCCollisionEvent"], ["NPCCombustEvent", "NPCCombustEvent"], ["NPCCreateEvent", "NPCCreateEvent"], ["NPCDamageByBlockEvent", "NPCDamageByBlockEvent"], ["NPCDamageByEntityEvent", "NPCDamageByEntityEvent"], ["NPCDeathEvent", "NPCDeathEvent"], ["NPCLeftClickEvent", "NPCLeftClickEvent"], ["NPCRightClickEvent", "NPCRightClickEvent"]]), "npc events");
    this.setOutput(true);
    this.setTooltip('These are events related to custom NPCs.');
  }
};

Blockly.JavaScript['npc_events'] = function(block) {
  var dropdown_npc_events = block.getFieldValue('npc events');
  // TODO: Assemble JavaScript into code variable.
  var code = 'citizens.events.'+dropdown_npc_events;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};
