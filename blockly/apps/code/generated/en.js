// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">a visual programming environment</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">See generated JavaScript code.</span><span id="linkTooltip">Save and link to blocks.</span><span id="runTooltip">Run the program defined by the blocks in the workspace.</span><span id="runProgram">Run Program</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Cancel</span><span id="catLogic">Logic</span><span id="catLoops">Loops</span><span id="catMath">Math</span><span id="catText">Text</span><span id="catLists">Lists</span><span id="catColour">Colour</span><span id="catVariables">Variables</span><span id="catProcedures">Functions</span><span id="httpRequestError">There was a problem with the request.</span><span id="linkAlert">Share your blocks with this link:\\n\\n%1</span><span id="hashError">Sorry, \'%1\' doesn\'t correspond with any saved program.</span><span id="xmlError">Could not load your saved file.  Perhaps it was created with a different version of Blockly?</span><span id="listVariable">list</span><span id="textVariable">text</span></div>';
};


apps.dialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.ok = function(opt_data, opt_ignored, opt_ijData) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">OK</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof codepage == 'undefined') { var codepage = {}; }


codepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Code_badXml">Error parsing XML:\\n%1\\n\\nSelect \'OK\' to abandon your changes or \'Cancel\' to further edit the XML.</span><span id="Code_badCode">Program error:\\n%1</span><span id="Code_timeout">Maximum execution iterations exceeded.</span><span id="Code_discard">Delete all %1 blocks?</span></div>';
};


codepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return codepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../generators/python.js"><\/script><script type="text/javascript" src="../../generators/python/colour.js"><\/script><script type="text/javascript" src="../../generators/python/lists.js"><\/script><script type="text/javascript" src="../../generators/python/logic.js"><\/script><script type="text/javascript" src="../../generators/python/loops.js"><\/script><script type="text/javascript" src="../../generators/python/math.js"><\/script><script type="text/javascript" src="../../generators/python/procedures.js"><\/script><script type="text/javascript" src="../../generators/python/text.js"><\/script><script type="text/javascript" src="../../generators/python/variables.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../unityscript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="minecraft.js"><\/script><script type="text/javascript" src="minecraftPi.js"><\/script><script type="text/javascript" src="minecraftPi2.js"><\/script><script type="text/javascript" src="raspberryPi.js"><\/script><script type="text/javascript" src="simulator.js"><\/script><table width="100%" height="100%"><tr><td><h1 style="display:none"><span id="title"></span></h1></td><td class="farSide"><select style="display:none" id="languageMenu"></select></td></tr><tr><td colspan=2><table width="100%"><tr id="tabRow" height="1em"><td id="tab_blocks" class="tabon">Blocks</td><td class="tabmin">&nbsp;</td><td id="tab_python" class="taboff">Python</td><td class="tabmin">&nbsp;</td><td class="tabmax"><span id="linkButton"></span></td></tr></table></td></tr><tr><td height="99%" colspan=2 id="content_area">' + codepage.toolbox(null, null, opt_ijData) + '</td></tr></table><div id="content_blocks" class="content"></div><pre id="content_python" class="content"></pre>' + apps.dialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData);
};


codepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><category name="Minecraft Pi"><category name="Game"><block type="get_block"></block><block type="post_to_chat"></block></category><category name="Blocks"></category><category name="Events"></category><category name="Vector"></category></category><category name="Raspberry Pi"><block type="sleep_time"></block><block type="print"></block><block type="input"></block></category><category name="Logic"><block type="controls_if"></block><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block><block type="logic_boolean"></block><block type="logic_null"></block><block type="logic_ternary"></block></category><category name="Loops"><block type="controls_repeat_ext"><value name="TIMES"><block type="math_number"><field name="NUM">10</field></block></value></block><block type="controls_whileUntil"></block><block type="controls_for"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">10</field></block></value><value name="BY"><block type="math_number"><field name="NUM">1</field></block></value></block><block type="controls_forEach"></block><block type="controls_flow_statements"></block></category><category name="Math"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_single"></block><block type="math_trig"></block><block type="math_constant"></block><block type="math_number_property"></block><block type="math_change"><value name="DELTA"><block type="math_number"><field name="NUM">1</field></block></value></block><block type="math_round"></block><block type="math_on_list"></block><block type="math_modulo"></block><block type="math_constrain"><value name="LOW"><block type="math_number"><field name="NUM">1</field></block></value><value name="HIGH"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_float"></block></category><category name="Text"><block type="text"></block><block type="text_join"></block><block type="text_append"><value name="TEXT"><block type="text"></block></value></block><block type="text_length"></block><block type="text_isEmpty"></block><block type="text_indexOf"><value name="VALUE"><block type="variables_get"><field name="VAR">text</field></block></value></block><block type="text_charAt"><value name="VALUE"><block type="variables_get"><field name="VAR">text</field></block></value></block><block type="text_getSubstring"><value name="STRING"><block type="variables_get"><field name="VAR">text</field></block></value></block><block type="text_changeCase"></block><block type="text_trim"></block></category><category name="Lists"><block type="lists_create_empty"></block><block type="lists_create_with"></block><block type="lists_repeat"><value name="NUM"><block type="math_number"><field name="NUM">5</field></block></value></block><block type="lists_length"></block><block type="lists_isEmpty"></block><block type="lists_indexOf"><value name="VALUE"><block type="variables_get"><field name="VAR">list</field></block></value></block><block type="lists_getIndex"><value name="VALUE"><block type="variables_get"><field name="VAR">list</field></block></value></block><block type="lists_setIndex"><value name="LIST"><block type="variables_get"><field name="VAR">list</field></block></value></block><block type="lists_getSublist"><value name="LIST"><block type="variables_get"><field name="VAR">list</field></block></value></block></category><category name="Variables" custom="VARIABLE"></category><category name="Functions" custom="PROCEDURE"></category><category name="Minecraft"><category name="Entities"><block type="entity_type"></block><block type="typeof"></block><block type="get_location"></block><block type="set_location"></block><block type="teleport"></block><block type="rotate_player"></block><block type="entitieswithinrange"><value name="NAME"><block type="math_number"></block></value></block><block type="entitieswithinrange_mod"><value name="range"><block type="math_number"></block></value></block></category><category name="Players"><block type="me"></block><block type="player"></block><block type="send"></block><block type="potion_effect"></block><block type="perform_command"></block><block type="register_command"></block><block type="changearmor"></block><block type="clear_armor"></block><block type="get_target_block"></block><block type="texturepack"></block></category><category name = "Item"><block type="item_in_hand"></block><block type="give_item"></block><block type="remove_items"></block><block type="remove_all_items"></block><block type="new_itemstack"></block><block type="add_lore"></block><block type="change_item_name"></block><block type="give_item_to_player"></block><block type="skull"></block></category><category name="Drone"><block type="new_drone"></block><block type="drone_move"></block><block type="drone_move_2"></block><block type="block_place"></block><block type="mob"></block></category><category name="NPC"><block type="newgoal"><value name="shouldexecute"><block type="anon_func"><mutation><arg name="selector"></arg></mutation></block></value><value name="run"><block type="anon_func"><mutation><arg name="selector"></arg></mutation></block></value><value name="priority"><block type="math_number"></block></value></block><block type="newnpc"><value name="type"><block type="entity_type"></block></value><value name="named"><block type="text"></block></value></block><block type="npc_navigate"> </block><block type="npc_navigate_entity"><value name="aggro"><block type="logic_boolean"></block></value></block><block type="navigation_events"></block><block type="npc_events"></block></category><category name="SteveBot"><block type="stevebot"><value name="name"><block type="text"></block></value><value name="location"><block type="get_location"><value name="THING"><block type="me"></block></value></block></value><value name="pose"><block type="logic_null"></block></value><value name="animation"><block type="logic_null"></block></value><value name="desires"><block type="logic_null"></block></value><value name="tiny"><block type="logic_boolean"></block></value><value name="baseplate"><block type="logic_boolean"></block></value><value name="arms"><block type="logic_boolean"></block></value></block><block type="change_stevebot_armor"><value name="item"><block type="new_itemstack"></block></value></block><block type="setstevebotanim"></block><block type="setdesires"><value name="desires"><block type="lists_create_with"></block></value></block><block type="adddesire"><value name="priority"><block type="math_number"></block></value></block><block type="stevebot_move"></block><category name="Pose Builder"><block type="pose"></block><block type="equippart"><value name="equip"><block type="new_itemstack"></block></value></block><block type="posepart"><value name="angle"><block type="eulerangle"></block></value></block><block type="eulerangle"></block><block type="prebuilt_pose_handshake"></block><block type="prebuilt_pose_wave"></block></category><category name="Animation"><block type="animbuilder"></block><block type="animblock"><value name="delay"><block type="math_number"></block></value></block><block type="prebuilt_anim_wave"></block><block type="prebuilt_anim_block"></block><block type="prebuilt_anim_attack"></block><block type="prebuilt_anim_walk"></block></category></category><category name="World"><block type="broadcast_message"></block><block type="world"></block><block type="explosion"></block><block type="firework"></block><block type="get_meta"></block><block type="set_meta"></block><block type="spawn_entity"></block><block type="materialat"></block><block type="update_sign"></block><block type="paste_schematic"></block></category><category name="Particles"><block type="line_particle"></block><block type="point_particle"></block><block type="sphere_particle"></block><block type="particle_HUGE_EXPLOSION"></block><block type="particle_LARGE_EXPLOSION"></block><block type="particle_FIREWORKS_SPARK"></block><block type="particle_BUBBLE"></block><block type="particle_SUSPEND"></block><block type="particle_DEPTH_SUSPEND"></block><block type="particle_TOWN_AURA"></block><block type="particle_CRIT"></block><block type="particle_MAGIC_CRIT"></block><block type="particle_MOB_SPELL"></block><block type="particle_MOB_SPELL_AMBIENT"></block><block type="particle_SPELL"></block><block type="particle_INSTANT_SPELL"></block><block type="particle_WITCH_MAGIC"></block><block type="particle_NOTE"></block><block type="particle_PORTAL"></block><block type="particle_ENCHANTMENT_TABLE"></block><block type="particle_EXPLODE"></block><block type="particle_FLAME"></block><block type="particle_LAVA"></block><block type="particle_FOOTSTEP"></block><block type="particle_LARGE_SMOKE"></block><block type="particle_CLOUD"></block><block type="particle_RED_DUST"></block><block type="particle_SNOWBALL_POOF"></block><block type="particle_DRIP_WATER"></block><block type="particle_DRIP_LAVA"></block><block type="particle_SNOW_SHOVEL"></block><block type="particle_SLIME"></block><block type="particle_HEART"></block><block type="particle_ANGRY_VILLAGER"></block><block type="particle_HAPPY_VILLAGER"></block></category><category name="Recipes"><block type="new_recipe"></block><block type="recipe_row"></block></category><category name="Block"><block type="spawnfallingblock"></block><block type="getblockatlocation"></block><block type="getblockrel"></block><block type="blockfaces"></block><block type="setvelocity"></block><block type="velocity"></block></category><category name="Events"><block type="interval"></block><block type="timeout"></block><block type="event"></block><block type="new_event"></block></category><category name="Music"><category name="Instruments"><block type="instrument_bass_drum"></block><block type="instrument_bass_guitar"></block><block type="instrument_piano"></block><block type="instrument_snare_drum"></block><block type="instrument_sticks"></block></category><block type="tune"></block><block type="tone"></block><block type="rest"></block><block type="fast_tempo"></block><block type="regular_tempo"></block><block type="slow_tempo"></block><block type="sharpen"></block><block type="flatten"></block></category><category name="Materials [A - C]"><block type="block_type_ACTIVATOR_RAIL"></block><block type="block_type_AIR"></block><block type="block_type_ANVIL"></block><block type="block_type_APPLE"></block><block type="block_type_ARROW"></block><block type="block_type_BAKED_POTATO"></block><block type="block_type_BEACON"></block><block type="block_type_BED"></block><block type="block_type_BED_BLOCK"></block><block type="block_type_BEDROCK"></block><block type="block_type_BIRCH_WOOD_STAIRS"></block><block type="block_type_BLAZE_POWDER"></block><block type="block_type_BLAZE_ROD"></block><block type="block_type_BOAT"></block><block type="block_type_BONE"></block><block type="block_type_BOOK"></block><block type="block_type_BOOK_AND_QUILL"></block><block type="block_type_BOOKSHELF"></block><block type="block_type_BOW"></block><block type="block_type_BOWL"></block><block type="block_type_BREAD"></block><block type="block_type_BREWING_STAND"></block><block type="block_type_BREWING_STAND_ITEM"></block><block type="block_type_BRICK"></block><block type="block_type_BRICK_STAIRS"></block><block type="block_type_BROWN_MUSHROOM"></block><block type="block_type_BUCKET"></block><block type="block_type_BURNING_FURNACE"></block><block type="block_type_CACTUS"></block><block type="block_type_CAKE"></block><block type="block_type_CAKE_BLOCK"></block><block type="block_type_CARPET"></block><block type="block_type_CARROT_ITEM"></block><block type="block_type_CARROT_STICK"></block><block type="block_type_CAULDRON"></block><block type="block_type_CAULDRON_ITEM"></block><block type="block_type_CHAINMAIL_BOOTS"></block><block type="block_type_CHAINMAIL_CHESTPLATE"></block><block type="block_type_CHAINMAIL_HELMET"></block><block type="block_type_CHAINMAIL_LEGGINGS"></block><block type="block_type_CHEST"></block><block type="block_type_CLAY"></block><block type="block_type_CLAY_BALL"></block><block type="block_type_CLAY_BRICK"></block><block type="block_type_COAL"></block><block type="block_type_COAL_BLOCK"></block><block type="block_type_COAL_ORE"></block><block type="block_type_COBBLE_WALL"></block><block type="block_type_COBBLESTONE"></block><block type="block_type_COBBLESTONE_STAIRS"></block><block type="block_type_COCOA"></block><block type="block_type_COMMAND"></block><block type="block_type_COMPASS"></block><block type="block_type_COOKED_BEEF"></block><block type="block_type_COOKED_CHICKEN"></block><block type="block_type_COOKED_FISH"></block><block type="block_type_COOKIE"></block><block type="block_type_CRAFTING_TABLE"></block><block type="block_type_CROPS"></block></category><category name="Materials [D - G]"><block type="block_type_DAYLIGHT_DETECTOR"></block><block type="block_type_DEAD_BUSH"></block><block type="block_type_DETECTOR_RAIL"></block><block type="block_type_DIAMOND"></block><block type="block_type_DIAMOND_AXE"></block><block type="block_type_DIAMOND_BARDING"></block><block type="block_type_DIAMOND_BLOCK"></block><block type="block_type_DIAMOND_BOOTS"></block><block type="block_type_DIAMOND_CHESTPLATE"></block><block type="block_type_DIAMOND_HELMET"></block><block type="block_type_DIAMOND_HOE"></block><block type="block_type_DIAMOND_LEGGINGS"></block><block type="block_type_DIAMOND_ORE"></block><block type="block_type_DIAMOND_PICKAXE"></block><block type="block_type_DIAMOND_SPADE"></block><block type="block_type_DIAMOND_SWORD"></block><block type="block_type_DIODE"></block><block type="block_type_DIODE_BLOCK_OFF"></block><block type="block_type_DIODE_BLOCK_ON"></block><block type="block_type_DIRT"></block><block type="block_type_DISPENSER"></block><block type="block_type_DOUBLE_STEP"></block><block type="block_type_DRAGON_EGG"></block><block type="block_type_DROPPER"></block><block type="block_type_EGG"></block><block type="block_type_EMERALD"></block><block type="block_type_EMERALD_BLOCK"></block><block type="block_type_EMERALD_ORE"></block><block type="block_type_EMPTY_MAP"></block><block type="block_type_ENCHANTED_BOOK"></block><block type="block_type_ENCHANTMENT_TABLE"></block><block type="block_type_ENDER_CHEST"></block><block type="block_type_ENDER_PEARL"></block><block type="block_type_ENDER_PORTAL"></block><block type="block_type_ENDER_PORTAL_FRAME"></block><block type="block_type_ENDER_STONE"></block><block type="block_type_EXP_BOTTLE"></block><block type="block_type_EXPLOSIVE_MINECART"></block><block type="block_type_EYE_OF_ENDER"></block><block type="block_type_FEATHER"></block><block type="block_type_FENCE"></block><block type="block_type_FENCE_GATE"></block><block type="block_type_FERMENTED_SPIDER_EYE"></block><block type="block_type_FIRE"></block><block type="block_type_FIREBALL"></block><block type="block_type_FIREWORK"></block><block type="block_type_FIREWORK_CHARGE"></block><block type="block_type_FISHING_ROD"></block><block type="block_type_FLINT"></block><block type="block_type_FLINT_AND_STEEL"></block><block type="block_type_FLOWER_POT"></block><block type="block_type_FLOWER_POT_ITEM"></block><block type="block_type_FURNACE"></block><block type="block_type_GHAST_TEAR"></block><block type="block_type_GLASS"></block><block type="block_type_GLASS_BOTTLE"></block><block type="block_type_GLOWING_REDSTONE_ORE"></block><block type="block_type_GLOWSTONE"></block><block type="block_type_GLOWSTONE_DUST"></block><block type="block_type_GOLD_AXE"></block><block type="block_type_GOLD_BARDING"></block><block type="block_type_GOLD_BLOCK"></block><block type="block_type_GOLD_BOOTS"></block><block type="block_type_GOLD_CHESTPLATE"></block><block type="block_type_GOLD_HELMET"></block><block type="block_type_GOLD_HOE"></block><block type="block_type_GOLD_INGOT"></block><block type="block_type_GOLD_LEGGINGS"></block><block type="block_type_GOLD_NUGGET"></block><block type="block_type_GOLD_ORE"></block><block type="block_type_GOLD_PICKAXE"></block><block type="block_type_GOLD_PLATE"></block><block type="block_type_GOLD_RECORD"></block><block type="block_type_GOLD_SPADE"></block><block type="block_type_GOLD_SWORD"></block><block type="block_type_GOLDEN_APPLE"></block><block type="block_type_GOLDEN_CARROT"></block><block type="block_type_GRASS"></block><block type="block_type_GRAVEL"></block><block type="block_type_GREEN_RECORD"></block><block type="block_type_GRILLED_PORK"></block></category><category name="Materials [H - M]"><block type="block_type_HARD_CLAY"></block><block type="block_type_HAY_BLOCK"></block><block type="block_type_HOPPER"></block><block type="block_type_HOPPER_MINECART"></block><block type="block_type_HUGE_MUSHROOM_1"></block><block type="block_type_HUGE_MUSHROOM_2"></block><block type="block_type_ICE"></block><block type="block_type_INK_SACK"></block><block type="block_type_IRON_AXE"></block><block type="block_type_IRON_BARDING"></block><block type="block_type_IRON_BLOCK"></block><block type="block_type_IRON_BOOTS"></block><block type="block_type_IRON_CHESTPLATE"></block><block type="block_type_IRON_DOOR"></block><block type="block_type_IRON_DOOR_BLOCK"></block><block type="block_type_IRON_FENCE"></block><block type="block_type_IRON_HELMET"></block><block type="block_type_IRON_HOE"></block><block type="block_type_IRON_INGOT"></block><block type="block_type_IRON_LEGGINGS"></block><block type="block_type_IRON_ORE"></block><block type="block_type_IRON_PICKAXE"></block><block type="block_type_IRON_PLATE"></block><block type="block_type_IRON_SPADE"></block><block type="block_type_IRON_SWORD"></block><block type="block_type_ITEM_FRAME"></block><block type="block_type_JACK_O_LANTERN"></block><block type="block_type_JUKEBOX"></block><block type="block_type_JUNGLE_WOOD_STAIRS"></block><block type="block_type_LADDER"></block><block type="block_type_LAPIS_BLOCK"></block><block type="block_type_LAPIS_ORE"></block><block type="block_type_LAVA"></block><block type="block_type_LAVA_BUCKET"></block><block type="block_type_LEASH"></block><block type="block_type_LEATHER"></block><block type="block_type_LEATHER_BOOTS"></block><block type="block_type_LEATHER_CHESTPLATE"></block><block type="block_type_LEATHER_HELMET"></block><block type="block_type_LEATHER_LEGGINGS"></block><block type="block_type_LEAVES"></block><block type="block_type_LEVER"></block><block type="block_type_LOCKED_CHEST"></block><block type="block_type_LOG"></block><block type="block_type_LONG_GRASS"></block><block type="block_type_MAGMA_CREAM"></block><block type="block_type_MAP"></block><block type="block_type_MELON"></block><block type="block_type_MELON_BLOCK"></block><block type="block_type_MELON_SEEDS"></block><block type="block_type_MELON_STEM"></block><block type="block_type_MILK_BUCKET"></block><block type="block_type_MINECART"></block><block type="block_type_MOB_SPAWNER"></block><block type="block_type_MONSTER_EGG"></block><block type="block_type_MONSTER_EGGS"></block><block type="block_type_MOSSY_COBBLESTONE"></block><block type="block_type_MUSHROOM_SOUP"></block><block type="block_type_MYCEL"></block></category><category name="Materials [N - R]"><block type="block_type_NAME_TAG"></block><block type="block_type_NETHER_BRICK"></block><block type="block_type_NETHER_BRICK_ITEM"></block><block type="block_type_NETHER_BRICK_STAIRS"></block><block type="block_type_NETHER_FENCE"></block><block type="block_type_NETHER_STALK"></block><block type="block_type_NETHER_STAR"></block><block type="block_type_NETHER_WARTS"></block><block type="block_type_NETHERRACK"></block><block type="block_type_NOTE_BLOCK"></block><block type="block_type_OBSIDIAN"></block><block type="block_type_PAINTING"></block><block type="block_type_PAPER"></block><block type="block_type_PISTON_BASE"></block><block type="block_type_PISTON_EXTENSION"></block><block type="block_type_PISTON_MOVING_PIECE"></block><block type="block_type_PISTON_STICKY_BASE"></block><block type="block_type_POISONOUS_POTATO"></block><block type="block_type_PORK"></block><block type="block_type_PORTAL"></block><block type="block_type_POTATO"></block><block type="block_type_POTATO_ITEM"></block><block type="block_type_POTION"></block><block type="block_type_POWERED_MINECART"></block><block type="block_type_POWERED_RAIL"></block><block type="block_type_PUMPKIN"></block><block type="block_type_PUMPKIN_PIE"></block><block type="block_type_PUMPKIN_SEEDS"></block><block type="block_type_PUMPKIN_STEM"></block><block type="block_type_QUARTZ"></block><block type="block_type_QUARTZ_BLOCK"></block><block type="block_type_QUARTZ_ORE"></block><block type="block_type_QUARTZ_STAIRS"></block><block type="block_type_RAILS"></block><block type="block_type_RAW_BEEF"></block><block type="block_type_RAW_CHICKEN"></block><block type="block_type_RAW_FISH"></block><block type="block_type_RECORD_10"></block><block type="block_type_RECORD_11"></block><block type="block_type_RECORD_12"></block><block type="block_type_RECORD_3"></block><block type="block_type_RECORD_4"></block><block type="block_type_RECORD_5"></block><block type="block_type_RECORD_6"></block><block type="block_type_RECORD_7"></block><block type="block_type_RECORD_8"></block><block type="block_type_RECORD_9"></block><block type="block_type_RED_MUSHROOM"></block><block type="block_type_RED_ROSE"></block><block type="block_type_REDSTONE"></block><block type="block_type_REDSTONE_BLOCK"></block><block type="block_type_REDSTONE_COMPARATOR"></block><block type="block_type_REDSTONE_COMPARATOR_OFF"></block><block type="block_type_REDSTONE_COMPARATOR_ON"></block><block type="block_type_REDSTONE_LAMP_OFF"></block><block type="block_type_REDSTONE_LAMP_ON"></block><block type="block_type_REDSTONE_ORE"></block><block type="block_type_REDSTONE_TORCH_OFF"></block><block type="block_type_REDSTONE_TORCH_ON"></block><block type="block_type_REDSTONE_WIRE"></block><block type="block_type_ROTTEN_FLESH"></block></category><category name="Materials [S - Z]"><block type="block_type_SADDLE"></block><block type="block_type_SAND"></block><block type="block_type_SANDSTONE"></block><block type="block_type_SANDSTONE_STAIRS"></block><block type="block_type_SAPLING"></block><block type="block_type_SEEDS"></block><block type="block_type_SHEARS"></block><block type="block_type_SIGN"></block><block type="block_type_SIGN_POST"></block><block type="block_type_SKULL"></block><block type="block_type_SKULL_ITEM"></block><block type="block_type_SLIME_BALL"></block><block type="block_type_SMOOTH_BRICK"></block><block type="block_type_SMOOTH_STAIRS"></block><block type="block_type_SNOW"></block><block type="block_type_SNOW_BALL"></block><block type="block_type_SNOW_BLOCK"></block><block type="block_type_SOIL"></block><block type="block_type_SOUL_SAND"></block><block type="block_type_SPECKLED_MELON"></block><block type="block_type_SPIDER_EYE"></block><block type="block_type_SPONGE"></block><block type="block_type_SPRUCE_WOOD_STAIRS"></block><block type="block_type_STAINED_CLAY"></block><block type="block_type_STATIONARY_LAVA"></block><block type="block_type_STATIONARY_WATER"></block><block type="block_type_STEP"></block><block type="block_type_STICK"></block><block type="block_type_STONE"></block><block type="block_type_STONE_AXE"></block><block type="block_type_STONE_BUTTON"></block><block type="block_type_STONE_HOE"></block><block type="block_type_STONE_PICKAXE"></block><block type="block_type_STONE_PLATE"></block><block type="block_type_STONE_SPADE"></block><block type="block_type_STONE_SWORD"></block><block type="block_type_STORAGE_MINECART"></block><block type="block_type_STRING"></block><block type="block_type_SUGAR"></block><block type="block_type_SUGAR_CANE"></block><block type="block_type_SUGAR_CANE_BLOCK"></block><block type="block_type_SULPHUR"></block><block type="block_type_THIN_GLASS"></block><block type="block_type_TNT"></block><block type="block_type_TORCH"></block><block type="block_type_TRAP_DOOR"></block><block type="block_type_TRAPPED_CHEST"></block><block type="block_type_TRIPWIRE"></block><block type="block_type_TRIPWIRE_HOOK"></block><block type="block_type_VINE"></block><block type="block_type_WALL_SIGN"></block><block type="block_type_WATCH"></block><block type="block_type_WATER"></block><block type="block_type_WATER_BUCKET"></block><block type="block_type_WATER_LILY"></block><block type="block_type_WEB"></block><block type="block_type_WHEAT"></block><block type="block_type_WOOD"></block><block type="block_type_WOOD_AXE"></block><block type="block_type_WOOD_BUTTON"></block><block type="block_type_WOOD_DOOR"></block><block type="block_type_WOOD_DOUBLE_STEP"></block><block type="block_type_WOOD_HOE"></block><block type="block_type_WOOD_PICKAXE"></block><block type="block_type_WOOD_PLATE"></block><block type="block_type_WOOD_SPADE"></block><block type="block_type_WOOD_STAIRS"></block><block type="block_type_WOOD_STEP"></block><block type="block_type_WOOD_SWORD"></block><block type="block_type_WOODEN_DOOR"></block><block type="block_type_WOOL"></block><block type="block_type_WORKBENCH"></block><block type="block_type_WRITTEN_BOOK"></block><block type="block_type_YELLOW_FLOWER"></block></category></category><category name="Misc"><block type="eval"></block><block type="dot"></block><block type="generalsetter"></block><block type="functionblock"></block><block type="functionblock_dropdown"></block><block type="js"></block><block type="js_noret"></block><block type="anon_func"></block><block type="local_var"></block><block type="import"></block><block type="export"></block><block type="new_object"></block><block type="call"></block><block type="callret"></block><block type="get_object"></block><block type="put_object"></block><block type="accessjso"></block><block type="setjso"></block><block type="keyinjso"></block></category></xml>';

};


codepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return codepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><div id="blockly"></div>';
};
