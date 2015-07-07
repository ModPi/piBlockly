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
 * @fileoverview Generating UnityScript for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.UnityScript.math');

goog.require('Blockly.UnityScript');


function setup_math(unity_script){
  unity_script.setup_math = setup_math

unity_script['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  return [code, unity_script.ORDER_ATOMIC];
};

unity_script['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', unity_script.ORDER_ADDITION],
    'MINUS': [' - ', unity_script.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', unity_script.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', unity_script.ORDER_DIVISION],
    'POWER': [null, unity_script.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = unity_script.valueToCode(block, 'A', order) || '0';
  var argument1 = unity_script.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in UnityScript requires a special case since it has no operator.
  if (!operator) {
    code = 'Mathff.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, unity_script.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

unity_script['math_single'] = function(block) {
  // Mathf operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = unity_script.valueToCode(block, 'NUM',
        unity_script.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, unity_script.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = unity_script.valueToCode(block, 'NUM',
        unity_script.ORDER_DIVISION) || '0';
  } else {
    arg = unity_script.valueToCode(block, 'NUM',
        unity_script.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'Mathf.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'Mathf.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Mathf.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'Mathf.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Mathf.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'Mathf.round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'Mathf.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'parseInt(Mathf.Floor(' + arg + '))';
      break;
    case 'SIN':
      code = 'Mathf.sin(' + arg + ' / 180 * Mathf.PI)';
      break;
    case 'COS':
      code = 'Mathf.cos(' + arg + ' / 180 * Mathf.PI)';
      break;
    case 'TAN':
      code = 'Mathf.tan(' + arg + ' / 180 * Mathf.PI)';
      break;
  }
  if (code) {
    return [code, unity_script.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Mathf.log(' + arg + ') / Mathf.log(10)';
      break;
    case 'ASIN':
      code = 'Mathf.asin(' + arg + ') / Mathf.PI * 180';
      break;
    case 'ACOS':
      code = 'Mathf.acos(' + arg + ') / Mathf.PI * 180';
      break;
    case 'ATAN':
      code = 'Mathf.atan(' + arg + ') / Mathf.PI * 180';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, unity_script.ORDER_DIVISION];
};

unity_script['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Mathf.PI', unity_script.ORDER_MEMBER],
    'E': ['Mathf.E', unity_script.ORDER_MEMBER],
    'GOLDEN_RATIO': ['(1 + Mathf.sqrt(5)) / 2', unity_script.ORDER_DIVISION],
    'SQRT2': ['Mathf.SQRT2', unity_script.ORDER_MEMBER],
    'SQRT1_2': ['Mathf.SQRT1_2', unity_script.ORDER_MEMBER],
    'INFINITY': ['Infinity', unity_script.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

unity_script['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = unity_script.valueToCode(block, 'NUMBER_TO_CHECK',
      unity_script.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = unity_script.provideFunction_(
        'math_isPrime',
        [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
          '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
          '  if (n == 2 || n == 3) {',
          '    return true;',
          '  }',
          '  // False if n is NaN, negative, is 1, or not whole.',
          '  // And false if n is divisible by 2 or 3.',
          '  if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
          '    return false;',
          '  }',
          '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
          '  for (var x = 6; x <= Mathf.sqrt(n) + 1; x += 6) {',
          '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
          '      return false;',
          '    }',
          '  }',
          '  return true;',
          '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, unity_script.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = unity_script.valueToCode(block, 'DIVISOR',
          unity_script.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, unity_script.ORDER_EQUALITY];
};

unity_script['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = unity_script.valueToCode(block, 'DELTA',
      unity_script.ORDER_ADDITION) || '0';
  var varName = unity_script.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' = (typeof ' + varName + ' == \'number\' ? ' + varName +
      ' : 0) + ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
unity_script['math_round'] = unity_script['math_single'];
// Trigonometry functions have a single operand.
unity_script['math_trig'] = unity_script['math_single'];

unity_script['math_on_list'] = function(block) {
  // Mathf functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_MEMBER) || '[]';
      code = list + '.reduce(function(x, y) {return x + y;})';
      break;
    case 'MIN':
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_COMMA) || '[]';
      code = 'Mathf.min.apply(null, ' + list + ')';
      break;
    case 'MAX':
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_COMMA) || '[]';
      code = 'Mathf.max.apply(null, ' + list + ')';
      break;
    case 'AVERAGE':
      // math_median([null,null,1,3]) == 2.0.
      var functionName = unity_script.provideFunction_(
          'math_mean',
          [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
              '(myList) {',
            '  return myList.reduce(function(x, y) {return x + y;}) / ' +
                  'myList.length;',
            '}']);
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      // math_median([null,null,1,3]) == 2.0.
      var functionName = unity_script.provideFunction_(
          'math_median',
          [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
              '(myList) {',
            '  var localList = myList.filter(function (x) ' +
              '{return typeof x == \'number\';});',
            '  if (!localList.length) return null;',
            '  localList.sort(function(a, b) {return b - a;});',
            '  if (localList.length % 2 == 0) {',
            '    return (localList[localList.length / 2 - 1] + ' +
              'localList[localList.length / 2]) / 2;',
            '  } else {',
            '    return localList[(localList.length - 1) / 2];',
            '  }',
            '}']);
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = unity_script.provideFunction_(
          'math_modes',
          [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
              '(values) {',
            '  var modes = [];',
            '  var counts = [];',
            '  var maxCount = 0;',
            '  for (var i = 0; i < values.length; i++) {',
            '    var value = values[i];',
            '    var found = false;',
            '    var thisCount;',
            '    for (var j = 0; j < counts.length; j++) {',
            '      if (counts[j][0] === value) {',
            '        thisCount = ++counts[j][1];',
            '        found = true;',
            '        break;',
            '      }',
            '    }',
            '    if (!found) {',
            '      counts.push([value, 1]);',
            '      thisCount = 1;',
            '    }',
            '    maxCount = Mathf.max(thisCount, maxCount);',
            '  }',
            '  for (var j = 0; j < counts.length; j++) {',
            '    if (counts[j][1] == maxCount) {',
            '        modes.push(counts[j][0]);',
            '    }',
            '  }',
            '  return modes;',
            '}']);
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      var functionName = unity_script.provideFunction_(
          'math_standard_deviation',
          [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
              '(numbers) {',
            '  var n = numbers.length;',
            '  if (!n) return null;',
            '  var mean = numbers.reduce(function(x, y) {return x + y;}) / n;',
            '  var variance = 0;',
            '  for (var j = 0; j < n; j++) {',
            '    variance += Mathf.pow(numbers[j] - mean, 2);',
            '  }',
            '  variance = variance / n;',
            '  return Mathf.sqrt(variance);',
            '}']);
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = unity_script.provideFunction_(
          'math_random_list',
          [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
              '(list) {',
            '  var x = parseInt(Mathf.Floor(Random.value * list.length));',
            '  return list[x];',
            '}']);
      list = unity_script.valueToCode(block, 'LIST',
          unity_script.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, unity_script.ORDER_FUNCTION_CALL];
};

unity_script['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = unity_script.valueToCode(block, 'DIVIDEND',
      unity_script.ORDER_MODULUS) || '0';
  var argument1 = unity_script.valueToCode(block, 'DIVISOR',
      unity_script.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, unity_script.ORDER_MODULUS];
};

unity_script['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = unity_script.valueToCode(block, 'VALUE',
      unity_script.ORDER_COMMA) || '0';
  var argument1 = unity_script.valueToCode(block, 'LOW',
      unity_script.ORDER_COMMA) || '0';
  var argument2 = unity_script.valueToCode(block, 'HIGH',
      unity_script.ORDER_COMMA) || 'Infinity';
  var code = 'Mathf.min(Mathf.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, unity_script.ORDER_FUNCTION_CALL];
};

unity_script['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = unity_script.valueToCode(block, 'FROM',
      unity_script.ORDER_COMMA) || '0';
  var argument1 = unity_script.valueToCode(block, 'TO',
      unity_script.ORDER_COMMA) || '0';
  var functionName = unity_script.provideFunction_(
      'math_random_int',
      [ 'function ' + unity_script.FUNCTION_NAME_PLACEHOLDER_ +
          '(a, b) {',
        '  if (a > b) {',
        '    // Swap a and b to ensure a is smaller.',
        '    var c = a;',
        '    a = b;',
        '    b = c;',
        '  }',
        '  return parseInt(Mathf.Floor(Random.value * (b - a + 1) + a));',
        '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, unity_script.ORDER_FUNCTION_CALL];
};

unity_script['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['Random.value', unity_script.ORDER_FUNCTION_CALL];
};
}

setup_math(Blockly.UnityScript)
