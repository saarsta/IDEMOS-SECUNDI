var TokensBarModel =function (tokenPixels, numExtraTokens, tokens, proxies) {

        function calcTotalProxy(proxies){
            var sum= 0;
            var proc,i;

            for (i=0; i< proxies.length;i++){
                proc= proxies[i];
               sum = sum+proc.number_of_tokens;
            }
            return sum;
        }

        function createProxy(proxies){
            var proxy={ proxies:[]}
            var i=0;
            var proc;
            for (i=0; i< proxies.length;i++){
                proc= proxies[i];
                proxy.proxies.push(  {
                    name:proc.details.first_name+' '+ proc.details.last_name,
                    proxy:proc.number_of_tokens,
                    _id: proc.details._id ,
                    avatar:proc.details.avatar,
                    score:-1

                })
            }
            return proxy;
        };
        this.proxy=createProxy(proxies)

       // this.proxies = proxies;
        this.totalProxy = calcTotalProxy(proxies)// blue;
        var dailyTokens = 9 + numExtraTokens;
        this.floorDailyTokens = Math.floor(dailyTokens);
      //  this.floorDailyTokens=2;

        this.gupFromFull = 15 - this.floorDailyTokens; //light gray
        this.floorTokens = Math.floor(tokens); //green
        this.tokensIUsed = this.floorDailyTokens - this.floorTokens - this.totalProxy //dark gray


        //  var  availableTokens=this.dailyTokens-this.totalProxy-user.tokens;

        this.convertToPixels = function (num) {
            return (num * tokenPixels) + 'px';
        }
        this.gupFromFullPixels = function () { //light gray
            return this.convertToPixels(this.gupFromFull);
        }
        this.dailyTokensPixels = function () { //dark  gray
            return this.convertToPixels(this.tokensIUsed);
        }
        this.tokensPixels = function () { //green
            return this.convertToPixels(this.floorTokens);
        }
        this.ProxyPixels = function () { //blue
            return this.convertToPixels(this.totalProxy);
        }


    }



module.exports = TokensBarModel;