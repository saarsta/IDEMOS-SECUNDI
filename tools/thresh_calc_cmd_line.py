from optparse import OptionParser

from thresh_calc import ThresholdCalc

def parse_command_line():
    parser = OptionParser()
    parser.add_option("-v", "--num-voters", type="int", dest="num_voters", help="number of voters (1 to 1000)")
    parser.add_option("-r", "--rating", type="float", dest="rating", help="average rating (0 to 10)")
    
    (options, args) = parser.parse_args()
    
    if len(args) != 0:
        parser.print_help()
        print 'Error: Unexpected argument:', args[0]
        exit(1)
    
    if options.num_voters is None:
        parser.print_help()
        print 'Error: You must provide number of voters'
        exit(1)
    
    if options.rating is None:
        parser.print_help()
        print 'Error: You must provide average rating'
        exit(1)
    
    print 'Number of voters:', options.num_voters
    print 'Average rating:', options.rating
    
    return options, args


if __name__ == '__main__':
    options, _args = parse_command_line()
    
    tc = ThresholdCalc()
    thresh = tc.calc(options.num_voters, options.rating)
    print 'Required votes required in order to change:', thresh
  
    
