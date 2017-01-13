var autocomplete;
var autocompleteListener;
var GOOGLE_API_KEY = 'AIzaSyATFA7cntWHxEWnzQ0sMQieNAGRisVqcxk';

var options = {
    types: ['geocode'],
    componentRestrictions: { country: 'au' }
};

//chargify custom fields object to manage them// 
var hiddenFieldsids = {
    noAddress: "input[id^='subscription_metafields']",
    streetText: 'autocompleteAddress',
}
//The object to load data from google//
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    postal_code: 'short_name'
};

//The object to set the data to local form//
var chargifyForm = {
    locality: "subscription_customer_attributes_city",
    postal_code: "subscription_customer_attributes_zip",
    administrative_area_level_1: "subscription_customer_attributes_state"
};

//object to validate the postcodes//
var postCodeValidaion = {
    "NSW": [
        {
            "from": 1000,
            "to": 1999
        },
        {
            "from": 2000,
            "to": 2599
        },
        {
            "from": 2620,
            "to": 2899
        },
        {
            "from": 2921,
            "to": 2999
        }
    ],
    "ACT": [
        {
            "from": 200,
            "to": 299
        },
        {
            "from": 2600,
            "to": 2619
        },
        {
            "from": 2900,
            "to": 2920
        }
    ],
    "VIC": [
        {
            "from": 3000,
            "to": 3999
        },
        {
            "from": 8000,
            "to": 8999
        }
    ],
    "QLD": [
        {
            "from": 4000,
            "to": 4999
        },
        {
            "from": 9000,
            "to": 9999
        }
    ],
    "SA": [
        {
            "from": 5000,
            "to": 5799
        },
        {
            "from": 5800,
            "to": 5999
        }
    ],
    "WA": [
        {
            "from": 6000,
            "to": 6797
        },
        {
            "from": 6800,
            "to": 6999
        }
    ],
    "TAS": [
        {
            "from": 7000,
            "to": 7799
        },
        {
            "from": 7800,
            "to": 7999
        }
    ],
    "NT": [
        {
            "from": 800,
            "to": 899
        },
        {
            "from": 900,
            "to": 999
        }
    ]
};


function initPostage() {
    $('input[id^="component_allocated_quantity_"]').val(1);
    $('input[id^="component_allocated_quantity_"]').prop("readonly", true);
    $("#form__section-apply-components").click();
}

function hideRecurringLineItem() {
    $('#summary-recurring-charges').hide();
    $('.plan__summary-total-description').hide();
}

