'use strict';
var
    maskDefinitionNoSpace = {
        clearValue: function(rawValue) {
            return rawValue.toString().replace(/ /g, '');
        },
        format: function(clearValue) {
            return clearValue.toString().trim();
        },
        validations: {
            inputVaild: function(value) { return true; }
        }
    },
    maskDefinitionDigitOnly = {
        clearValue: function(rawValue) {
            return rawValue.toString().replace(/[^\d]/g, '');
        },
        format: function(clearValue) {
            return clearValue.toString().trim();
        },
        validations: {
            inputVaild: function(value) { return true; }
        }
    },
    maskDefinitionCreditCard = {
        clearValue: function(rawValue) {
            return rawValue.toString().replace(/[^\d]/g, '');
        },
        format: function(clearValue) {
            var it= clearValue.toString().match(/.{1,4}/g);
            if (!it) return '';
            return it.join('-').trim();
        },
        validations: {
            inputVaild: function(value) { return true; }
        }
    },
    maskDefinitionCustomerName = {
        clearValue: function(rawValue) {
            return rawValue.toString().replace(/[^\u0041-\u005A\u0061-\u007A\u0080-\u024F\s\.\-:\u0301\u0027\u002C\u0022\u0060\u2010-\u201F]/gi, '');
        },
        format: function(clearValue) {
            return clearValue.toString().trim();
        },
        validations: {
            inputVaild: function(value) { return true; }
        }
    },
    maskDefinitionPhoneNum = {
        clearValue: function (rawValue) {
            rawValue = rawValue.toString().replace(/^[+]{2,}/,'+');
            rawValue = rawValue.toString().replace(/[^+0-9]/g,'');
            if (/.{2,}/.test(rawValue)){
                rawValue = rawValue.toString().replace(/[+]$/,'');
            }

            return rawValue
        },
        format: function (clearValue) {
            return clearValue.toString().trim();
        },
        validations: {
            inputVaild: function (value) {
                return true;
            }
        }
    };

function maskInput(maskDefinition) {
    return function maskDirective() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                ctrl.$formatters.push(function formatter(value) {
                    if (ctrl.$isEmpty(value)) {
                        return value;
                    }

                    var cleanValue = maskDefinition.clearValue(value.toString(), attrs);
                    return maskDefinition.format(cleanValue);
                });

                ctrl.$parsers.push(function parser(value) {
                    if (ctrl.$isEmpty(value)) {
                        return value;
                    }

                    var cleanValue = maskDefinition.clearValue(value.toString(), attrs);
                    var formattedValue = maskDefinition.format(cleanValue);

                    if (ctrl.$viewValue !== formattedValue) {
                        ctrl.$setViewValue(formattedValue);
                        ctrl.$render();
                    }

                    if (angular.isUndefined(maskDefinition.getModelValue)) {
                        return cleanValue;
                    }

                    var actualModelType = typeof ctrl.$modelValue;
                    return maskDefinition.getModelValue(formattedValue, actualModelType);
                });

                angular.forEach(maskDefinition.validations, function(validatorFn, validationErrorKey) {
                    ctrl.$validators[validationErrorKey] = function validator(modelValue, viewValue) {
                        return ctrl.$isEmpty(modelValue) || validatorFn(modelValue, viewValue, attrs);
                    };
                });
            }
        };
    };
}


angular.module('maskInput', [])
    .directive('maskInputNoSpaceDirective', maskInput(maskDefinitionNoSpace))
    .directive('maskInputDigitOnlyDirective', maskInput(maskDefinitionDigitOnly))
    .directive('maskInputCreditCardDirective', maskInput(maskDefinitionCreditCard))
    .directive('maskInputCustomerNameDirective', maskInput(maskDefinitionCustomerName))
    .directive('maskInputPhoneNumDirective', maskInput(maskDefinitionPhoneNum));

