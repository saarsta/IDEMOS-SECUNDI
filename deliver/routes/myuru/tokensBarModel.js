var TokensBarModel =function (tokenPixels, numExtraTokens, tokens, proxies) {
       var HIGH_BAR_VALUE=15;
       var USER_DAILY_TOKENS=9;


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
                if(proc.details){
                    proxy.proxies.push(  {
                        name:proc.details.first_name+' '+ proc.details.last_name,
                        proxy:proc.number_of_tokens,
                        _id: proc.details._id ,
                      //  avatar:proc.details.avatar,
                        avatar:proc.user_id.avatar,
                        score:proc.details.score,
                        first_name:proc.details.first_name

                    })
                }
            }
            return proxy;
        };
        var startOfDayTokens; //blue+green+darkGray

        this.proxy = createProxy(proxies)
        this.totalProxy = calcTotalProxy(proxies)// blue;
        startOfDayTokens= USER_DAILY_TOKENS + numExtraTokens;
    this.tokensIUsed = startOfDayTokens-Math.floor(tokens) ; //dark gray

    this.floorTokens = startOfDayTokens- this.tokensIUsed-this.totalProxy ;//green

       this.gupFromFull =HIGH_BAR_VALUE - startOfDayTokens; //light gray

    //    this.floorTokens =HIGH_BAR_VALUE- this.gupFromFull-     this.tokensIUsed-      this.totalProxy  //green


        this.TokensSum=this.tokensIUsed+ this.floorTokens+ this.totalProxy;//all tokens
    /*   var dailyTokens =tokens;
  this.floorDailyTokens = Math.floor(dailyTokens);*/


      //  this.floorTokens = Math.floor(tokens); //green



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