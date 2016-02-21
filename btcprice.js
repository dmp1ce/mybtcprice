// Create global namespace for mybtcprice
if (!window.mybtcprice) {
  window.mybtcprice = {};
}

$(document).ready(function() {
  bitcoinprices.init({

    // Where we get bitcoinaverage data
    url: "https://api.bitcoinaverage.com/ticker/all",

    // Which of bitcoinaverages value we use to present prices
    marketRateVariable: "last",

    // Which currencies are in shown to the user
    currencies: ["USD", "BTC"],

    // Special currency symbol artwork
    //symbols: {
    //    "BTC": "<i class='fa fa-btc'>B</i>"
    //},

    // Which currency we show user by the default if
    // no currency is selected
    defaultCurrency: "USD",

    // How the user is able to interact with the prices
    ux : {
        // Make everything with data-btc-price HTML attribute clickable
        clickPrices : true,

        // Build Bootstrap dropdown menu for currency switching
        menu : true,

        // Allow user to cycle through currency choices in currency:
        clickableCurrencySymbol:  true
    },

    // Allows passing the explicit jQuery version to bitcoinprices.
    // This is useful if you are using modular javascript (AMD/UMD/require()),
    // but for most normal usage you don't need this
    jQuery: jQuery,

    // Price source data attribute
    priceAttribute: "data-btc-price",

    // Price source currency for data-btc-price attribute.
    // E.g. if your shop prices are in USD
    // but converted to BTC when you do Bitcoin
    // checkout, put USD here.
    priceOrignalCurrency: "BTC"
  });

  // Reload price on clicking "Refresh"
  $( "#refresh" ).click(function() {
    $('#refresh').text('Refreshing');
    $('#time').text('Refreshing time');
    bitcoinprices.loadData();
  });

  // What happens when the price is updated?
  $(document).bind("marketdataavailable", function() {
    myTime = new Date(bitcoinprices.data.timestamp);
    $('#time').text(myTime);
    $('#refresh').text('Refresh');
    calculate();
  });

  // Trigger calculation on text change.
  $( "input" ).change(function() {
    calculate(this.name);
  });
  $( "input" ).on('input', function() {
    calculate(this.name);
  });

  // Rounding value to the nearest x
  function nearest(n, v) {
    n = n / v;
    n = Math.round(n) * v;
    return n;
  }
  // Rounding value to the x decimal
  function precision(n, dp) {
    dp = Math.pow(10, dp);
    n = n * dp;
    n = Math.round(n);
    n = n / dp;
    return n;
  }

  function init() {
    // Set the commission
    $("input[name='commission']").val(mybtcprice.commission);
    $("input[name='commission']").prop('disabled', mybtcprice.commission_locked);
  }

  // Calculate other fields based on the "change" parameter.
  // "change" is the name of the field which has changed.
  function calculate(change) {
    buy_amount_USD = Number($("input[name='buy_amount_USD']").val());
    buy_amount_BTC = Number($("input[name='buy_amount_BTC']").val());
    buy_amount_mBTC = Number($("input[name='buy_amount_mBTC']").val());
    total_USD = Number($("input[name='total_USD']").val());
    commission = Number($("input[name='commission']").val());
    rate = bitcoinprices.data.USD.last;

    // If the user knows how much BTC they want.
    if (change == 'buy_amount_BTC') {
      // buy_amount_BTC * rate
      buy_amount_USD = precision(buy_amount_BTC * rate, 2);
    }
    if (change == 'buy_amount_mBTC') {
      // (buy_amount_mBTC / 1000) * rate
      buy_amount_USD = precision((buy_amount_mBTC / 1000) * rate, 2);
    }

    if (change != 'total_USD') {
      // buy_amount_USD * (1 + commission / 100)
      total_USD = nearest(buy_amount_USD / (1 - (commission / 100.00)), 1);
      total_USD = (total_USD <= buy_amount_USD && buy_amount_USD !== 0) ? total_USD + 5 : total_USD;
      $("input[name='total_USD']").val(total_USD);
    }
    if (change != 'buy_amount_USD') {
      // total_USD / (1 + commission / 100)
      buy_amount_USD = nearest(total_USD * (1 - (commission / 100.00)), 1);
      $("input[name='buy_amount_USD']").val(buy_amount_USD);
    }
    if (change != 'buy_amount_BTC' && change != 'buy_amount_mBTC') {
      // rate / buy_amount_USD
      buy_amount_BTC = precision(buy_amount_USD / rate, 8);
      $("input[name='buy_amount_BTC']").val(buy_amount_BTC);
    }
    if (change != 'buy_amount_BTC' && change == 'buy_amount_mBTC') {
      // buy_amount_mBTC / 1000
      buy_amount_BTC = precision(buy_amount_mBTC / 1000, 8);
      $("input[name='buy_amount_BTC']").val(buy_amount_BTC);
    }
    if (change != 'buy_amount_mBTC') {
      // buy_amount_BTC * 1000
      buy_amount_mBTC = precision(buy_amount_BTC * 1000, 8);
      $("input[name='buy_amount_mBTC']").val(buy_amount_mBTC);
    }

    // total_USD - buy_amount_USD
    $('#fee_total').text(total_USD - buy_amount_USD);
  }

  init();
});