function buildNoAddressItems() {
    var divformFieldsNoAddress = document.createElement("div");
    divformFieldsNoAddress.className = "form__fields";

    var autocompleteAddress = document.createElement("input");
    autocompleteAddress.type = "text";
    autocompleteAddress.id = "autocompleteAddress"
    autocompleteAddress.className = "form__control";

    var divformInnerOneNoAddress = document.createElement("div");
    divformInnerOneNoAddress.className = "form__field grid__one-half";
    divformInnerOneNoAddress.id = "divformInnerOneNoAddress";

    var divformInnerTwoNoAddress = document.createElement("div");
    divformInnerTwoNoAddress.className = "form__field grid__one-half";

    var divformInnerNoAddressLabel = document.createElement("label");
    divformInnerNoAddressLabel.className = "form__label";
    divformInnerNoAddressLabel.style.cssText = "margin-left:10px;";
    divformInnerNoAddressLabel.innerHTML = "My address is not listed";

    var divformInnerNoAddressCheckbox = document.createElement('input');
    divformInnerNoAddressCheckbox.type = "checkbox";
    divformInnerNoAddressCheckbox.value = "true";
    divformInnerNoAddressCheckbox.style.cssText = "margin-left:5px;";
    divformInnerNoAddressCheckbox.id = "divformInnerNoAddressCheckbox";

    if ($(hiddenFieldsids.noAddress).val() == "true") {
        divformInnerNoAddressCheckbox.setAttribute('checked', 'checked');
    }

    var br = document.createElement('br');

    var unitLevelApartmentLabel = document.createElement("label");
    unitLevelApartmentLabel.className = "form__label";
    unitLevelApartmentLabel.style.cssText = "margin-left:10px;margin-top:10px";
    unitLevelApartmentLabel.innerHTML = "Unit / Level / Apt / PO Box";

    var streetLabel = document.createElement("label");
    streetLabel.className = "form__label";
    streetLabel.style.cssText = "margin-left:10px;margin-top:10px";
    streetLabel.innerHTML = "Street *";
    streetLabel.htmlFor = "streetLabel";

    var spanTextUnitLevelApt = document.createElement("span");
    spanTextUnitLevelApt.setAttribute("id", "spanTextUnitLevelApt");

    var spanTextStreet = document.createElement("span");
    spanTextStreet.setAttribute("id", "spanTextStreet");
    spanTextStreet.appendChild(streetLabel);
    divformInnerOneNoAddress.appendChild(divformInnerNoAddressCheckbox);
    divformInnerOneNoAddress.appendChild(divformInnerNoAddressLabel);
    divformInnerOneNoAddress.appendChild(br);
    divformInnerOneNoAddress.appendChild(unitLevelApartmentLabel);
    divformInnerOneNoAddress.appendChild(br);
    divformInnerOneNoAddress.appendChild(spanTextUnitLevelApt);
    divformInnerOneNoAddress.appendChild(spanTextStreet);
    divformFieldsNoAddress.appendChild(autocompleteAddress);
    divformFieldsNoAddress.appendChild(divformInnerOneNoAddress);
    divformFieldsNoAddress.appendChild(divformInnerTwoNoAddress);

    $(".form__field--country").first().before(divformFieldsNoAddress);
    $("#subscription_customer_attributes_address_2").detach().appendTo('#spanTextUnitLevelApt');
    $("label[for='subscription_customer_attributes_address_2']").text("");
    $("#" + hiddenFieldsids.streetText).detach().appendTo('.form__section--shipping-information .form__fields--address .form__field--address');
    $("#subscription_customer_attributes_address").detach().appendTo('#spanTextStreet');

    var noBlankStateSpan = document.createElement("span");
    noBlankStateSpan.setAttribute("id", "noBlankStateSpan");
    noBlankStateSpan.className = "error-message";

    var noBlankCitySpan = document.createElement("span");
    noBlankCitySpan.setAttribute("id", "noBlankCitySpan");
    noBlankCitySpan.className = "error-message";

    var noBlankAddressSpan = document.createElement("span");
    noBlankAddressSpan.setAttribute("id", "noBlankAddressSpan");
    noBlankAddressSpan.className = "error-message";

    var noBlankZipSpan = document.createElement("span");
    noBlankZipSpan.setAttribute("id", "noBlankZipSpan");
    noBlankZipSpan.className = "error-message";

    var noBlankAdressSpan = document.createElement("span");
    noBlankAdressSpan.setAttribute("id", "noBlankAdressSpan");
    noBlankAdressSpan.className = "error-message";
    $(".form__section--shipping-information .form__fields--address .form__field--address").append(noBlankAddressSpan);
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--state").append(noBlankStateSpan);
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--city").append(noBlankCitySpan);
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--zip").append(noBlankZipSpan);
    $("#spanTextStreet").append(noBlankAdressSpan);
}

//enable disable fields in form//
function activeDeactive(isActive) {
    for (var component in chargifyForm) {
        $("#" + chargifyForm[component]).prop('disabled', isActive);
    }
    $("#subscription_customer_attributes_address").prop('disabled', isActive);
}

//Clean fields in form//
function cleanFields() {
    for (var component in chargifyForm) {
        $("#" + chargifyForm[component]).val("");
    }
    $("#subscription_customer_attributes_address").val("");
    $("#" + hiddenFieldsids.streetText).val("");
}

//Manage the form fileds in common with no address checkbox selection//
function noAddressCheckboxChange() {
    $('#divformInnerNoAddressCheckbox').change(function () {
        if ($('#divformInnerNoAddressCheckbox').is(':checked')) {
            $(hiddenFieldsids.noAddress).val("true");
            activeDeactive(false);
        }
        else {
            $(hiddenFieldsids.noAddress).val("false");
            activeDeactive(true);
        }
        cleanErrors();
        cleanFields();
    });
}

function cleanErrors() {
    $(".form__section--shipping-information .form__fields--address .form__field--address").removeClass("has-error");
    $("#noBlankAddressSpan").text("");
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--state").removeClass("has-error");
    $("#noBlankStateSpan").text("");
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--city").removeClass("has-error");
    $("#noBlankCitySpan").text("");
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--zip").removeClass("has-error");
    $("#noBlankZipSpan").text("");
    $("#spanTextStreet").removeClass("has-error");
    $("#noBlankAdressSpan").text("");
}

