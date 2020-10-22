const colors = require('colors')

// Increment Positive Count
const incrementPositiveCount = function (str) {

    str = validatePattern(str)
    value = str.replace(/(Positive: )(\d+)/ig, function ($0, $1, $2) {
        return $1 + (parseInt($2) + 1);
    })
    return value
}

// Increment Neutral Count
const incrementNeutralCount = function (str) {
    validatePattern(str)
    value = str.replace(/(Neutral: )(\d+)/ig, function ($0, $1, $2) {
        return $1 + (parseInt($2) + 1);
    })
    return value
}

// Increment Negative Count
const incrementNegativeCount = function (str) {
    validatePattern(str)
    value = str.replace(/(Negative: )(\d+)/ig, function ($0, $1, $2) {
        return $1 + (parseInt($2) + 1);
    })
    return value
}

const validatePattern = function (str) {
    console.log((`validating pattern: `.magenta) + str.grey)

    const regexPattern = /^Positive: [0-9]*$/



    if (regexPattern.test(str)) { // If old pattern
        console.log('old flair pattern detected... applying the new format...'.grey)
        return str + " Neutral: 0 Negative: 0"
    } else { // If new pattern
        return str


    }

}



module.exports = {
    incrementPositiveCount: incrementPositiveCount,
    incrementNegativeCount: incrementNegativeCount,
    incrementNeutralCount: incrementNeutralCount,
    validatePattern: validatePattern
}
