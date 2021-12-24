function Validator(options) {
    var formElement = document.querySelector(options.form);
    var elementRules = {};

    if (formElement) {

        var errorMessage;
        formElement.onsubmit = function (e) {
            var data = {};
            e.preventDefault();
            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);

                // console.log();
                switch (inputElement.type) {
                    case 'radio':
                        if (inputElement.checked) {
                            data[inputElement.name] = inputElement.value;
                        }
                        break;
                    default:
                        data[inputElement.name] = inputElement.value;
                }

                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    options.onSubmit(data);
                } else {
                    formElement.submit();
                }
            }
        }

        options.rules.forEach(function (rule) {

            var inputElement = formElement.querySelector(rule.selector);

            if (elementRules[rule.selector]) {
                elementRules[rule.selector].push(rule.test);
            } else {
                elementRules[rule.selector] = [rule.test];
            }

            if (inputElement) {

                inputElement.onblur = function () {
                    // validate(inputElement, rule);
                    errorMessage = validate(inputElement, rule);
                }

                inputElement.oninput = function () {
                    typing(inputElement);
                }
            }

        });
    }


    function validate(inputElement, rule) {
        var errorMessage;
        // var errorMessage = rule.test(inputElement.value);
        var parentForm = getParentElement(inputElement, options.selectorForm);
        var rules = elementRules[rule.selector];
        var length = rules.length;
        for (var i = 0; i < length; i++) {
            errorMessage = rules[i](inputElement.value);

            if (errorMessage) break;
        }


        if (errorMessage) {
            if (parentForm) {
                parentForm.querySelector(options.errorElement).innerText = errorMessage;
                parentForm.classList.add(options.invalidSelector);
            }

        }
        return !errorMessage;
    }

    /**
     * remove invalid selector
     * @param {*} inputElement 
     * @returns fasle if parent element not found
     */
    function typing(inputElement) {
        var parentForm = getParentElement(inputElement, options.selectorForm);
        if (parentForm) {
            parentForm.querySelector(options.errorElement).innerText = '';
            parentForm.classList.remove(options.invalidSelector);
            return;
        }
        return false;

    }

    /**
     * 
     * @param {*} element 
     * @param {*} selector of element's parent 
     * @returns element's parent if exist
     */
    function getParentElement(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
        return false;
    }
}


Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Phai nhap Email';
        }
    };
}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui long nhap truong nay';
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `phai nhieu hon ${min} ky tu`;
        }
    }
}

Validator.confirm = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'nhap lai khong dung';
        }
    }
}