function validateEmptyAddress() {
    $(".form__section--shipping-information .form__fields--address .form__field--address").addClass("has-error");
    $("#noBlankAddressSpan").text("cannot be blank");
    $('html, body').animate({
        scrollTop: $("#subscription_customer_attributes_organization").offset().top
    }, 1000);
}
//In case of empty fields validation actions//
function validateEmptyFields() {
    if ($("#subscription_customer_attributes_state option:selected").text() == "Please select") {
        $(".form__section--shipping-information .form__fields--city-state-zip .form__field--state").addClass("has-error");
        $("#noBlankStateSpan").text("cannot be blank");
    } else {
        $(".form__section--shipping-information .form__fields--city-state-zip .form__field--state").removeClass("has-error");
        $("#noBlankStateSpan").text("");
    }

    if ($.trim($("#subscription_customer_attributes_city").val()) == "") {
        $(".form__section--shipping-information .form__fields--city-state-zip .form__field--city").addClass("has-error");
        $("#noBlankCitySpan").text("cannot be blank");
    } else {
        $(".form__section--shipping-information .form__fields--city-state-zip .form__field--city").removeClass("has-error");
        $("#noBlankCitySpan").text("");
    }

    if ($.trim($("#subscription_customer_attributes_zip").val()) == "") {
        $(".form__section--shipping-information .form__fields--city-state-zip .form__field--zip").addClass("has-error");
        $("#noBlankZipSpan").text("cannot be blank");
    } else {
        $(".form__section--shipping-information .form__fields--city-state-zip .form__field--zip").removeClass("has-error");
        $("#noBlankZipSpan").text("");
    }

    if ($.trim($("#subscription_customer_attributes_address").val()) == "") {
        $("#spanTextStreet").addClass("has-error");
        $("#noBlankAdressSpan").text("cannot be blank");
    } else {
        $("#spanTextStreet").removeClass("has-error");
        $("#noBlankAdressSpan").text("");
    }
}

//In case of no address validation check before submit the form and validate//
function checkBeforeSubmitForm() {
    $("#signup_form").submit(function (e) {
        e.preventDefault();
        var self = this;
        if ($(hiddenFieldsids.noAddress).val() == "true") {
            var billingCity = $('#subscription_customer_attributes_city').val();
            var billingZipCode = $('#subscription_customer_attributes_zip').val();
            var state = $('#subscription_customer_attributes_state').val();
            var valid = false;
            var data = state + "," + billingZipCode;

            validateEmptyFields();
            if ($("#subscription_customer_attributes_state option:selected").text() == "Please select" || $.trim($("#subscription_customer_attributes_city").val()) == "" || $.trim($("#subscription_customer_attributes_zip").val()) == "" || $.trim($("#subscription_customer_attributes_address").val()) == "") {
                failForm();
                $('html, body').animate({
                    scrollTop: $("#subscription_customer_attributes_organization").offset().top
                }, 1000);
                return false;
            }
            //validation code//
            $.ajax({
                type: "GET",
                url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + data + '&key=' + GOOGLE_API_KEY,
                data: {},
                cache: false
            }).done(function (res) {
                if (res.status == "OK") {
                    var localCity = "";
                    var postedCode = parseInt($("#subscription_customer_attributes_zip").val());
                    postCodeValidaion[$("#subscription_customer_attributes_state").val()].forEach(function (postalRange) {
                        if (postedCode >= postalRange.from && postedCode <= postalRange.to) {
                            res.results[0].address_components.forEach(function (doc) {
                                if (res.results[0].hasOwnProperty("postcode_localities")) {
                                    res.results[0].postcode_localities.forEach(function (localCityRes) {
                                        if (localCityRes.toUpperCase() == $("#subscription_customer_attributes_city").val().toUpperCase()) {
                                            localCity = localCityRes;
                                        }
                                    })
                                } else {
                                    if (doc.types.includes("locality")) {
                                        localCity = doc.short_name;
                                    }
                                }
                                if (doc.short_name == "AU" && $("#subscription_customer_attributes_city").val().toUpperCase() == localCity.toUpperCase()) {
                                    valid = true;
                                    //Enable elements to submit values//
                                    activeDeactive(false);
                                    self.submit();
                                }
                            });
                        }
                    });
                    if (valid == false) {
                        failForm();
                        errorRedFailedForm();
                        return false;
                    }
                } else {
                    failForm();
                    errorRedFailedForm();
                    return false;
                }
            }).fail(function () {
                failForm();
                errorRedFailedForm();
                return false;
            });
        } else {
            if ($.trim($("#autocompleteAddress").val()) == "") {
                failForm();
                validateEmptyAddress();
                return false;
            } else {
                activeDeactive(false);
                self.submit();
            }
        }
    });
}

