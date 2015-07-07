var debug
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

function setup_unity_script_more(unity_script){
  unity_script.setup_unity_script_more = setup_unity_script_more
  
  this.setup_colors(unity_script)
  this.setup_math(unity_script)
  this.setup_text(unity_script)
  this.setup_logic(unity_script)
  this.setup_procedures(unity_script)
  this.setup_lists(unity_script)
  this.setup_loops(unity_script)
  this.setup_variables(unity_script)

unity_script.workspaceToCodeAlpha = function workspaceToCodeAlpha(workspace) {
  if(!workspace)
    workspace = Blockly.mainWorkspace


  var code = [];
  this.init(workspace);
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
  code = this.finish(code, workspace);
  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  return code;
};



unity_script.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  unity_script.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  unity_script.functionNames_ = Object.create(null);

  if (Blockly.Variables) {
    if (!unity_script.variableDB_) {
      unity_script.variableDB_ =
          new Blockly.Names(unity_script.RESERVED_WORDS_);
    } else {
      unity_script.variableDB_.reset();
    }

    var defvars = [];
    workspace.getDescendants = function(){ return this.getAllBlocks(); }
    var variables = Blockly.Variables.allVariables(workspace);
    var local_variables = Blockly.Variables.allLocalVariables(workspace);
    for (var x = 0; x < variables.length; x++) {
      if(local_variables.indexOf(variables[x]) != -1 && variables.indexOf(variables[x]) == -1 )
        continue;

      defvars[x] = 'var ' +
          unity_script.variableDB_.getName(variables[x],
          Blockly.Variables.NAME_TYPE) + ';';
    }
    unity_script.definitions_['variables'] = defvars.join('\n');
  }
};

unity_script.finish = function(code, workspace) {
  unity_script.recent_definitions_ = []
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in unity_script.definitions_) {
    definitions.push(unity_script.definitions_[name]);
    unity_script.recent_definitions_[name] = unity_script.definitions_[name];
  }
  return definitions.join('\n\n') + '\n\n\n' + code;
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

