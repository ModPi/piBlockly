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
 * @fileoverview Generating UnityScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.UnityScript.procedures');

goog.require('Blockly.UnityScript');


function setup_procedures(unity_script){
  unity_script.setup_procedures = setup_procedures

unity_script['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = unity_script.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = unity_script.statementToCode(block, 'STACK');
  if (unity_script.INFINITE_LOOP_TRAP) {
    branch = unity_script.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = unity_script.valueToCode(block, 'RETURN',
      unity_script.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = unity_script.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      branch + returnValue + '}';
  code = unity_script.scrub_(block, code);
  unity_script.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
unity_script['procedures_defnoreturn'] =
    unity_script['procedures_defreturn'];

unity_script['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = unity_script.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = unity_script.valueToCode(block, 'ARG' + x,
        unity_script.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, unity_script.ORDER_FUNCTION_CALL];
};

unity_script['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = unity_script.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = unity_script.valueToCode(block, 'ARG' + x,
        unity_script.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

unity_script['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = unity_script.valueToCode(block, 'CONDITION',
      unity_script.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = unity_script.valueToCode(block, 'VALUE',
        unity_script.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};

}

setup_procedures(Blockly.UnityScript)
