# Battle for Riddler

## Problem statement:

> In a distant, war-torn land, there are 10 castles. There are two warlords: you and your archenemy. Each castle has its own strategic value for a would-be conqueror. Specifically, the castles are worth 1, 2, 3, …, 9, and 10 victory points. You and your enemy each have 100 soldiers to distribute, any way you like, to fight at any of the 10 castles. Whoever sends more soldiers to a given castle conquers that castle and wins its victory points. If you each send the same number of troops, you split the points. You don’t know what distribution of forces your enemy has chosen until the battles begin. Whoever wins the most points wins the war.
>
> Submit a plan distributing your 100 soldiers among the 10 castles. Once I receive all your battle plans, I’ll adjudicate all the possible one-on-one matchups. Whoever wins the most wars wins the battle royale and is crowned king or queen of Riddler Nation!

Source: https://fivethirtyeight.com/features/can-you-rule-riddler-nation/

Other source: https://ntguardian.wordpress.com/2017/05/29/winning-the-battle-for-riddler-nation-an-agent-based-modelling-approach/

This problem received multiple solutions available [here](https://github.com/dubzzz/various-data-analysis/blob/master/battle-for-riddler/dataset.js).
The best submitted solution was: ```3, 5, 8, 10, 13, 1, 26, 30, 2, 2```.

## Suggested approaches:

### Methods:

- Genetic algorithms
- Gradient descent

### Heuristic to measure quality of the solution:

- Count the exact number of combinations defeated the selected one (the lesser, the better) -- converging towards ```0, 0, 3, 7, 10, 12, 14, 16, 18, 20```
- Run all the plays of a strategy against a fixed panel of combinations (the higher the number of points, the better)
- Combination of above measures
- Funny mathematics equations: sum over castle index i [1 -> 10] { sqrt(units at i) * i } -- converging towards ```1, 1, 2, 4, 6, 9, 13, 17, 21, 26```


### Conclusion:

The combination of heuristics and methods above was not really above to defeat other submissions.
It happens that most of the generated strategies perform very well on purely random combinations and poorly on the elements taken from the contest.
Some of the simplest heuristic just perform as well as the most complex (and most of the time even better) on the dataset of the contest.

All trainings have been carried out without using any data coming from the dataset of the contest.

Live example is available at: https://dubzzz.github.io/various-data-analysis/battle-for-riddler/
