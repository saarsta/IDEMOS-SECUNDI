var common = require('../api/common')

var calculating_thresh = exports.calculating_thresh = function (num_voters , rating) {

// minimum number of voters
   var MIN_NUM_VOTERS = 1;

// maximum number of voters
    var MAX_NUM_VOTERS = common.getThresholdCalcVariables('MAX_NUM_VOTERS') || 1000;

// minimum rating
    var MIN_RATING = 0;

// maximum rating
    var MAX_RATING = 10;

// expected threshold for minimum rating and maximum number of voters

    console.log("threshold variables!!!!!!!!!!!!!!!!!!!!!!");
    console.log(common.getThresholdCalcVariables('MIN_THRESH'));
    console.log(common.getThresholdCalcVariables('MAX_THRESH'));
    console.log(common.getThresholdCalcVariables('MAX_RED_RATIO'));
    console.log(common.getThresholdCalcVariables('MAX_RED_RATIO'));
    var MIN_THRESH = common.getThresholdCalcVariables('MIN_THRESH') || 2;

// expected threshold for maximum rating and maximum number of voters
    var MAX_THRESH = common.getThresholdCalcVariables('MAX_THRESH') || 500;

// maximum reduction ratio (for minimum number of voters)
    var MAX_RED_RATIO = common.getThresholdCalcVariables('MAX_RED_RATIO') || 2;

// in advance calculation
    var MIDDLE_THRESH = Math.pow((MAX_THRESH / MIN_THRESH), 0.5) * MIN_THRESH;
    var BASE = Math.pow((MAX_THRESH / MIN_THRESH), (1.0 / (MAX_RATING - MIN_RATING)));
    var MUL = MIN_THRESH / Math.pow(BASE, MIN_RATING);
    var RED_Q = Math.pow(MAX_RED_RATIO, (1.0 / Math.log(MAX_NUM_VOTERS / MIN_NUM_VOTERS))); //# voters reduction ratio

//def __init__(self):
//print 'MIDDLE_THRESH:', self.MIDDLE_THRESH
//print 'BASE:', self.BASE
//print 'MUL:', self.MUL
//print 'RED_Q:', self.RED_Q

//@classmethod

//def clamp(cls, num, low, high):
//return min(max(num, low), high)

var clamp = function (num, low, high) {
    return  Math.min(Math.max(num, low), high)
}

//def calc(self, num_voters, rating):
//num_voters = self.clamp(num_voters, self.MIN_NUM_VOTERS, self.MAX_NUM_VOTERS)
//rating = self.clamp(rating, self.MIN_RATING, self.MAX_RATING)
//print 'num_voters:', num_voters
//print 'rating:', rating



var calc = function (num_voters/*, rating*/) {
    num_voters = clamp(num_voters, MIN_NUM_VOTERS, MAX_NUM_VOTERS);
    rating = clamp(/*rating,*/ MIN_RATING, MAX_RATING);
}

//# calculate exponent divisor
//div = self.RED_Q ** math.log(self.MAX_NUM_VOTERS / num_voters)
//print 'exponent divisor:', div

// calculate exponent divisor
    var div = Math.pow(RED_Q, Math.log(MAX_NUM_VOTERS / num_voters));
//print 'exponent divisor:', div

//# calculate increment
//med_rating = (self.MIN_RATING + self.MAX_RATING) / 2.0
//inc = self.MIDDLE_THRESH - (self.BASE ** (med_rating / div)) * self.MUL
//print 'increment:', inc

// calculate increment
    var med_rating = (MIN_RATING + MAX_RATING) / 2.0
    var inc = MIDDLE_THRESH - ((Math.pow(BASE, (med_rating / div))) * MUL);


//# calculate threshold
//thresh = (self.BASE ** (rating / div)) * self.MUL + inc
//print 'threshold:', thresh

// calculate threshold
var thresh = Math.pow(BASE, (rating / div)) * MUL + inc;


//#  round up
//thresh = int(math.ceil(thresh))

//  round up
    thresh = Math.ceil(thresh);

//# clamp
//thresh = self.clamp(thresh, self.MIN_THRESH, self.MAX_THRESH)

// clamp
thresh = clamp(thresh, MIN_THRESH, MAX_THRESH);


return thresh
}
