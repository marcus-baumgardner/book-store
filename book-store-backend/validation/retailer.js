const mongoose = require('mongoose');
const Joi = require('joi');


const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateNewRetailInput(data) {
    let errors = {};

    //convert empty fields to an empty string so we can use validator functions
    data.storeName = !isEmpty(data.storeName) ? data.storeName : "";
    userName = !isEmpty(data.userName) ? data.userName : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password : "";

    //name checks
    if(Validator.isEmpty(data.storeName)) {
        errors.firstName = "Store Name field is required...";
    }

    if(Validator.isEmpty(data.userName)) {
        errors.lastName = "Username field is required...";
    }

    //email checks
    if(Validator.isEmpty(data.email)) {
        errors.email = "Email field is required...";
    } else if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid...";
    }

    //password checks 
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required...";
    }

    if (Validator.isEmpty(data.password2)) {
        errors.password2 = "Confirm password field is required...";
    }

    if (!Validator.isLength(data.password, {min: 8, max: 32})) {
        errors.password2 = "Password must be at least 6 characters..."
    }

    if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = "Passwords must match";
    }

    return {
        errors,
        isValid: isEmpty (errors)
    };
};