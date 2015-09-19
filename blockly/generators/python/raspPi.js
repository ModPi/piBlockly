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

goog.provide('Blockly.Python.raspPi');

Blockly.Python['print'] = function(block) {
  var valueNum = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
  var code = 'print '+valueNum+'\n';
  return code;
};

Blockly.Python['input'] = function(block) {
  Blockly.Python.definitions_['import_gpio'] = 'import RPi.GPIO as GPIO\n'
  var valueNum = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
  var value_pinNumber = Blockly.Python.valueToCode(block, 'pinNumber', Blockly.Python.ORDER_ATOMIC);
  var code = 'GPIO.input('+value_pinNumber+')';

  Blockly.Python.definitions_['iz_gpio'] = 'GPIO.setmode(GPIO.BCM)';
  Blockly.Python.definitions_['setMode_'+value_pinNumber] = 'GPIO.setup('+value_pinNumber+', GPIO.IN)';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['sleep_time'] = function(block) {
  Blockly.Python.definitions_['import_time'] = 'import time as time'
  var valueNum = Blockly.Python.valueToCode(block, 'num', Blockly.Python.ORDER_ATOMIC);
  if(!valueNum){
    valueNum = 0;
  }
  var code = 'time.sleep('+valueNum+')\n';
  return code;
};

Blockly.Python['output'] = function(block) {
  var value_outputType = this.getFieldValue('outputType');
  var value_pinNumber = Blockly.Python.valueToCode(block, 'pinNumber', Blockly.Python.ORDER_ATOMIC);
  var code = 'GPIO.output('+value_pinNumber+', '+value_outputType+')\n';

  Blockly.Python.definitions_['import_gpio'] = 'import RPi.GPIO as GPIO';
  Blockly.Python.definitions_['iz_gpio'] = 'GPIO.setmode(GPIO.BCM)';
  Blockly.Python.definitions_['setMode_'+value_pinNumber] = 'GPIO.setup('+value_pinNumber+', GPIO.OUT)';
  return code;
};

