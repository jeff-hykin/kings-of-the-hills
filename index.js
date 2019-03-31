class Citizen {
    constructor() {
        this.features = []
        this.fitness = 1
        this.relativeFitness = 1
    }
}
class King extends Citizen {
    constructor() {
        super()
        this.citizens = []
    }
}

let sum = (array) => array.reduce((b,e)=>b+e)
let average = (array) =>  sum(array) / (array.length)

let standardDeviation = (array) => {
    let averageDelta = average(array)
    return Math.sqrt(sum(array.map(each => Math.pow(each - averageDelta, 2))))
}

let distance = (citizen1, citizen2) => {
    let differences = []
    for (let each in citizen1.features) {
        differences.push( citizen1.features[each] - citizen2.features[each])
    }
    return Math.sqrt(sum(differences.map(each => each * each)))
}

module.exports = function(args) {
    let helpers
    helpers = {
        emporerKing: { fitness: -Infinity },
        numberOfIterations: 10,
        fitnessFunction: (a,b,c) => Math.abs(a*b - b*c + c*a*b),
        numberOfCitizens: 100, // this number is compeletly arbitrary
        scaleFeatures: null, // an array, a number for each argument in the fitness function
        generateInitialKings: () => {
            // this function just needs to return an array of kings (greater than 1)
            // you can also initilize the kings's features (the arguments for the fitnessFunction) 
            // to a good starting point to jumpstart the process

            let numberOfKingsFactor = 5 // this number is compeletly arbitrary
            // the number of kings is made to scale with the number of 
            let numberOfKings = Math.ceil(Math.sqrt( numberOfKingsFactor * helpers.numberOfFeatures))
            // create the kings
            let kings = [...Array(numberOfKings)].map(_=> new King)
            // create the initial features
            let generateRandomFeatures = () => helpers.scaleFeatures.map(eachFeatureScale => Math.random() * eachFeatureScale )
            kings.forEach(eachKing => eachKing.features = generateRandomFeatures())
            return kings
        },
        setFitnessOfAllCitizens: (kings) => {
            // change this to be done in parallel since it is almost always the bottleneck of the whole program
            for (let eachKing of kings) {
                eachKing.fitness = helpers.fitnessFunction(...eachKing.features)
                for (let eachCitizen of eachKing.citizens) {
                    eachCitizen.fitness = helpers.fitnessFunction(...eachCitizen.features)
                }
            }
        },
        distanceFunction: (citizen1, citizen2) => {
            // normally would do the actual diagonal distance (ex: sqrt( (x1 - x2)^2 + (y1 - y2)^2) )
            // but instead this one is cheating and just doing x1-x2, y1-y2
            // also ideally the function would also be nonlinear, with large distances being more rewarding than small differences (heavily penalize small distances)
            let eachFeature = -1
            let distance = 0
            for (let each of citizen1.features) {
                eachFeature++
                distance += helpers.scaleFeatures[eachFeature] * Math.abs(citizen1.features[eachFeature] - citizen2.features[eachFeature])
            }
            return distance
        },
        relativeFitnessFunction: (citizen, otherKings) => {
            let distances = []
            for (let eachOtherKing of otherKings) {
                distances.push(helpers.distanceFunction(citizen, eachOtherKing))
            }
            let distanceToNearestKing = Math.min(...distances) 
            return citizen.fitness + distanceToNearestKing * distanceToNearestKing
        },
        citizenAllocation: (kings) => {
            // return an array of the number of citizens that should be allocated to each king
            // kings with relatively good fitness should receive more citizens then kings with relatively bad fitness
            let fitnesses, min, max, range, averageDifference, total
            fitnesses = kings.map(eachKing => eachKing.fitness)
            min = Math.min(...fitnesses)
            max = Math.max(...fitnesses)
            range = max - min
            averageDifference = range / fitnesses.length
            fitnesses = fitnesses.map(eachValue => eachValue - min + averageDifference)
            total = sum(fitnesses)
            // if there are no differences
            if (total == 0) {
                return kings.map(_=> helpers.numberOfCitizens / kings.length)
            }
            return fitnesses.map(eachValue => Math.ceil(helpers.numberOfCitizens * (eachValue / total)))
        },
        generateCitizenFeatures: (king) => {
            for (let eachCitizen of king.citizens) {
                // create a citizen that is similar to the king
                for (let eachFeature in [...Array(helpers.numberOfFeatures)]) {
                    let randomPositiveOrNegative = (Math.random() - 0.5) * 2
                    eachCitizen.features[eachFeature] = king.features[eachFeature] + (helpers.scaleFeatures[eachFeature] * randomPositiveOrNegative)
                }
            }
        },
        pickNewKings: (kings) => {
            let newKings = []
            let allCitizens = [...kings]
            for (let eachKing of kings) {
                allCitizens = allCitizens.concat(eachKing.citizens)
            }
            allCitizens = new Set(allCitizens)
            // initilize the kings with the emporerKing
            let emporerKing = { fitness: -Infinity }
            for (let eachCitizen of allCitizens) {
                if (eachCitizen.fitness > emporerKing.fitness) {
                    emporerKing = eachCitizen
                }
            }
            // calculate improvement
            let improvement = emporerKing.fitness - helpers.emporerKing.fitness
            if (helpers.showImprovement) {
                console.log(`improvement is:`,improvement)
            }
            helpers.emporerKing = emporerKing
            newKings.push(emporerKing)
            allCitizens.delete(emporerKing)
            // now continually find the next best kings
            while (newKings.length < kings.length) {
                let newKing = { relativeFitness: -Infinity }
                for (let eachCitizen of allCitizens) {
                    eachCitizen.relativeFitness = helpers.relativeFitnessFunction(eachCitizen, newKings)
                    if (eachCitizen.relativeFitness > newKing.relativeFitness) {
                        newKing = eachCitizen
                    }
                }
                newKings.push(newKing)
                allCitizens.delete(newKing)
            }
            return newKings
        },
        adjustFeatureScale: (kings) => {
            let featureScaler = [...helpers.scaleFeatures].fill([])
            for (let eachKing of kings) {
                for (let eachCitizen of eachKing) {
                    let featureChanges = []
                    for (let eachFeature in eachCitizen) {
                        featureChanges.push(Math.abs(eachCitizen.features[eachFeature] - eachKing.features[eachFeature]))
                    }
                    let totalFeatureChange = sum(featureChanges.map(each => Math.abs(each)))
                    let totalFitnessChange = eachCitizen.fitnesses - eachKing.fitness
                    // each element (delta) is (the change in direction) *  (the change in fitness)
                    let deltas = featureChanges.map(each => each * (Math.abs(each)/ totalFeatureChange) * totalFitnessChange)
                    for (let eachFeature in featureScaler) {
                        eachFeature.push(deltas[eachFeature])
                    }
                }
            }
            for (let eachFeature in featureScaler) {
                let currentScaler = helpers.scaleFeatures[eachFeature]
                // if the standard deviation is high, that means there isnt an agreement on how this feature affects fitness
                // therefore, reduce the step size in this dimension to get a more fine-grain look (until things correlate again)
                let influence = 0.33 // 0.33 is an arbitrary number
                let firstPart = (1-influence) * currentScaler
                let secondPart = influence * currentScaler * (1/standardDeviation(featureScaler[eachFeature]))
                helpers.scaleFeatures[eachFeature] =  firstPart + secondPart
            }
        }
    }
    // overwrite the helpers with any that are provided as arguments
    Object.assign(helpers, args)
    // 
    // run the actual algorithm
    // 
    helpers.numberOfFeatures = helpers.fitnessFunction.length
    // initilize the scaleFeatures if not was given
    helpers.scaleFeatures = Array(helpers.numberOfFeatures).fill(1)
    let kings = helpers.generateInitialKings()
    while (helpers.numberOfIterations--) {
        // get the fitness
        helpers.setFitnessOfAllCitizens(kings)
        // pick the new kings
        kings = helpers.pickNewKings(kings)
        // allocate citizens
        citizenAllocation = helpers.citizenAllocation(kings)
        for (let eachKing in kings) {
            kings[eachKing].citizens = [...Array(citizenAllocation[eachKing])].map(_=> new Citizen)
        }
        // generate deriviative features
        for (let each of kings) {
            helpers.generateCitizenFeatures(each)
        }
    }
    return kings
}