//In case that the form is font valid restore submition button//
function failForm() {
    $("#fa").remove();
    $("#subscription_submit").text("Place My Order");
    $("#subscription_submit").prop("disabled", false);
    $("#subscription_submit").removeClass("form__button--is-submitting");
}

//mark as invalid vields by add errr message and make the boreder and text red//
function errorRedFailedForm() {
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--state").addClass("has-error");
    $("#noBlankStateSpan").text("invalid state");
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--city").addClass("has-error");
    $("#noBlankCitySpan").text("invalid city");
    $(".form__section--shipping-information .form__fields--city-state-zip .form__field--zip").addClass("has-error");
    $("#noBlankZipSpan").text("invalid post code");
    $('html, body').animate({
        scrollTop: $("#subscription_customer_attributes_organization").offset().top
    }, 1000);
}

//Function to disable google autocomplete//
function disableGoogleAutocomplete() {
    if (autocomplete !== undefined) {
        google.maps.event.removeListener(autocompleteListener);
        google.maps.event.clearInstanceListeners(autocomplete);
        $(".pac-container").remove();
    }
}

//Function to enable google autocomplete//
function enableGoogleAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(document.getElementById(hiddenFieldsids.streetText), options);
    autocompleteListener = google.maps.event.addListener(autocomplete, 'place_changed', fillInAddress);
}

//Fill the form with the new data//
function fillInAddress() {
    $("#subscription_customer_attributes_address").val("");
    var place = autocomplete.getPlace();
    for (var component in componentForm) {
        if (component != "administrative_area_level_1") {
            $("#" + chargifyForm[component]).val('');
        }
    }

    for (var componentItem = 0; componentItem < place.address_components.length; componentItem++) {
        var addressType = place.address_components[componentItem].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[componentItem][componentForm[addressType]];
            if (addressType == "administrative_area_level_1") {
                $('#subscription_customer_attributes_state option[value="' + val + '"]').prop('selected', true);
            } else if (addressType == "street_number" || addressType == "route") {
                $("#subscription_customer_attributes_address").val($("#subscription_customer_attributes_address").val() + val + " ");
            } else {
                $("#" + chargifyForm[addressType]).val(val);
            }
        }
    }
}

//In case that the shipping address gonna used also as billing address set the value of unit level pobox text field//
function useSameShippingAddress() {
    $('input[type=radio][name=use_shipping_address]').change(function () {
        if (this.value == "1") {
            $("#subscription_payment_profile_attributes_billing_address_2").val($("#subscription_customer_attributes_address_2").val());
        }
    });
}

//Initation of form//
function initForm() {
    $('#subscription_customer_attributes_country').find('option').remove().end().append('<option selected="selected" value="AU">Australia</option>').val('AU');
    $("label[for='subscription_customer_attributes_zip']").text("Shipping Post Code *");
    $("label[for='subscription_payment_profile_attributes_billing_zip']").text("Billing Post Code *");
    $("label[for='subscription_customer_attributes_address']").text("Start entering your address *");
    $(".form__section--additional-information").hide();
}

$(document).bind("afterSummaryRefresh", function () {
    hideRecurringLineItem();
});

$(document).ready(function () {
    checkBeforeSubmitForm();
    buildNoAddressItems();
    noAddressCheckboxChange();
    useSameShippingAddress()
    initForm();
    initPostage();
    //Chargify doesn't allow to give a scipt with tag so we load and append it to form//
    $.getScript("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places&key=" + GOOGLE_API_KEY, function (data, textStatus, jqxhr) {
        enableGoogleAutocomplete();
    });
});

//When everything is ready active or deactive form fields in common with the behaviour of form//
$(window).load(function () {
    if ($.trim($("#subscription_customer_attributes_city").val()) != "") {
        $("#autocompleteAddress").val($.trim($("#subscription_customer_attributes_address").val()) + ", " + $("#subscription_customer_attributes_city").val() + ", " + $("#subscription_customer_attributes_state option:selected").text() + ", " + $("#subscription_customer_attributes_country option:selected").text());
    }
    if ($(hiddenFieldsids.noAddress).val() == "true") {
        activeDeactive(false);
    } else {
        activeDeactive(true);
    }
});
