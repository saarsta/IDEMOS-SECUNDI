import math

class ThresholdCalc:

    # minimum number of voters
    MIN_NUM_VOTERS = 1
    # maximum number of voters
    MAX_NUM_VOTERS = 1000
    
    # minimum rating
    MIN_RATING = 0
    # maximum rating
    MAX_RATING = 10
    
    # expected threshold for minimum rating and maximum number of voters
    MIN_THRESH = 2
    # expected threshold for maximum rating and maximum number of voters
    MAX_THRESH = 500

    # maximum reduction ratio (for minimum number of voters)
    MAX_RED_RATIO = 2

    # in advance calculation
    MIDDLE_THRESH = (MAX_THRESH / MIN_THRESH) ** 0.5 * MIN_THRESH
    BASE = (MAX_THRESH / MIN_THRESH) ** (1.0 / (MAX_RATING - MIN_RATING))
    MUL = MIN_THRESH / BASE ** MIN_RATING
    RED_Q = MAX_RED_RATIO ** (1.0 / math.log(MAX_NUM_VOTERS / MIN_NUM_VOTERS)) # voters reduction ratio
    
    def __init__(self):
        print 'MIDDLE_THRESH:', self.MIDDLE_THRESH
        print 'BASE:', self.BASE
        print 'MUL:', self.MUL
        print 'RED_Q:', self.RED_Q
    
    @classmethod
    def clamp(cls, num, low, high):
        return min(max(num, low), high)
    
    def calc(self, num_voters, rating):
        num_voters = self.clamp(num_voters, self.MIN_NUM_VOTERS, self.MAX_NUM_VOTERS)
        rating = self.clamp(rating, self.MIN_RATING, self.MAX_RATING)
        print 'num_voters:', num_voters
        print 'rating:', rating
        
        # calculate exponent divisor
        div = self.RED_Q ** math.log(self.MAX_NUM_VOTERS / num_voters)
        print 'exponent divisor:', div
        
        # calculate increment
        med_rating = (self.MIN_RATING + self.MAX_RATING) / 2.0
        inc = self.MIDDLE_THRESH - (self.BASE ** (med_rating / div)) * self.MUL
        print 'increment:', inc
        
        # calculate threshold
        thresh = (self.BASE ** (rating / div)) * self.MUL + inc
        print 'threshold:', thresh
        
        #  round up
        thresh = int(math.ceil(thresh))
        # clamp
        thresh = self.clamp(thresh, self.MIN_THRESH, self.MAX_THRESH)
        
        return thresh

