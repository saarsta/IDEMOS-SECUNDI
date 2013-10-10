var TokensBarModel =function (tokenPixels, numExtraTokens, tokens, proxies) {
       var HIGH_BAR_VALUE=15;
       var USER_DAILY_TOKENS=9;
       var self= this;

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
            var proxy = { proxies:[]}
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
                        avatar:proc.user_id.avatar_url(),
                        score:proc.details.score,
                        first_name:proc.details.first_name

                    })
                }else{
                    if(!proc.user_id)
                        proc.user_id = {};
                    proxy.proxies.push(  {

                        name:proc.user_id.first_name+' '+ proc.user_id.last_name,
                        proxy:proc.number_of_tokens,
                        _id:proc. user_id._id ,
                        //  avatar:proc.details.avatar,
                        avatar: proc.user_id.avatar_url|| proc.user_id.avatar,
                        score:proc.user_id.score,
                        first_name:proc.user_id.first_name,
                        height: (proc.number_of_tokens * tokenPixels) + 'px',
                        num_of_proxies_i_represent:proc.user_id.num_of_proxies_i_represent


                    })
                }
            }
            return proxy;
        };
        var startOfDayTokens; //blue+green+darkGray

    self.proxy =createProxy(proxies)
    self.totalProxy = calcTotalProxy(proxies)// blue;
        startOfDayTokens=USER_DAILY_TOKENS+numExtraTokens;
    self.tokensIUsed = startOfDayTokens-Math.floor(tokens) ; //dark gray

    self.floorTokens = startOfDayTokens- self.tokensIUsed-self.totalProxy ;//green

    self.gupFromFull =HIGH_BAR_VALUE - startOfDayTokens; //light gray

    //    this.floorTokens =HIGH_BAR_VALUE- this.gupFromFull-     this.tokensIUsed-      this.totalProxy  //green


    self.TokensSum=self.tokensIUsed+ self.floorTokens+ self.totalProxy;//all tokens

    self.haveProxy=self.totalProxy !=0;
    self.haveTokensIUsed=self.tokensIUsed!=0;
    self.haveFloorTokens= self.floorTokens>=0;


    self.convertToPixels = function (num) {
            return (num * tokenPixels) + 'px';
        }
    self.gupFromFullPixels = function () { //light gray
            return self.convertToPixels(self.gupFromFull);
        }
    self.dailyTokensPixels = function () { //dark  gray
            return self.convertToPixels(self.tokensIUsed);
        }
    self.tokensPixels = function () { //green
            return self.convertToPixels(self.floorTokens);
        }
    self.ProxyPixels = function () { //blue
            return self.convertToPixels(self.totalProxy);
        }


    }



//module.exports = TokensBarModel;