unity_script['register_command'] = function(block) {
  var value_command = unity_script.valueToCode(block, 'command', unity_script.ORDER_ATOMIC);
  var value_func = unity_script.valueToCode(block, 'func', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
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
unity_script['paste_schematic'] = function(block) {
  var value_schematic = unity_script.valueToCode(block, 'schematic', unity_script.ORDER_ATOMIC);
  var value_at_location = unity_script.valueToCode(block, 'at location', unity_script.ORDER_ATOMIC);
  var code = 'schematics.paste('+value_schematic+', '+value_at_location+');\n;';
  return code;
};

unity_script['tune'] = function(block) {
  var value_tempo = unity_script.valueToCode(block, 'TEMPO', unity_script.ORDER_ATOMIC);
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code;
  if (block.itemCount_ == 0) {
    code = '';
    return code;
  } else if (block.itemCount_ == 1) {
    var argument0 = unity_script.valueToCode(block, 'ADD0',
        unity_script.ORDER_NONE) || '\'\'';
    code = 'playTune('+value_tempo+', '+value_player+', '+ argument0 + ')';
    return code;
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = unity_script.valueToCode(block, 'ADD' + n,
          unity_script.ORDER_COMMA) || '\'\'';
    }
    code = 'playTune('+value_tempo+', ' +value_player+', ' + code.join(',') + ')';
    return code;
  }
};



unity_script['tone'] = function(block) {
  var dropdown_tone = block.getFieldValue('tone');
  // TODO: Assemble UnityScript into code variable.
  var code = 'new Tone(Tones.'+dropdown_tone+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};
unity_script['fast_tempo'] = function(block) {
  // TODO: Assemble UnityScript into code variable.
  var code = '700';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};
unity_script['rest'] = function(block) {
  // TODO: Assemble UnityScript into code variable.
  var code = '\'rest\'';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};
unity_script['regular_tempo'] = function(block) {
  // TODO: Assemble UnityScript into code variable.
  var code = '500';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};
unity_script['slow_tempo'] = function(block) {
  // TODO: Assemble UnityScript into code variable.
  var code = '300';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['instrument_bass_drum'] = function(block) {
  var value_note = unity_script.valueToCode(block, 'note', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'bass_drum('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};


unity_script['instrument_bass_guitar'] = function(block) {
  var value_note = unity_script.valueToCode(block, 'note', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'bass_guitar('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['instrument_piano'] = function(block) {
  var value_note = unity_script.valueToCode(block, 'note', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'piano('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};


unity_script['instrument_snare_drum'] = function(block) {
  var value_note = unity_script.valueToCode(block, 'note', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'snare_drum('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['instrument_sticks'] = function(block) {
  var value_note = unity_script.valueToCode(block, 'note', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'sticks('+value_note+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['flatten'] = function(block) {
  var value_tone = unity_script.valueToCode(block, 'tone', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'flatten('+value_tone+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};


unity_script['sharpen'] = function(block) {
  var value_tone = unity_script.valueToCode(block, 'tone', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'sharpen('+value_tone+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};
unity_script['keyinjso'] = function(block) {
  var value_key = unity_script.valueToCode(block, 'key', unity_script.ORDER_ATOMIC);
  var value_jso = unity_script.valueToCode(block, 'jso', unity_script.ORDER_ATOMIC);
  var code = value_key + ' in ' + value_jso;
  return [code, unity_script.ORDER_NONE];
};
unity_script['accessjso'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var value_jso = unity_script.valueToCode(block, 'JSO', unity_script.ORDER_ATOMIC);
  var code = value_jso+'['+value_name+']';
  return [code, unity_script.ORDER_NONE];
};
unity_script['setjso'] = function(block) {
  var value_value = unity_script.valueToCode(block, 'value', unity_script.ORDER_ATOMIC);
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var value_jso = unity_script.valueToCode(block, 'JSO', unity_script.ORDER_ATOMIC);
  var code = value_jso+'['+value_name+'] = '+value_value+';\n';
  return code;
};

unity_script['spawnfallingblock'] = function(block) {
  var value_block = unity_script.valueToCode(block, 'block', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'location', unity_script.ORDER_ATOMIC);
  var value_data = unity_script.valueToCode(block, 'data', unity_script.ORDER_ATOMIC);
  var code = value_location + '.getWorld().spawnFallingBlock(' + value_location + ', ' + value_block + ', ' + (value_data ? value_data : 0) + ')';
  return [code, unity_script.ORDER_NONE];
};




unity_script['getblockatlocation'] = function(block) {
  var value_location = unity_script.valueToCode(block, 'location', unity_script.ORDER_ATOMIC);
  var code = value_location + '.getBlock()';
  return [code, unity_script.ORDER_NONE];
};

  unity_script['getblockrel'] = function(block) {
  var value_origblock = unity_script.valueToCode(block, 'origblock', unity_script.ORDER_ATOMIC);
  var value_relposition = unity_script.valueToCode(block, 'relposition', unity_script.ORDER_ATOMIC);
  var code = value_origblock + '.getRelative(' + value_relposition + ')';
  return [code, unity_script.ORDER_NONE];
};
unity_script['blockfaces'] = function(block) {
  var dropdown_relatives = block.getFieldValue('relatives');
  var code = 'org.bukkit.block.BlockFace.' + dropdown_relatives;
  return [code, unity_script.ORDER_NONE];
};



unity_script['setvelocity'] = function(block) {
  var value_fallingblock = unity_script.valueToCode(block, 'fallingblock', unity_script.ORDER_ATOMIC);
  var value_velocity = unity_script.valueToCode(block, 'velocity', unity_script.ORDER_ATOMIC);
  var code = value_fallingblock + '.setVelocity(' + value_velocity + ');\n';
  return code;
};


unity_script['velocity'] = function(block) {
  var value_x = unity_script.valueToCode(block, 'x', unity_script.ORDER_ATOMIC);
  var value_y = unity_script.valueToCode(block, 'y', unity_script.ORDER_ATOMIC);
  var value_z = unity_script.valueToCode(block, 'z', unity_script.ORDER_ATOMIC);
  var code = '(new Vector3(' + value_x + ', ' + value_y + ', ' + value_z + '))';
  return [code, unity_script.ORDER_NONE];
};

unity_script['materialat'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var code = '('+value_name+').getBlock().getType()';
  return [code, unity_script.ORDER_NONE];
};



unity_script['clear_armor'] = function(block) {
  var value_armor = unity_script.valueToCode(block, 'armor', unity_script.ORDER_ATOMIC);
  var dropdown_armor = block.getFieldValue('armor');
  if (dropdown_armor == "ALL") {
    var code =    value_armor + '.getInventory().setHelmet(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.getInventory().setChestplate(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.getInventory().setLeggings(new ItemStack(org.bukkit.Material.AIR, 1));\n';
    code = code + value_armor + '.getInventory().setBoots(new ItemStack(org.bukkit.Material.AIR, 1));\n';
  } else {
    var code = value_armor + '.getInventory().set'+dropdown_armor+'(new ItemStack(org.bukkit.Material.AIR, 1));\n';
  }
  return code;
};


unity_script['changearmor'] = function(block) {
  var value_armor = unity_script.valueToCode(block, 'armor', unity_script.ORDER_ATOMIC);
  var value_player = unity_script.valueToCode(block, 'player', unity_script.ORDER_ATOMIC);
  var dropdown_armor = block.getFieldValue('armor');
  
  var code = value_player + '.getInventory().set'+dropdown_armor+'('+value_armor+');\n';
  return code;
};

unity_script['generalsetter'] = function(block) {
  var variable_setee = unity_script.variableDB_.getName(block.getFieldValue('setee'), Blockly.Variables.NAME_TYPE);
  var text_setter = block.getFieldValue('setter');
  var value_value = unity_script.valueToCode(block, 'value', unity_script.ORDER_ATOMIC);
  var code = variable_setee + '.set' + text_setter + '(' + value_value + ');\n';
  return code;
};

unity_script['update_sign'] = function(block) {
  /*var value_loc = unity_script.valueToCode(block, 'loc', unity_script.ORDER_ATOMIC);
  var value_list = unity_script.valueToCode(block, 'list', unity_script.ORDER_ATOMIC);
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
  var value_loc = unity_script.valueToCode(block, 'loc', unity_script.ORDER_ATOMIC);
  var value_list = unity_script.valueToCode(block, 'list', unity_script.ORDER_ATOMIC);
  var code = 'var tempDroneSign = new Drone(me, me.location);\n' +
             'tempDroneSign.setLocation('+value_loc+');\n' +
             'tempDroneSign.sign('+value_list+', 68);\n';
  return code;
};

unity_script['rotate_player'] = function(block) {
  var value_player = unity_script.valueToCode(block, 'player', unity_script.ORDER_ATOMIC);
  var value_degrees = unity_script.valueToCode(block, 'degrees', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code =  'var tempLoc = '+value_player+'.getLocation();\n';
      code += 'tempLoc.setYaw(tempLoc.getYaw()+'+value_degrees+');\n';
      code += value_player+'.teleport(tempLoc);\n';
  return code;
};
unity_script['new_itemstack'] = function(block) {
  var value_material = unity_script.valueToCode(block, 'Material', unity_script.ORDER_ATOMIC);
  var value_amount = unity_script.valueToCode(block, 'amount', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'new ItemStack('+value_material+', '+value_amount+')'
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};



unity_script['add_lore'] = function(block) {
  var value_lore = unity_script.valueToCode(block, 'lore', unity_script.ORDER_ATOMIC);
  var value_item = unity_script.valueToCode(block, 'item', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code =        'var itemMeta = (' + value_item + ').getItemMeta();\n';
      code = code + 'itemMeta.setLore(' + value_lore + ')\n';
      code = code + '(' + value_item + ').setItemMeta(itemMeta)\n';
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};


unity_script['give_item_to_player'] = function(block) {
  var value_item = unity_script.valueToCode(block, 'ITEM', unity_script.ORDER_ATOMIC);
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_player+'.getInventory().addItem('+value_item+');\n';
  return code;
};

unity_script['action_click'] = function(block) {
  var dropdown_click_type = block.getFieldValue('click_type');
  // TODO: Assemble UnityScript into code variable.
  var code = dropdown_click_type;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['new_recipe'] = function(block) {
  var value_num_result = unity_script.valueToCode(block, 'num_result', unity_script.ORDER_ATOMIC);
  var value_recipe_result = unity_script.valueToCode(block, 'recipe_result', unity_script.ORDER_ATOMIC);
  var recipe_specs = unity_script.statementToCode(block, 'recipe_specs');
  recipe_rows = recipe_specs.split(';');

  existing_materials = [];
  recipe_shape = [];
  shape_letters = ['A','B','C','D','E','F','G','H','I'];

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
  code += ".shape(['" + recipe_shape[0] + "', '" + recipe_shape[1] + "', '" + recipe_shape[2] + "'])";
  for(var i = 0; i < existing_materials.length; i++) {
    code += ".setIngredient('" + shape_letters[i] + "', " + existing_materials[i] + ")";
  }
  code += ');\n';
  //return [code, unity_script.ORDER_NONE];
  return code;
};

unity_script['recipe_row'] = function(block) {
  var value_materiala = unity_script.valueToCode(block, 'materialA', unity_script.ORDER_ATOMIC);
  var value_materialb = unity_script.valueToCode(block, 'materialB', unity_script.ORDER_ATOMIC);
  var value_materialc = unity_script.valueToCode(block, 'materialC', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_materiala + ', ' + value_materialb + ', ' + value_materialc + ';';
  return code;
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
 * @fileoverview Generating UnityScript for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

//goog.provide('unity_script.text');

goog.require('unity_script');

unity_script['functionblock'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  var code = "'"+text_func_name.replace(" ", "_")+"'";
  return [code, unity_script.ORDER_NONE];
};

unity_script['functionblock_dropdown'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  // TODO: Assemble JavaScript into code variable.
  var code = "'"+text_func_name.replace(" ", "_")+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['calljavaon'] = function(block) {
  var value_func = unity_script.valueToCode(block, 'func', unity_script.ORDER_ATOMIC);
  var value_evt = unity_script.valueToCode(block, 'evt', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = ''+value_evt+'.'+value_func+'()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['typeof'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var code = +value_name+'.getType()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['mob'] = function(block) {
  var variable_drone = unity_script.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = variable_drone+'.mob('+value_name+');\n';
  return code;
};

unity_script['eval'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'eval('+value_name+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['me'] = function(block) {
  // TODO: Assemble UnityScript into code variable.
  var code = 'me';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['new_drone'] = function(block) {
  // TODO: Assemble UnityScript into code variable.
  var code = 'new Drone(me, me.location)';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['drone_move'] = function(block) {
  var variable_drone = unity_script.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var text_distance = block.getFieldValue('DISTANCE');
  // TODO: Assemble UnityScript into code variable.
  var code = variable_drone + "." + dropdown_direction + "("+text_distance+");\n";
  return code;
};

unity_script['drone_move_2'] = function(block) {
  var variable_drone = unity_script.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var value_distance = unity_script.valueToCode(block, 'DISTANCE', unity_script.ORDER_ATOMIC);
  var code = variable_drone + "." + dropdown_direction + "("+value_distance+");\n";
  return code;
};

unity_script['drone_rotate'] = function(block) {
  var variable_drone = unity_script.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var value_num_rotations = Blockly.JavaScript.valueToCode(block, 'NUM_ROTATIONS', Blockly.JavaScript.ORDER_ATOMIC);
  var code = variable_drone + ".turn("+value_num_rotations+");\n";
  return code;
};

unity_script['block_place'] = function(block) {
  var value_material = unity_script.valueToCode(block, 'MATERIAL', unity_script.ORDER_ATOMIC);
  var variable_drone = unity_script.variableDB_.getName(block.getFieldValue('DRONE'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble UnityScript into code variable.
  var code = variable_drone + ".box(" + value_material + ");\n";
  return code;
};


unity_script['new_material'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble UnityScript into code variable.
  var code = dropdown_name;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['get_location'] = function(block) {
  var value_thing = unity_script.valueToCode(block, 'THING', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_thing + ".getLocation()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['player'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'player('+value_name+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};


unity_script['world'] = function(block) {
  var dropdown_method = block.getFieldValue('METHOD');
  var value_location = unity_script.valueToCode(block, 'LOCATION', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = "world."+dropdown_method+"("+value_location+");\n";
  return code;
};

unity_script['send'] = function(block) {
  var value_message = unity_script.valueToCode(block, 'MESSAGE', unity_script.ORDER_ATOMIC);
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_player+".sendMessage("+value_message+");\n";
  return code;
};

unity_script['interval'] = function(block) {
  var value_function = unity_script.valueToCode(block, 'FUNCTION', unity_script.ORDER_ATOMIC);
  var value_millis = unity_script.valueToCode(block, 'MILLIS', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = "interval(me,"+value_function+","+value_millis+");\n";
  return code;
};

unity_script['timeout'] = function(block) {
  var value_function = unity_script.valueToCode(block, 'FUNCTION', unity_script.ORDER_ATOMIC);
  var value_millis = unity_script.valueToCode(block, 'MILLIS', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = "setTimeout("+value_function+","+value_millis+");\n";
  return code;
};

unity_script['event'] = function(block) {
  var value_function = unity_script.valueToCode(block, 'FUNCTION', unity_script.ORDER_ATOMIC);
  var value_event = unity_script.valueToCode(block, 'EVENT', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = "events.when("+value_event+","+value_function+", me);\n";
  return code;
};

unity_script['get_target_block'] = {
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

unity_script['get_target_block'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_name+'.getTargetBlock(null, 50)';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


unity_script['new_event'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble UnityScript into code variable.
  var code = "'"+dropdown_name+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};


unity_script['potion_effect'] = function(block) {
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  var text_duration = block.getFieldValue('DURATION');
  var text_amplifier = block.getFieldValue('AMPLIFIER');
  var dropdown_effect = block.getFieldValue('EFFECT');
  // TODO: Assemble UnityScript into code variable.
  var code = value_player + ".addPotionEffect(new PotionEffect(PotionEffectType."+dropdown_effect+","+(text_duration*20)+","+text_amplifier+" ));\n";
  // TODO: Change ORDER_NONE to the correct strength.
  return code
};

unity_script['entity_type'] = function(block) {
  var dropdown_type = block.getFieldValue('TYPE');
  // TODO: Assemble UnityScript into code variable.
  var code = 'EntityType.'+dropdown_type;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};


unity_script['anon_func'] = function(block) {
  var statements_code = unity_script.statementToCode(block, 'CODE');
  // TODO: Assemble UnityScript into code variable.
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = unity_script.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function('+args.join(', ')+'){\n';
  code += statements_code;
  code += '}';
  return [code, unity_script.ORDER_NONE];
};

unity_script['local_var'] = function(block) {
  var parent_block = block.getSurroundParent()

  var yes_var = true;
  if(parent_block){
    var sibling_variables = parent_block.getDescendants().filter(function(d){
      return d.getSurroundParent() == parent_block && d.type == 'local_var';
    })

    var first_declaration_index = sibling_variables.map(function(v){
      return v.getFieldValue('VARIABLE'); 
    }).indexOf(block.getFieldValue('VARIABLE'))

    var my_index = sibling_variables.indexOf(block)

    yes_var = my_index == first_declaration_index;
  }

  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var variable_variable = unity_script.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble UnityScript into code variable.

  var code = variable_variable + " = " + value_name + ";\n";
  if(yes_var)
    code = 'var ' + code

  return code;
};

unity_script['set_location'] = function(block) {
  var value_entity = unity_script.valueToCode(block, 'ENTITY', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'LOCATION', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_entity+'.setLocation('+value_location+');\n';
  return code;
};

unity_script['teleport'] = function(block) {
  var value_entity = unity_script.valueToCode(block, 'ENTITY', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'LOCATION', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_entity+'.teleport('+value_location+');\n';
  return code;
};


unity_script['dot'] = function(block) {
  var variable_thing = unity_script.variableDB_.getName(block.getFieldValue('THING'), Blockly.Variables.NAME_TYPE);
  var text_name = block.getFieldValue('NAME');
  // TODO: Assemble UnityScript into code variable.
  var code = variable_thing + '.get' + text_name.charAt(0).toUpperCase() + text_name.slice(1) + '()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['perform_command'] = function(block) {
  var value_command = unity_script.valueToCode(block, 'COMMAND', unity_script.ORDER_ATOMIC);
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  var code = value_player + ".performCommand("+value_command+");\n";
  return code;
};

unity_script['give_item'] = function(block) {
  var value_number = unity_script.valueToCode(block, 'NUMBER', unity_script.ORDER_ATOMIC);
  var value_item = unity_script.valueToCode(block, 'ITEM', unity_script.ORDER_ATOMIC);
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_player + ".getInventory().addItem([new ItemStack("+value_item+","+value_number+")]);\n";
  return code;
};

unity_script['remove_items'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_player + ".getInventory().remove("+value_name+");\n";
  return code;
};


unity_script['remove_all_items'] = function(block) {
  var value_player = unity_script.valueToCode(block, 'PLAYER', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_player + ".getInventory().clear();\n";
  return code;
};


unity_script['set_meta'] = function(block) {
  var value_key = unity_script.valueToCode(block, 'KEY', unity_script.ORDER_ATOMIC);
  var value_val = unity_script.valueToCode(block, 'VAL', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'LOCATION', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'setMeta('+ value_key +','+ value_val+','+ value_location+');\n';
  return code;
};


unity_script['get_meta'] = function(block) {
  var value_key = unity_script.valueToCode(block, 'KEY', unity_script.ORDER_ATOMIC);
  var value_val = unity_script.valueToCode(block, 'VAL', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'LOCATION', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'getMeta('+ value_key +','+ value_location+')';
  return [code, unity_script.ORDER_NONE];
};







unity_script['block_type_ACTIVATOR_RAIL'] = function(block) {
  var code = 'Material.ACTIVATOR_RAIL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_AIR'] = function(block) {
  var code = 'Material.AIR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ANVIL'] = function(block) {
  var code = 'Material.ANVIL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_APPLE'] = function(block) {
  var code = 'Material.APPLE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ARROW'] = function(block) {
  var code = 'Material.ARROW';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BAKED_POTATO'] = function(block) {
  var code = 'Material.BAKED_POTATO';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BEACON'] = function(block) {
  var code = 'Material.BEACON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BED'] = function(block) {
  var code = 'Material.BED';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BED_BLOCK'] = function(block) {
  var code = 'Material.BED_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BEDROCK'] = function(block) {
  var code = 'Material.BEDROCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BIRCH_WOOD_STAIRS'] = function(block) {
  var code = 'Material.BIRCH_WOOD_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BLAZE_POWDER'] = function(block) {
  var code = 'Material.BLAZE_POWDER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BLAZE_ROD'] = function(block) {
  var code = 'Material.BLAZE_ROD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BOAT'] = function(block) {
  var code = 'Material.BOAT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BONE'] = function(block) {
  var code = 'Material.BONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BOOK'] = function(block) {
  var code = 'Material.BOOK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BOOK_AND_QUILL'] = function(block) {
  var code = 'Material.BOOK_AND_QUILL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BOOKSHELF'] = function(block) {
  var code = 'Material.BOOKSHELF';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BOW'] = function(block) {
  var code = 'Material.BOW';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BOWL'] = function(block) {
  var code = 'Material.BOWL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BREAD'] = function(block) {
  var code = 'Material.BREAD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BREWING_STAND'] = function(block) {
  var code = 'Material.BREWING_STAND';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BREWING_STAND_ITEM'] = function(block) {
  var code = 'Material.BREWING_STAND_ITEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BRICK'] = function(block) {
  var code = 'Material.BRICK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BRICK_STAIRS'] = function(block) {
  var code = 'Material.BRICK_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BROWN_MUSHROOM'] = function(block) {
  var code = 'Material.BROWN_MUSHROOM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BUCKET'] = function(block) {
  var code = 'Material.BUCKET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_BURNING_FURNACE'] = function(block) {
  var code = 'Material.BURNING_FURNACE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CACTUS'] = function(block) {
  var code = 'Material.CACTUS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CAKE'] = function(block) {
  var code = 'Material.CAKE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CAKE_BLOCK'] = function(block) {
  var code = 'Material.CAKE_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CARPET'] = function(block) {
  var code = 'Material.CARPET';
  return [code, unity_script.ORDER_NONE];
};



unity_script['block_type_CARROT_ITEM'] = function(block) {
  var code = 'Material.CARROT_ITEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CARROT_STICK'] = function(block) {
  var code = 'Material.CARROT_STICK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CAULDRON'] = function(block) {
  var code = 'Material.CAULDRON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CAULDRON_ITEM'] = function(block) {
  var code = 'Material.CAULDRON_ITEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CHAINMAIL_BOOTS'] = function(block) {
  var code = 'Material.CHAINMAIL_BOOTS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CHAINMAIL_CHESTPLATE'] = function(block) {
  var code = 'Material.CHAINMAIL_CHESTPLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CHAINMAIL_HELMET'] = function(block) {
  var code = 'Material.CHAINMAIL_HELMET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CHAINMAIL_LEGGINGS'] = function(block) {
  var code = 'Material.CHAINMAIL_LEGGINGS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CHEST'] = function(block) {
  var code = 'Material.CHEST';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CLAY'] = function(block) {
  var code = 'Material.CLAY';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CLAY_BALL'] = function(block) {
  var code = 'Material.CLAY_BALL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CLAY_BRICK'] = function(block) {
  var code = 'Material.CLAY_BRICK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COAL'] = function(block) {
  var code = 'Material.COAL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COAL_BLOCK'] = function(block) {
  var code = 'Material.COAL_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COAL_ORE'] = function(block) {
  var code = 'Material.COAL_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COBBLE_WALL'] = function(block) {
  var code = 'Material.COBBLE_WALL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COBBLESTONE'] = function(block) {
  var code = 'Material.COBBLESTONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COBBLESTONE_STAIRS'] = function(block) {
  var code = 'Material.COBBLESTONE_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COCOA'] = function(block) {
  var code = 'Material.COCOA';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COMMAND'] = function(block) {
  var code = 'Material.COMMAND';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COMPASS'] = function(block) {
  var code = 'Material.COMPASS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COOKED_BEEF'] = function(block) {
  var code = 'Material.COOKED_BEEF';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COOKED_CHICKEN'] = function(block) {
  var code = 'Material.COOKED_CHICKEN';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COOKED_FISH'] = function(block) {
  var code = 'Material.COOKED_FISH';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_COOKIE'] = function(block) {
  var code = 'Material.COOKIE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_CROPS'] = function(block) {
  var code = 'Material.CROPS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DAYLIGHT_DETECTOR'] = function(block) {
  var code = 'Material.DAYLIGHT_DETECTOR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DEAD_BUSH'] = function(block) {
  var code = 'Material.DEAD_BUSH';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DETECTOR_RAIL'] = function(block) {
  var code = 'Material.DETECTOR_RAIL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND'] = function(block) {
  var code = 'Material.DIAMOND';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_AXE'] = function(block) {
  var code = 'Material.DIAMOND_AXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_BARDING'] = function(block) {
  var code = 'Material.DIAMOND_BARDING';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_BLOCK'] = function(block) {
  var code = 'Material.DIAMOND_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_BOOTS'] = function(block) {
  var code = 'Material.DIAMOND_BOOTS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_CHESTPLATE'] = function(block) {
  var code = 'Material.DIAMOND_CHESTPLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_HELMET'] = function(block) {
  var code = 'Material.DIAMOND_HELMET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_HOE'] = function(block) {
  var code = 'Material.DIAMOND_HOE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_LEGGINGS'] = function(block) {
  var code = 'Material.DIAMOND_LEGGINGS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_ORE'] = function(block) {
  var code = 'Material.DIAMOND_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_PICKAXE'] = function(block) {
  var code = 'Material.DIAMOND_PICKAXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_SPADE'] = function(block) {
  var code = 'Material.DIAMOND_SPADE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIAMOND_SWORD'] = function(block) {
  var code = 'Material.DIAMOND_SWORD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIODE'] = function(block) {
  var code = 'Material.DIODE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIODE_BLOCK_OFF'] = function(block) {
  var code = 'Material.DIODE_BLOCK_OFF';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIODE_BLOCK_ON'] = function(block) {
  var code = 'Material.DIODE_BLOCK_ON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DIRT'] = function(block) {
  var code = 'Material.DIRT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DISPENSER'] = function(block) {
  var code = 'Material.DISPENSER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DOUBLE_STEP'] = function(block) {
  var code = 'Material.DOUBLE_STEP';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DRAGON_EGG'] = function(block) {
  var code = 'Material.DRAGON_EGG';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_DROPPER'] = function(block) {
  var code = 'Material.DROPPER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EGG'] = function(block) {
  var code = 'Material.EGG';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EMERALD'] = function(block) {
  var code = 'Material.EMERALD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EMERALD_BLOCK'] = function(block) {
  var code = 'Material.EMERALD_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EMERALD_ORE'] = function(block) {
  var code = 'Material.EMERALD_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EMPTY_MAP'] = function(block) {
  var code = 'Material.EMPTY_MAP';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ENCHANTED_BOOK'] = function(block) {
  var code = 'Material.ENCHANTED_BOOK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ENCHANTMENT_TABLE'] = function(block) {
  var code = 'Material.ENCHANTMENT_TABLE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ENDER_CHEST'] = function(block) {
  var code = 'Material.ENDER_CHEST';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ENDER_PEARL'] = function(block) {
  var code = 'Material.ENDER_PEARL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ENDER_PORTAL'] = function(block) {
  var code = 'Material.ENDER_PORTAL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ENDER_PORTAL_FRAME'] = function(block) {
  var code = 'Material.ENDER_PORTAL_FRAME';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ENDER_STONE'] = function(block) {
  var code = 'Material.ENDER_STONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EXP_BOTTLE'] = function(block) {
  var code = 'Material.EXP_BOTTLE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EXPLOSIVE_MINECART'] = function(block) {
  var code = 'Material.EXPLOSIVE_MINECART';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_EYE_OF_ENDER'] = function(block) {
  var code = 'Material.EYE_OF_ENDER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FEATHER'] = function(block) {
  var code = 'Material.FEATHER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FENCE'] = function(block) {
  var code = 'Material.FENCE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FENCE_GATE'] = function(block) {
  var code = 'Material.FENCE_GATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FERMENTED_SPIDER_EYE'] = function(block) {
  var code = 'Material.FERMENTED_SPIDER_EYE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FIRE'] = function(block) {
  var code = 'Material.FIRE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FIREBALL'] = function(block) {
  var code = 'Material.FIREBALL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FIREWORK'] = function(block) {
  var code = 'Material.FIREWORK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FIREWORK_CHARGE'] = function(block) {
  var code = 'Material.FIREWORK_CHARGE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FISHING_ROD'] = function(block) {
  var code = 'Material.FISHING_ROD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FLINT'] = function(block) {
  var code = 'Material.FLINT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FLINT_AND_STEEL'] = function(block) {
  var code = 'Material.FLINT_AND_STEEL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FLOWER_POT'] = function(block) {
  var code = 'Material.FLOWER_POT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FLOWER_POT_ITEM'] = function(block) {
  var code = 'Material.FLOWER_POT_ITEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_FURNACE'] = function(block) {
  var code = 'Material.FURNACE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GHAST_TEAR'] = function(block) {
  var code = 'Material.GHAST_TEAR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GLASS'] = function(block) {
  var code = 'Material.GLASS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GLASS_BOTTLE'] = function(block) {
  var code = 'Material.GLASS_BOTTLE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GLOWING_REDSTONE_ORE'] = function(block) {
  var code = 'Material.GLOWING_REDSTONE_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GLOWSTONE'] = function(block) {
  var code = 'Material.GLOWSTONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GLOWSTONE_DUST'] = function(block) {
  var code = 'Material.GLOWSTONE_DUST';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_AXE'] = function(block) {
  var code = 'Material.GOLD_AXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_BARDING'] = function(block) {
  var code = 'Material.GOLD_BARDING';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_BLOCK'] = function(block) {
  var code = 'Material.GOLD_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_BOOTS'] = function(block) {
  var code = 'Material.GOLD_BOOTS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_CHESTPLATE'] = function(block) {
  var code = 'Material.GOLD_CHESTPLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_HELMET'] = function(block) {
  var code = 'Material.GOLD_HELMET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_HOE'] = function(block) {
  var code = 'Material.GOLD_HOE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_INGOT'] = function(block) {
  var code = 'Material.GOLD_INGOT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_LEGGINGS'] = function(block) {
  var code = 'Material.GOLD_LEGGINGS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_NUGGET'] = function(block) {
  var code = 'Material.GOLD_NUGGET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_ORE'] = function(block) {
  var code = 'Material.GOLD_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_PICKAXE'] = function(block) {
  var code = 'Material.GOLD_PICKAXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_PLATE'] = function(block) {
  var code = 'Material.GOLD_PLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_RECORD'] = function(block) {
  var code = 'Material.GOLD_RECORD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_SPADE'] = function(block) {
  var code = 'Material.GOLD_SPADE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLD_SWORD'] = function(block) {
  var code = 'Material.GOLD_SWORD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLDEN_APPLE'] = function(block) {
  var code = 'Material.GOLDEN_APPLE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GOLDEN_CARROT'] = function(block) {
  var code = 'Material.GOLDEN_CARROT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GRASS'] = function(block) {
  var code = 'Material.GRASS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GRAVEL'] = function(block) {
  var code = 'Material.GRAVEL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GREEN_RECORD'] = function(block) {
  var code = 'Material.GREEN_RECORD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_GRILLED_PORK'] = function(block) {
  var code = 'Material.GRILLED_PORK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_HARD_CLAY'] = function(block) {
  var code = 'Material.HARD_CLAY';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_HAY_BLOCK'] = function(block) {
  var code = 'Material.HAY_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_HOPPER'] = function(block) {
  var code = 'Material.HOPPER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_HOPPER_MINECART'] = function(block) {
  var code = 'Material.HOPPER_MINECART';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_HUGE_MUSHROOM_1'] = function(block) {
  var code = 'Material.HUGE_MUSHROOM_1';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_HUGE_MUSHROOM_2'] = function(block) {
  var code = 'Material.HUGE_MUSHROOM_2';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ICE'] = function(block) {
  var code = 'Material.ICE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_INK_SACK'] = function(block) {
  var code = 'Material.INK_SACK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_AXE'] = function(block) {
  var code = 'Material.IRON_AXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_BARDING'] = function(block) {
  var code = 'Material.IRON_BARDING';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_BLOCK'] = function(block) {
  var code = 'Material.IRON_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_BOOTS'] = function(block) {
  var code = 'Material.IRON_BOOTS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_CHESTPLATE'] = function(block) {
  var code = 'Material.IRON_CHESTPLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_DOOR'] = function(block) {
  var code = 'Material.IRON_DOOR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_DOOR_BLOCK'] = function(block) {
  var code = 'Material.IRON_DOOR_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_FENCE'] = function(block) {
  var code = 'Material.IRON_FENCE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_HELMET'] = function(block) {
  var code = 'Material.IRON_HELMET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_HOE'] = function(block) {
  var code = 'Material.IRON_HOE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_INGOT'] = function(block) {
  var code = 'Material.IRON_INGOT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_LEGGINGS'] = function(block) {
  var code = 'Material.IRON_LEGGINGS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_ORE'] = function(block) {
  var code = 'Material.IRON_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_PICKAXE'] = function(block) {
  var code = 'Material.IRON_PICKAXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_PLATE'] = function(block) {
  var code = 'Material.IRON_PLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_SPADE'] = function(block) {
  var code = 'Material.IRON_SPADE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_IRON_SWORD'] = function(block) {
  var code = 'Material.IRON_SWORD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ITEM_FRAME'] = function(block) {
  var code = 'Material.ITEM_FRAME';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_JACK_O_LANTERN'] = function(block) {
  var code = 'Material.JACK_O_LANTERN';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_JUKEBOX'] = function(block) {
  var code = 'Material.JUKEBOX';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_JUNGLE_WOOD_STAIRS'] = function(block) {
  var code = 'Material.JUNGLE_WOOD_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LADDER'] = function(block) {
  var code = 'Material.LADDER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LAPIS_BLOCK'] = function(block) {
  var code = 'Material.LAPIS_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LAPIS_ORE'] = function(block) {
  var code = 'Material.LAPIS_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LAVA'] = function(block) {
  var code = 'Material.LAVA';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LAVA_BUCKET'] = function(block) {
  var code = 'Material.LAVA_BUCKET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEASH'] = function(block) {
  var code = 'Material.LEASH';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEATHER'] = function(block) {
  var code = 'Material.LEATHER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEATHER_BOOTS'] = function(block) {
  var code = 'Material.LEATHER_BOOTS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEATHER_CHESTPLATE'] = function(block) {
  var code = 'Material.LEATHER_CHESTPLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEATHER_HELMET'] = function(block) {
  var code = 'Material.LEATHER_HELMET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEATHER_LEGGINGS'] = function(block) {
  var code = 'Material.LEATHER_LEGGINGS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEAVES'] = function(block) {
  var code = 'Material.LEAVES';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LEVER'] = function(block) {
  var code = 'Material.LEVER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LOCKED_CHEST'] = function(block) {
  var code = 'Material.LOCKED_CHEST';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LOG'] = function(block) {
  var code = 'Material.LOG';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_LONG_GRASS'] = function(block) {
  var code = 'Material.LONG_GRASS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MAGMA_CREAM'] = function(block) {
  var code = 'Material.MAGMA_CREAM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MAP'] = function(block) {
  var code = 'Material.MAP';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MELON'] = function(block) {
  var code = 'Material.MELON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MELON_BLOCK'] = function(block) {
  var code = 'Material.MELON_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MELON_SEEDS'] = function(block) {
  var code = 'Material.MELON_SEEDS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MELON_STEM'] = function(block) {
  var code = 'Material.MELON_STEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MILK_BUCKET'] = function(block) {
  var code = 'Material.MILK_BUCKET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MINECART'] = function(block) {
  var code = 'Material.MINECART';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MOB_SPAWNER'] = function(block) {
  var code = 'Material.MOB_SPAWNER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MONSTER_EGG'] = function(block) {
  var code = 'Material.MONSTER_EGG';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MONSTER_EGGS'] = function(block) {
  var code = 'Material.MONSTER_EGGS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MOSSY_COBBLESTONE'] = function(block) {
  var code = 'Material.MOSSY_COBBLESTONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MUSHROOM_SOUP'] = function(block) {
  var code = 'Material.MUSHROOM_SOUP';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_MYCEL'] = function(block) {
  var code = 'Material.MYCEL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NAME_TAG'] = function(block) {
  var code = 'Material.NAME_TAG';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHER_BRICK'] = function(block) {
  var code = 'Material.NETHER_BRICK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHER_BRICK_ITEM'] = function(block) {
  var code = 'Material.NETHER_BRICK_ITEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHER_BRICK_STAIRS'] = function(block) {
  var code = 'Material.NETHER_BRICK_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHER_FENCE'] = function(block) {
  var code = 'Material.NETHER_FENCE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHER_STALK'] = function(block) {
  var code = 'Material.NETHER_STALK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHER_STAR'] = function(block) {
  var code = 'Material.NETHER_STAR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHER_WARTS'] = function(block) {
  var code = 'Material.NETHER_WARTS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NETHERRACK'] = function(block) {
  var code = 'Material.NETHERRACK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_NOTE_BLOCK'] = function(block) {
  var code = 'Material.NOTE_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_OBSIDIAN'] = function(block) {
  var code = 'Material.OBSIDIAN';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PAINTING'] = function(block) {
  var code = 'Material.PAINTING';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PAPER'] = function(block) {
  var code = 'Material.PAPER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PISTON_BASE'] = function(block) {
  var code = 'Material.PISTON_BASE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PISTON_EXTENSION'] = function(block) {
  var code = 'Material.PISTON_EXTENSION';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PISTON_MOVING_PIECE'] = function(block) {
  var code = 'Material.PISTON_MOVING_PIECE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PISTON_STICKY_BASE'] = function(block) {
  var code = 'Material.PISTON_STICKY_BASE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_POISONOUS_POTATO'] = function(block) {
  var code = 'Material.POISONOUS_POTATO';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PORK'] = function(block) {
  var code = 'Material.PORK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PORTAL'] = function(block) {
  var code = 'Material.PORTAL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_POTATO'] = function(block) {
  var code = 'Material.POTATO';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_POTATO_ITEM'] = function(block) {
  var code = 'Material.POTATO_ITEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_POTION'] = function(block) {
  var code = 'Material.POTION';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_POWERED_MINECART'] = function(block) {
  var code = 'Material.POWERED_MINECART';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_POWERED_RAIL'] = function(block) {
  var code = 'Material.POWERED_RAIL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PUMPKIN'] = function(block) {
  var code = 'Material.PUMPKIN';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PUMPKIN_PIE'] = function(block) {
  var code = 'Material.PUMPKIN_PIE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PUMPKIN_SEEDS'] = function(block) {
  var code = 'Material.PUMPKIN_SEEDS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_PUMPKIN_STEM'] = function(block) {
  var code = 'Material.PUMPKIN_STEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_QUARTZ'] = function(block) {
  var code = 'Material.QUARTZ';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_QUARTZ_BLOCK'] = function(block) {
  var code = 'Material.QUARTZ_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_QUARTZ_ORE'] = function(block) {
  var code = 'Material.QUARTZ_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_QUARTZ_STAIRS'] = function(block) {
  var code = 'Material.QUARTZ_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RAILS'] = function(block) {
  var code = 'Material.RAILS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RAW_BEEF'] = function(block) {
  var code = 'Material.RAW_BEEF';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RAW_CHICKEN'] = function(block) {
  var code = 'Material.RAW_CHICKEN';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RAW_FISH'] = function(block) {
  var code = 'Material.RAW_FISH';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_10'] = function(block) {
  var code = 'Material.RECORD_10';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_11'] = function(block) {
  var code = 'Material.RECORD_11';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_12'] = function(block) {
  var code = 'Material.RECORD_12';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_3'] = function(block) {
  var code = 'Material.RECORD_3';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_4'] = function(block) {
  var code = 'Material.RECORD_4';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_5'] = function(block) {
  var code = 'Material.RECORD_5';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_6'] = function(block) {
  var code = 'Material.RECORD_6';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_7'] = function(block) {
  var code = 'Material.RECORD_7';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_8'] = function(block) {
  var code = 'Material.RECORD_8';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RECORD_9'] = function(block) {
  var code = 'Material.RECORD_9';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RED_MUSHROOM'] = function(block) {
  var code = 'Material.RED_MUSHROOM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_RED_ROSE'] = function(block) {
  var code = 'Material.RED_ROSE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE'] = function(block) {
  var code = 'Material.REDSTONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_BLOCK'] = function(block) {
  var code = 'Material.REDSTONE_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_COMPARATOR'] = function(block) {
  var code = 'Material.REDSTONE_COMPARATOR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_COMPARATOR_OFF'] = function(block) {
  var code = 'Material.REDSTONE_COMPARATOR_OFF';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_COMPARATOR_ON'] = function(block) {
  var code = 'Material.REDSTONE_COMPARATOR_ON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_LAMP_OFF'] = function(block) {
  var code = 'Material.REDSTONE_LAMP_OFF';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_LAMP_ON'] = function(block) {
  var code = 'Material.REDSTONE_LAMP_ON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_ORE'] = function(block) {
  var code = 'Material.REDSTONE_ORE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_TORCH_OFF'] = function(block) {
  var code = 'Material.REDSTONE_TORCH_OFF';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_TORCH_ON'] = function(block) {
  var code = 'Material.REDSTONE_TORCH_ON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_REDSTONE_WIRE'] = function(block) {
  var code = 'Material.REDSTONE_WIRE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_ROTTEN_FLESH'] = function(block) {
  var code = 'Material.ROTTEN_FLESH';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SADDLE'] = function(block) {
  var code = 'Material.SADDLE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SAND'] = function(block) {
  var code = 'Material.SAND';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SANDSTONE'] = function(block) {
  var code = 'Material.SANDSTONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SANDSTONE_STAIRS'] = function(block) {
  var code = 'Material.SANDSTONE_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SAPLING'] = function(block) {
  var code = 'Material.SAPLING';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SEEDS'] = function(block) {
  var code = 'Material.SEEDS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SHEARS'] = function(block) {
  var code = 'Material.SHEARS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SIGN'] = function(block) {
  var code = 'Material.SIGN';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SIGN_POST'] = function(block) {
  var code = 'Material.SIGN_POST';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SKULL'] = function(block) {
  var code = 'Material.SKULL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SKULL_ITEM'] = function(block) {
  var code = 'Material.SKULL_ITEM';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SLIME_BALL'] = function(block) {
  var code = 'Material.SLIME_BALL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SMOOTH_BRICK'] = function(block) {
  var code = 'Material.SMOOTH_BRICK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SMOOTH_STAIRS'] = function(block) {
  var code = 'Material.SMOOTH_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SNOW'] = function(block) {
  var code = 'Material.SNOW';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SNOW_BALL'] = function(block) {
  var code = 'Material.SNOW_BALL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SNOW_BLOCK'] = function(block) {
  var code = 'Material.SNOW_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SOIL'] = function(block) {
  var code = 'Material.SOIL';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SOUL_SAND'] = function(block) {
  var code = 'Material.SOUL_SAND';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SPECKLED_MELON'] = function(block) {
  var code = 'Material.SPECKLED_MELON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SPIDER_EYE'] = function(block) {
  var code = 'Material.SPIDER_EYE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SPONGE'] = function(block) {
  var code = 'Material.SPONGE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SPRUCE_WOOD_STAIRS'] = function(block) {
  var code = 'Material.SPRUCE_WOOD_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STAINED_CLAY'] = function(block) {
  var code = 'Material.STAINED_CLAY';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STATIONARY_LAVA'] = function(block) {
  var code = 'Material.STATIONARY_LAVA';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STATIONARY_WATER'] = function(block) {
  var code = 'Material.STATIONARY_WATER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STEP'] = function(block) {
  var code = 'Material.STEP';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STICK'] = function(block) {
  var code = 'Material.STICK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE'] = function(block) {
  var code = 'Material.STONE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE_AXE'] = function(block) {
  var code = 'Material.STONE_AXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE_BUTTON'] = function(block) {
  var code = 'Material.STONE_BUTTON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE_HOE'] = function(block) {
  var code = 'Material.STONE_HOE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE_PICKAXE'] = function(block) {
  var code = 'Material.STONE_PICKAXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE_PLATE'] = function(block) {
  var code = 'Material.STONE_PLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE_SPADE'] = function(block) {
  var code = 'Material.STONE_SPADE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STONE_SWORD'] = function(block) {
  var code = 'Material.STONE_SWORD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STORAGE_MINECART'] = function(block) {
  var code = 'Material.STORAGE_MINECART';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_STRING'] = function(block) {
  var code = 'Material.STRING';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SUGAR'] = function(block) {
  var code = 'Material.SUGAR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SUGAR_CANE'] = function(block) {
  var code = 'Material.SUGAR_CANE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SUGAR_CANE_BLOCK'] = function(block) {
  var code = 'Material.SUGAR_CANE_BLOCK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_SULPHUR'] = function(block) {
  var code = 'Material.SULPHUR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_THIN_GLASS'] = function(block) {
  var code = 'Material.THIN_GLASS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_TNT'] = function(block) {
  var code = 'Material.TNT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_TORCH'] = function(block) {
  var code = 'Material.TORCH';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_TRAP_DOOR'] = function(block) {
  var code = 'Material.TRAP_DOOR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_TRAPPED_CHEST'] = function(block) {
  var code = 'Material.TRAPPED_CHEST';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_TRIPWIRE'] = function(block) {
  var code = 'Material.TRIPWIRE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_TRIPWIRE_HOOK'] = function(block) {
  var code = 'Material.TRIPWIRE_HOOK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_VINE'] = function(block) {
  var code = 'Material.VINE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WALL_SIGN'] = function(block) {
  var code = 'Material.WALL_SIGN';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WATCH'] = function(block) {
  var code = 'Material.WATCH';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WATER'] = function(block) {
  var code = 'Material.WATER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WATER_BUCKET'] = function(block) {
  var code = 'Material.WATER_BUCKET';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WATER_LILY'] = function(block) {
  var code = 'Material.WATER_LILY';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WEB'] = function(block) {
  var code = 'Material.WEB';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WHEAT'] = function(block) {
  var code = 'Material.WHEAT';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD'] = function(block) {
  var code = 'Material.WOOD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_AXE'] = function(block) {
  var code = 'Material.WOOD_AXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_BUTTON'] = function(block) {
  var code = 'Material.WOOD_BUTTON';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_DOOR'] = function(block) {
  var code = 'Material.WOOD_DOOR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_DOUBLE_STEP'] = function(block) {
  var code = 'Material.WOOD_DOUBLE_STEP';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_HOE'] = function(block) {
  var code = 'Material.WOOD_HOE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_PICKAXE'] = function(block) {
  var code = 'Material.WOOD_PICKAXE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_PLATE'] = function(block) {
  var code = 'Material.WOOD_PLATE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_SPADE'] = function(block) {
  var code = 'Material.WOOD_SPADE';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_STAIRS'] = function(block) {
  var code = 'Material.WOOD_STAIRS';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_STEP'] = function(block) {
  var code = 'Material.WOOD_STEP';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOD_SWORD'] = function(block) {
  var code = 'Material.WOOD_SWORD';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOODEN_DOOR'] = function(block) {
  var code = 'Material.WOODEN_DOOR';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_WOOL'] = function(block) {
  var code = 'Material.WOOL';
  return [code, unity_script.ORDER_NONE];
};


unity_script['block_type_CRAFTING_TABLE'] = function(block) {
  var code = 'Material.WORKBENCH';
  return [code, unity_script.ORDER_NONE];
};


unity_script['block_type_WRITTEN_BOOK'] = function(block) {
  var code = 'Material.WRITTEN_BOOK';
  return [code, unity_script.ORDER_NONE];
};




unity_script['block_type_YELLOW_FLOWER'] = function(block) {
  var code = 'Material.YELLOW_FLOWER';
  return [code, unity_script.ORDER_NONE];
};




unity_script['import'] = function(block) {
  var text_lib = block.getFieldValue('LIB');

  var xml = imports[text_lib].split("<SEP>")[0]
  //var js = imports[text_lib].split("<SEP>")[1]  //Crap... This is in js, not us...

  //Need to generate the US if we can.  New blockly workspace??

  //Find the exported things
  var dom = Blockly.Xml.textToDom(xml)

  var side_workspace = new Blockly.Workspace()
  side_workspace.createDom()

  var side_generator = new Blockly.Generator('UnityScript')
  unity_script.setup_unity_script(side_generator)
  unity_script.setup_unity_script_more(side_generator)

  Blockly.Xml.domToWorkspace(side_workspace, dom) 

  var js = side_generator.workspaceToCodeAlpha(side_workspace)



  /*
  var defvars = [];                              
  side_workspace.getDescendants = function(){
    console.log(this.getAllBlocks())
    return this.getAllBlocks();
  }
  var variables = Blockly.Variables.allVariables(side_workspace);
  var local_variables = Blockly.Variables.allLocalVariables();
  for (var x = 0; x < variables.length; x++) {
    if(local_variables.indexOf(variables[x]) != -1 )      
      continue;
    
    defvars[x] = 'var ' +                        
        unity_script.variableDB_.getName(variables[x],
        Blockly.Variables.NAME_TYPE) + ';';      
  } 
  var variable_defs = defvars.join('\n');
  
  js = variable_defs + "\n" + js;
  */

  //Clear the definitions collected during the side calculation (an annoying monkey patch).

  /*
  unity_script.definitions_ = unity_script.definitions_.filter(function(d){
    return unity_script.recent_definitions_.indexOf(d) == -1;
  })

  unity_script.recent_definitions_ = []
  */

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
  


  // TODO: Assemble UnityScript into code variable.

  //Gives all the imported functions a namespace prefix
  var var_name = text_lib.replace("-","_")
  var code = "static var "+var_name+" = new "+var_name+"_class();\n"
  code += "class " + var_name + "_class {\n" + js + "\n}"
  return code;
};

unity_script['export'] = function(block) {
  return ""  
};


unity_script['spawn_entity'] = function(block) {
  var value_entity = unity_script.valueToCode(block, 'ENTITY', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'LOCATION', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = "world.spawnEntity("+value_location+","+value_entity+")";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['new_object'] = function(block) {
  // TODO: Assemble UnityScript into code variable.
  var code = '{}';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['put_object'] = function(block) {
  var value_value = unity_script.valueToCode(block, 'VALUE', unity_script.ORDER_ATOMIC);
  var text_name = block.getFieldValue('NAME');
  var variable_var = unity_script.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble UnityScript into code variable.
  var code = variable_var + '.' + text_name + "=" + value_value + ";\n";
  return code;
};

unity_script['get_object'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  var variable_var = unity_script.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble UnityScript into code variable.
  var code = variable_var + '.' + text_name;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['call'] = function(block) {
  var value_obj = unity_script.valueToCode(block, 'OBJ', unity_script.ORDER_ATOMIC);
  var text_fun = block.getFieldValue('FUN');
  var value_with = unity_script.valueToCode(block, 'WITH', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code;
  if (block.itemCount_ == 0) {
    code = value_obj + "." + text_fun + '();\n';
    return code;
  } else if (block.itemCount_ == 1) {
    var argument0 = unity_script.valueToCode(block, 'ADD0',
        unity_script.ORDER_NONE) || '\'\'';
    code = value_obj + "." + text_fun + '(' + argument0 + ');\n';
    return code;
  } else if (block.itemCount_ == 2) {
    var argument0 = unity_script.valueToCode(block, 'ADD0',
        unity_script.ORDER_NONE) || '\'\'';
    var argument1 = unity_script.valueToCode(block, 'ADD1',
        unity_script.ORDER_NONE) || '\'\'';
    code =value_obj + "." +  text_fun + '(' + argument0 + ',' + argument1 + ');\n';
    return code;
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = unity_script.valueToCode(block, 'ADD' + n,
          unity_script.ORDER_COMMA) || '\'\'';
    }
    code = value_obj + "." +  text_fun+ '(' + code.join(',') + ');\n';
    return code;
  }
};


unity_script['callret'] = function(block) {
  var value_obj = unity_script.valueToCode(block, 'OBJ', unity_script.ORDER_ATOMIC);
  var text_fun = block.getFieldValue('FUN');
  var value_with = unity_script.valueToCode(block, 'WITH', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code;
  if (block.itemCount_ == 0) {
    code = value_obj + "." + text_fun + '()';
    return [code, unity_script.ORDER_NONE];
  } else if (block.itemCount_ == 1) {
    var argument0 = unity_script.valueToCode(block, 'ADD0',
        unity_script.ORDER_NONE) || '\'\'';
    code = value_obj + "." + text_fun + '(' + argument0 + ')';
    return [code, unity_script.ORDER_NONE];
  } else if (block.itemCount_ == 2) {
    var argument0 = unity_script.valueToCode(block, 'ADD0',
        unity_script.ORDER_NONE) || '\'\'';
    var argument1 = unity_script.valueToCode(block, 'ADD1',
        unity_script.ORDER_NONE) || '\'\'';
    code =value_obj + "." +  text_fun + '(' + argument0 + ',' + argument1 + ')';
    return [code, unity_script.ORDER_NONE];
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = unity_script.valueToCode(block, 'ADD' + n,
          unity_script.ORDER_COMMA) || '\'\'';
    }
    code = value_obj + "." +  text_fun+ '(' + code.join(',') + ')';
    return [code, unity_script.ORDER_NONE];
  }
};


unity_script['register_command'] = function(block) {
  var value_command = unity_script.valueToCode(block, 'command', unity_script.ORDER_ATOMIC);
  var value_func = unity_script.valueToCode(block, 'func', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = 'events.when("player.PlayerCommandPreprocessEvent", function(info) { if (info.getMessage().slice(1, info.getMessage().indexOf(" ")).equals('+value_command+')) ('+value_func+').apply(this, arguments); }, me);\n';
  return code;
};

unity_script['line_particle'] = function(block) {
  var value_particle = unity_script.valueToCode(block, 'particle', unity_script.ORDER_ATOMIC);
  var value_loc1 = unity_script.valueToCode(block, 'loc1', unity_script.ORDER_ATOMIC);
  var value_loc2 = unity_script.valueToCode(block, 'loc2', unity_script.ORDER_ATOMIC);
  var code = 'particle.line('+value_particle+', '+value_loc1+', '+value_loc2+');\n';
  return code;
};


unity_script['sphere_particle'] = function(block) {
  var value_particle = unity_script.valueToCode(block, 'particle', unity_script.ORDER_ATOMIC);
  var value_loc1 = unity_script.valueToCode(block, 'loc1', unity_script.ORDER_ATOMIC);
  var value_radius = unity_script.valueToCode(block, 'radius', unity_script.ORDER_ATOMIC);
  var code = 'particle.sphere('+value_particle+', '+value_loc1+', '+value_radius+');\n';
  return code;
};

unity_script['firework'] = function(block) {
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
  var value_location = unity_script.valueToCode(block, 'location', unity_script.ORDER_ATOMIC);
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

unity_script['change_item_name'] = function(block) {
  var value_item = unity_script.valueToCode(block, 'item', unity_script.ORDER_ATOMIC);
  var value_name = unity_script.valueToCode(block, 'name', unity_script.ORDER_ATOMIC);
  var code = 'var itemMeta = '+value_item+'.getItemMeta();\n';
     code += 'itemMeta.setDisplayName('+value_name+');\n';
     code += value_item+'.setItemMeta(itemMeta);\n';
  return code;
};


unity_script['item_in_hand'] = function(block) {
  var value_player = unity_script.valueToCode(block, 'player', unity_script.ORDER_ATOMIC);
  var code = value_player + '.getItemInHand().getItemMeta().getDisplayName()';
  return [code, unity_script.ORDER_NONE];
};



unity_script['explosion'] = function(block) {
  var value_location = unity_script.valueToCode(block, 'location', unity_script.ORDER_ATOMIC);
  var dropdown_real = block.getFieldValue('real');
  var dropdown_fire = block.getFieldValue('fire');
  var locx = value_location+".getX()";
  var locy = value_location+".getY()";
  var locz = value_location+".getZ()";
  var code = 'world.createExplosion('+locx+', '+locy+', '+locz+', 4, '+dropdown_fire+', '+dropdown_real+');\n';
  return code;
};

unity_script['texturepack'] = function(block) {
  var value_player = unity_script.valueToCode(block, 'player', unity_script.ORDER_ATOMIC);
  var text_url = block.getFieldValue('URL');
  var code = value_player+'.setResourcePack('+text_url+');\n';
  return code;
};


unity_script['recipe_row'] = function(block) {
  var value_materiala = unity_script.valueToCode(block, 'materialA', unity_script.ORDER_ATOMIC);
  var value_materialb = unity_script.valueToCode(block, 'materialB', unity_script.ORDER_ATOMIC);
  var value_materialc = unity_script.valueToCode(block, 'materialC', unity_script.ORDER_ATOMIC);
  // TODO: Assemble UnityScript into code variable.
  var code = value_materiala + ', ' + value_materialb + ', ' + value_materialc + ';';
  return code;
};

unity_script['point_particle'] = function(block) {
  var value_particle = unity_script.valueToCode(block, 'particle', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'location', unity_script.ORDER_ATOMIC);
  var code = 'particle.point('+value_particle+', '+value_location+');\n';
  return code;
};




unity_script['particle_HUGE_EXPLOSION'] = function(block) {
    var code = 'particle.particles.HUGE_EXPLOSION';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_LARGE_EXPLOSION'] = function(block) {
    var code = 'particle.particles.LARGE_EXPLOSION';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_FIREWORKS_SPARK'] = function(block) {
    var code = 'particle.particles.FIREWORKS_SPARK';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_BUBBLE'] = function(block) {
    var code = 'particle.particles.BUBBLE';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_SUSPEND'] = function(block) {
    var code = 'particle.particles.SUSPEND';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_DEPTH_SUSPEND'] = function(block) {
    var code = 'particle.particles.DEPTH_SUSPEND';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_TOWN_AURA'] = function(block) {
    var code = 'particle.particles.TOWN_AURA';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_CRIT'] = function(block) {
    var code = 'particle.particles.CRIT';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_MAGIC_CRIT'] = function(block) {
    var code = 'particle.particles.MAGIC_CRIT';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_MOB_SPELL'] = function(block) {
    var code = 'particle.particles.MOB_SPELL';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_MOB_SPELL_AMBIENT'] = function(block) {
    var code = 'particle.particles.MOB_SPELL_AMBIENT';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_SPELL'] = function(block) {
    var code = 'particle.particles.SPELL';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_INSTANT_SPELL'] = function(block) {
    var code = 'particle.particles.INSTANT_SPELL';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_WITCH_MAGIC'] = function(block) {
    var code = 'particle.particles.WITCH_MAGIC';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_NOTE'] = function(block) {
    var code = 'particle.particles.NOTE';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_PORTAL'] = function(block) {
    var code = 'particle.particles.PORTAL';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_ENCHANTMENT_TABLE'] = function(block) {
    var code = 'particle.particles.ENCHANTMENT_TABLE';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_EXPLODE'] = function(block) {
    var code = 'particle.particles.EXPLODE';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_FLAME'] = function(block) {
    var code = 'particle.particles.FLAME';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_LAVA'] = function(block) {
    var code = 'particle.particles.LAVA';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_FOOTSTEP'] = function(block) {
    var code = 'particle.particles.FOOTSTEP';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_SPLASH'] = function(block) {
    var code = 'particle.particles.SPLASH';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_LARGE_SMOKE'] = function(block) {
    var code = 'particle.particles.LARGE_SMOKE';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_CLOUD'] = function(block) {
    var code = 'particle.particles.CLOUD';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_RED_DUST'] = function(block) {
    var code = 'particle.particles.RED_DUST';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_SNOWBALL_POOF'] = function(block) {
    var code = 'particle.particles.SNOWBALL_POOF';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_DRIP_WATER'] = function(block) {
    var code = 'particle.particles.DRIP_WATER';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_DRIP_LAVA'] = function(block) {
    var code = 'particle.particles.DRIP_LAVA';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_SNOW_SHOVEL'] = function(block) {
    var code = 'particle.particles.SNOW_SHOVEL';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_SLIME'] = function(block) {
    var code = 'particle.particles.SLIME';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_HEART'] = function(block) {
    var code = 'particle.particles.HEART';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_ANGRY_VILLAGER'] = function(block) {
    var code = 'particle.particles.ANGRY_VILLAGER';
    return [code, unity_script.ORDER_NONE];
};
unity_script['particle_HAPPY_VILLAGER'] = function(block) {
    var code = 'particle.particles.HAPPY_VILLAGER';
    return [code, unity_script.ORDER_NONE];
};


unity_script['js'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  // TODO: Assemble UnityScript into code variable.
  // TODO: Change ORDER_NONE to the correct strength.
  return [text_func_name, unity_script.ORDER_NONE];
};

unity_script['js_noret'] = function(block) {
  var text_func_name = block.getFieldValue('func_name');
  // TODO: Assemble JavaScript into code variable.
  // TODO: Change ORDER_NONE to the correct strength.
  return text_func_name+"\n";
};

unity_script['eulerangle'] = function(block) {
  var angle_x = block.getFieldValue('x');
  var angle_y = block.getFieldValue('y');
  var angle_z = block.getFieldValue('z');
  var code = 'armorstand.angle('+(angle_x * (Math.PI / 180))+', '+(angle_y * (Math.PI / 180))+', '+(angle_z * (Math.PI / 180))+')';
  return [code, unity_script.ORDER_NONE];
};
unity_script['pose'] = function(block) {
  var statements_posenagles = unity_script.statementToCode(block, 'posenagles');
  var statements_equips = unity_script.statementToCode(block, 'equips');
  // TODO: Assemble JavaScript into code variable.
  var code = 'new armorstand.Pose({\n'+statements_posenagles+'}, {\n'+statements_equips+'})';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};
unity_script['posepart'] = function(block) {
  var value_angle = unity_script.valueToCode(block, 'angle', unity_script.ORDER_ATOMIC);
  var dropdown_pose_part = block.getFieldValue('pose_part');
  // TODO: Assemble JavaScript into code variable.
  var code = '\''+dropdown_pose_part+'\': '+value_angle+',\n';
  return code;
};
unity_script['equippart'] = function(block) {
  var value_equip = unity_script.valueToCode(block, 'equip', unity_script.ORDER_ATOMIC);
  var dropdown_pose_part = block.getFieldValue('pose_part');
  // TODO: Assemble JavaScript into code variable.
  var code = '\''+dropdown_pose_part+'\': '+value_equip+',\n';
  return code;
};
unity_script['stevebot'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'name', unity_script.ORDER_ATOMIC);
  var value_location = unity_script.valueToCode(block, 'location', unity_script.ORDER_ATOMIC);
  var value_pose = unity_script.valueToCode(block, 'pose', unity_script.ORDER_ATOMIC);
  var value_animation = unity_script.valueToCode(block, 'animation', unity_script.ORDER_ATOMIC);
  var value_desires = unity_script.valueToCode(block, 'desires', unity_script.ORDER_ATOMIC);
  var value_tiny = unity_script.valueToCode(block, 'tiny', unity_script.ORDER_ATOMIC);
  var value_baseplate = unity_script.valueToCode(block, 'baseplate', unity_script.ORDER_ATOMIC);
  var value_arms = unity_script.valueToCode(block, 'arms', unity_script.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'new armorstand.SteveBot('+value_name+', '+value_location+', '+value_pose+', '+value_animation+', '+value_desires+', '+value_tiny+', '+value_baseplate+', '+value_arms+')';
  return [code, unity_script.ORDER_NONE];
};
unity_script['setstevebotanim'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var variable_name = unity_script.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_name+'.setAnimation('+value_name+');\n';
  return code;
};
unity_script['change_stevebot_armor'] = function(block) {
  var value_item = unity_script.valueToCode(block, 'item', unity_script.ORDER_ATOMIC);
  var dropdown_item = block.getFieldValue('item');
  var variable_bot = unity_script.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_bot+'.set'+dropdown_item+'('+value_item+');\n';;
  return code;
};
unity_script['animbuilder'] = function(block) {
  var statements_name = unity_script.statementToCode(block, 'NAME');
  var code = 'new armorstand.Animation(['+statements_name+'])';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};
unity_script['animblock'] = function(block) {
  var value_pose = unity_script.valueToCode(block, 'pose', unity_script.ORDER_ATOMIC);
  var value_delay = unity_script.valueToCode(block, 'delay', unity_script.ORDER_ATOMIC);
  var code = '['+value_pose+', '+value_delay+'],\n';
  return code;
};
unity_script['setdesires'] = function(block) {
  var value_desires = unity_script.valueToCode(block, 'desires', unity_script.ORDER_ATOMIC);
  var variable_bot = unity_script.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_bot+'.setDesires('+value_desires+');\n';
  return code;
};
unity_script['adddesire'] = function(block) {
  var value_desire = unity_script.valueToCode(block, 'desire', unity_script.ORDER_ATOMIC);
  var value_priority = unity_script.valueToCode(block, 'priority', unity_script.ORDER_ATOMIC);
  var variable_bot = unity_script.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = variable_bot+'.addDesire('+value_desire+', '+value_priority+');\n';;
  return code;
};
unity_script['skull'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'name', unity_script.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "armorstand.skull("+value_name+")";
  return [code, unity_script.ORDER_NONE];
};
unity_script['entitieswithinrange'] = function(block) {
  var value_name = unity_script.valueToCode(block, 'NAME', unity_script.ORDER_ATOMIC);
  var value_entity = unity_script.valueToCode(block, 'entity', unity_script.ORDER_ATOMIC);
  var code = 'armorstand.entities('+value_entity+', '+value_name+')';
  return [code, unity_script.ORDER_NONE];
};
unity_script['entitieswithinrange_mod'] = function(block) {
  var value_type = unity_script.valueToCode(block, 'type', unity_script.ORDER_ATOMIC);
  var value_range = unity_script.valueToCode(block, 'range', unity_script.ORDER_ATOMIC);
  var value_entity = unity_script.valueToCode(block, 'entity', unity_script.ORDER_ATOMIC);
  var code = 'armorstand.entities('+value_entity+', '+value_range+', '+value_type+')';
  return [code, unity_script.ORDER_NONE];
};
unity_script['stevebot_move'] = function(block) {
  var value_location = unity_script.valueToCode(block, 'location', unity_script.ORDER_ATOMIC);
  var variable_bot = unity_script.variableDB_.getName(block.getFieldValue('bot'), Blockly.Variables.NAME_TYPE);
  var code = variable_bot+'.moveTo('+value_location+');\n';
  return code;
};

unity_script['prebuilt_pose_handshake'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.handshake_pose';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};


unity_script['prebuilt_pose_wave'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.wave_pose';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['prebuilt_anim_wave'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.wave_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['prebuilt_anim_block'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.block_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['prebuilt_anim_attack'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.attack_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['prebuilt_anim_attack'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'armorstand.walk_anim';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, unity_script.ORDER_NONE];
};

unity_script['broadcast_message'] = function(block) {
  var value_message = unity_script.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'server.broadcastMessage('+value_message+');\n';
  return code;
};


}
setup_unity_script_more(Blockly.UnityScript)
