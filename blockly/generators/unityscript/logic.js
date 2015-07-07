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
 * @fileoverview Generating UnityScript for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.UnityScript.logic');

goog.require('Blockly.UnityScript');

function setup_logic(unity_script){
  unity_script.setup_logic = setup_logic
unity_script['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = unity_script.valueToCode(block, 'IF' + n,
      unity_script.ORDER_NONE) || 'false';
  var branch = unity_script.statementToCode(block, 'DO' + n);
  var code = 'if (' + argument + ') {\n' + branch + '}';
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = unity_script.valueToCode(block, 'IF' + n,
        unity_script.ORDER_NONE) || 'false';
    branch = unity_script.statementToCode(block, 'DO' + n);
    code += ' else if (' + argument + ') {\n' + branch + '}';
  }
  if (block.elseCount_) {
    branch = unity_script.statementToCode(block, 'ELSE');
    code += ' else {\n' + branch + '}';
  }
  return code + '\n';
};

unity_script['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      unity_script.ORDER_EQUALITY : unity_script.ORDER_RELATIONAL;
  var argument0 = unity_script.valueToCode(block, 'A', order) || '0';
  var argument1 = unity_script.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

unity_script['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? unity_script.ORDER_LOGICAL_AND :
      unity_script.ORDER_LOGICAL_OR;
  var argument0 = unity_script.valueToCode(block, 'A', order);
  var argument1 = unity_script.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

unity_script['logic_negate'] = function(block) {
  // Negation.
  var order = unity_script.ORDER_LOGICAL_NOT;
  var argument0 = unity_script.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

unity_script['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, unity_script.ORDER_ATOMIC];
};

unity_script['logic_null'] = function(block) {
  // Null data type.
  return ['null', unity_script.ORDER_ATOMIC];
};

unity_script['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = unity_script.valueToCode(block, 'IF',
      unity_script.ORDER_CONDITIONAL) || 'false';
  var value_then = unity_script.valueToCode(block, 'THEN',
      unity_script.ORDER_CONDITIONAL) || 'null';
  var value_else = unity_script.valueToCode(block, 'ELSE',
      unity_script.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else
  return [code, unity_script.ORDER_CONDITIONAL];
};
}

setup_logic(Blockly.UnityScript)
