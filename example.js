let KingsOfTheHills = require('./index')

// your function:
    // inputs:
        // all inputs must be numbers
    // outputs:
        // there needs to be only 1 output, it needs to be a number, and bigger=better
function bakeACake(amountOfSugar, amountOfFlour, bakeTemperature, bakeTime) {
    let nonsenseBakingNumber = (bakeTemperature/100)*bakeTime
    let nonsenseOtherNumber = bakeTemperature * amountOfFlour * bakeTime
    let nonsenseOtherOtherNumber = amountOfSugar * amountOfFlour
    return deliciousnessOfCake = Math.abs(nonsenseOtherOtherNumber - nonsenseOtherNumber + nonsenseBakingNumber)
}

// 
// Run the optimizer
// 
let kings = KingsOfTheHills({
    numberOfIterations: 20, // however long you're willing to wait
    fitnessFunction: bakeACake,
})

// 
// Display results
// 
for (let eachKing of kings) {
    console.log(`features is:`,eachKing.features, ` fitness = ${bakeACake(...eachKing.features)}`)
}