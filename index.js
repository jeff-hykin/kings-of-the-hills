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
    fromCitizen(citizen) {
        this.features = citizen.features
        this.fitness = citizen.fitness
        this.relativeFitness = citizen.relativeFitness
    }
}

// TODO
    // instead of complete randomness
        // look at the top __ number of citizens 
        // extrapolate a good direction and good step size from those steps
        // then use that as a baseline for a normal-random numbers in that direction
    // allow forking by choosing successor kings
        // pick the best overall citizen
        // then continually pick new kings, and measure the distance from all already-chosen kings


let kingsOfTheHills
kingsOfTheHills = {
    fitnessFunction: (a,b,c) => a*b - b*c + c*a*b,
    numberOfCitizens: 100,
    deviationVector: [ 1, 1, 1 ], // one number for each argument in the fitness function
    generateInitialKings: () => {
        let numberOfKings = 5
        let kings = []
        for (let each in [...Array(numberOfKings)] ) {
            let newKing = new King
            // generate a random number for each feature
            for (let each in [...Array(kingsOfTheHills.fitnessFunction.length)] ) {
                newKing.features.push(Math.random() * kingsOfTheHills.deviationVector[each])
            }
            kings.push(newKing)
        }
        return kings
    },
    distanceFunction: (citizen1, citizen2) => {
        // normally would do the actual diagonal distance (ex: sqrt( (x1 - x2)^2 + (y1 - y2)^2) )
        // but instead this one is cheating and just doing x1-x2, y1-y2
        // also ideally the function would also be nonlinear, with large distances being more rewarding than small differences (heavily penalize small distances)
        let eachFeature = -1
        let distance = 0
        for (let each of citizen1.features) {
            eachFeature++
            distance += kingsOfTheHills.deviationVector[eachFeature] * Math.abs(citizen1.features[eachFeature] - citizen2.features[eachFeature])
        }
        return distance
    },
    relativeFitnessFunction: (citizen, kings, currentKing) => {
        let distances = []
        for (let eachOtherKing of kings) {
            if (eachOtherKing != currentKing) {
                distances.push(kingsOfTheHills.distanceFunction(citizen, eachOtherKing))
            }
        }
        return citizen.fitness + Math.min(...distances)
    },
    citizenAllocation: (kings) => {
        let allFitness = 0
        for (let each of kings) {
            allFitness += each.fitness
        }
        for (let eachKing of kings) {
            // remove old Citizens
            eachKing.citizens = []
            // add new Citizens
            // this function is not ideal because a really good emporer-king will force all other kings to have only 1 Citizen
            let numberOfCitizens = Math.ceil(kingsOfTheHills.numberOfCitizens * (eachKing.fitness / allFitness))
            for (let each in [...Array(numberOfCitizens)]) {
                eachKing.citizens.push(new Citizen)
            }
        }
    },
    getFitness: (kings) => {
        // change this to be done in parallel since it is almost always the bottleneck of the whole program
        for (let eachKing of kings) {
            eachKing.relativeFitness = kingsOfTheHills.relativeFitnessFunction(eachKing, kings, eachKing)
            for (let eachCitizen of eachKing.citizens) {
                eachCitizen.fitness = kingsOfTheHills.fitnessFunction(...eachCitizen.features)
                eachCitizen.relativeFitness = kingsOfTheHills.relativeFitnessFunction(eachCitizen, kings, eachKing)
            }
        }
    },
    generateCitizenFeatures: (king) => {
        for (let eachCitizen of king.citizens) {
            // create a citizen that is similar to the king
            for (let eachFeature in [...Array(kingsOfTheHills.fitnessFunction.length)]) {
                let randomPositiveOrNegative = (Math.random() - 0.5) * 2
                eachCitizen.features[eachFeature] = king.features[eachFeature] + (kingsOfTheHills.deviationVector[eachFeature] * randomPositiveOrNegative)
            }
        }
    },
    pickNewKings: (kings) => {
        let newKings = []
        for (let eachKing of kings) {
            let newKing = new King
            newKing.fromCitizen(eachKing)
            // pick the best citizen
            for (let eachCitizen of eachKing.citizens) {
                if (eachCitizen.relativeFitness > newKing.relativeFitness) {
                    newKing.fromCitizen(eachCitizen)
                }
            }
            newKings.push(newKing)
        }
        return newKings
    },
    run: (numberOfIterations) => {
        let kings = kingsOfTheHills.generateInitialKings()
        while (numberOfIterations--) {
            // get the fitness
            kingsOfTheHills.getFitness(kings)
            // pick the new kings
            kings = kingsOfTheHills.pickNewKings(kings)
            // allocate citizens
            kingsOfTheHills.citizenAllocation(kings)
            // generate deriviative features
            for (let each of kings) {
                kingsOfTheHills.generateCitizenFeatures(each)
            }
        }
        return kings
    }
}

result = kingsOfTheHills.run(8)
for (let eachKing of result) {
    console.log(`features is:`,eachKing.features, ` fitness = ${kingsOfTheHills.fitnessFunction(...eachKing.features)}, ${eachKing.citizens.length}`)
}