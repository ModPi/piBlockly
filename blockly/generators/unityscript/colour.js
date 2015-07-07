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
 * @fileoverview Generating UnityScript for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.UnityScript.colour');

goog.require('Blockly.UnityScript');

function setup_colors(unity_script){
  unity_script.setup_colors = setup_colors
unity_script['colour_picker'] = function(block) {
  // Colour picker.
  var code = '\'' + block.getFieldValue('COLOUR') + '\'';
  return [code, unity_script.ORDER_ATOMIC];
};

unity_script['colour_random'] = function(block) {
  // Generate a random colour.
  var functionName = unity_script.provideFunction_(
      'colour_random',
      [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ + '() {',
        '  var num = parseint(Mathf.Floor(Random.value * Mathf.pow(2, 24)));',
        '  return \'#\' + (\'00000\' + num.toString(16)).substr(-6);',
        '}']);
  var code = functionName + '()';
  return [code, unity_script.ORDER_FUNCTION_CALL];
};

unity_script['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = unity_script.valueToCode(block, 'RED',
      unity_script.ORDER_COMMA) || 0;
  var green = unity_script.valueToCode(block, 'GREEN',
      unity_script.ORDER_COMMA) || 0;
  var blue = unity_script.valueToCode(block, 'BLUE',
      unity_script.ORDER_COMMA) || 0;
  var functionName = unity_script.provideFunction_(
      'colour_rgb',
      [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
          '(r, g, b) {',
        '  r = Mathf.max(Mathf.min(Number(r), 100), 0) * 2.55;',
        '  g = Mathf.max(Mathf.min(Number(g), 100), 0) * 2.55;',
        '  b = Mathf.max(Mathf.min(Number(b), 100), 0) * 2.55;',
        '  r = (\'0\' + (Mathf.round(r) || 0).toString(16)).slice(-2);',
        '  g = (\'0\' + (Mathf.round(g) || 0).toString(16)).slice(-2);',
        '  b = (\'0\' + (Mathf.round(b) || 0).toString(16)).slice(-2);',
        '  return \'#\' + r + g + b;',
        '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, unity_script.ORDER_FUNCTION_CALL];
};

unity_script['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = unity_script.valueToCode(block, 'COLOUR1',
      unity_script.ORDER_COMMA) || '\'#000000\'';
  var c2 = unity_script.valueToCode(block, 'COLOUR2',
      unity_script.ORDER_COMMA) || '\'#000000\'';
  var ratio = unity_script.valueToCode(block, 'RATIO',
      unity_script.ORDER_COMMA) || 0.5;
  var functionName = unity_script.provideFunction_(
      'colour_blend',
      [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
          '(c1, c2, ratio) {',
        '  ratio = Mathf.max(Mathf.min(Number(ratio), 1), 0);',
        '  var r1 = parseInt(c1.substring(1, 3), 16);',
        '  var g1 = parseInt(c1.substring(3, 5), 16);',
        '  var b1 = parseInt(c1.substring(5, 7), 16);',
        '  var r2 = parseInt(c2.substring(1, 3), 16);',
        '  var g2 = parseInt(c2.substring(3, 5), 16);',
        '  var b2 = parseInt(c2.substring(5, 7), 16);',
        '  var r = Mathf.round(r1 * (1 - ratio) + r2 * ratio);',
        '  var g = Mathf.round(g1 * (1 - ratio) + g2 * ratio);',
        '  var b = Mathf.round(b1 * (1 - ratio) + b2 * ratio);',
        '  r = (\'0\' + (r || 0).toString(16)).slice(-2);',
        '  g = (\'0\' + (g || 0).toString(16)).slice(-2);',
        '  b = (\'0\' + (b || 0).toString(16)).slice(-2);',
        '  return \'#\' + r + g + b;',
        '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, unity_script.ORDER_FUNCTION_CALL];
};
}

setup_colors(Blockly.UnityScript);
