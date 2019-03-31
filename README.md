##Why would I use this?
If you want to optimize a continuous function, for example:
```javascript
function bakeACake(amountOfSugar, amountOfFlour, bakeTemperature, bakeTime, ...etc) {
    // OTHER CODE HERE
    return deliciousnessOfCake
}
```
Then this library can help you out

##How Do I use this?
See the example.js file

##How does this work?
This is an evolutionary algorithm, it tests values, and generation by generation it gets better.
Given a fitness function, like bakeACake().
Imagine that all of the possible values/inputs for the function are a vector space; each argument is an axis.
One particular set of inputs is a point in that space.
This algorithm creates 'kings' that exist are a point in the space.
Then based on how good the kings are (the fitness function), they get citizens, which are random nearby points.
All the citizens and kings are then compared, the best are chosen as kings.
That is 1 iteration. After many iterations, the different kings will have climbed to the top of any local hills.
There's also an important feature: Kings don't like eachother. They're rewarded for being far apart.
This is what helps the hill climber not get stuck in local optimums.