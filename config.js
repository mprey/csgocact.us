//config file for csgocact.us
module.exports = {
  exchangeRates: {
    itemBottomThreshold: 0.20, //will not update client-side
    deposit: {
      key: 1.00,
      knife: 0.95,
      rare: 0.95,
      weapon: 0.90,
      misc: 0.85
    },
    withdraw: {
      key: 1.05,
      knife: 1.00,
      rare: 1.00,
      weapon: 0.95,
      misc: 0.90
    }
  },
  coinflip: {
    maxUserHistory: 20,
    maxGlobalHistory: 40,
    leaderboardLength: 5,
    gameTax: 0.05,
    minimumBet: 0.50,
    maximumBet: 400
  },
  chat: {
    recentMessageCap: 50
  },
  deposit: {
    cacheTimeout: 20 * 60, //20 mins
    refreshCooldown: 5 * 60, //5 mins
    cooldownEndpoint: '__cooldown'
  }
}
