// Create global namespace for mybtcprice
if (!window.mybtcprice) {
  window.mybtcprice = {};
}

$(document).ready(function() {
  var rate = 0;

  function getPrice() {
    $.ajax({
      url: "https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD", success: function(result) {
      if (result && result.last) {
        rate = result.last;
        var myTime = new Date(result.timestamp * 1000);
        $('#time').text(myTime);
        $("#price-label").text(rate);
        $('#refresh').text('Refresh');
        calculate();
      } else {
        console.error('ajax error');
      }
    }});
  }

  // Reload price on clicking "Refresh"
  $( "#refresh" ).click(function() {
    $('#refresh').text('Refreshing');
    $('#time').text('Refreshing time');
    getPrice();
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
    getPrice();
  }

  // Calculate other fields based on the "change" parameter.
  // "change" is the name of the field which has changed.
  function calculate(change) {
    var buy_amount_USD = Number($("input[name='buy_amount_USD']").val());
    var buy_amount_BTC = Number($("input[name='buy_amount_BTC']").val());
    var buy_amount_mBTC = Number($("input[name='buy_amount_mBTC']").val());
    var total_USD = Number($("input[name='total_USD']").val());
    var commission = Number($("input[name='commission']").val());

    // If the user knows how much BTC they want.
    if (change === 'buy_amount_BTC') {
      // buy_amount_BTC * rate
      buy_amount_USD = precision(buy_amount_BTC * rate, 2);
    }
    if (change === 'buy_amount_mBTC') {
      // (buy_amount_mBTC / 1000) * rate
      buy_amount_USD = precision((buy_amount_mBTC / 1000) * rate, 2);
    }

    if (change !== 'total_USD') {
      // buy_amount_USD * (1 + commission / 100)
      total_USD = nearest(buy_amount_USD / (1 - (commission / 100.00)), 1);
      total_USD = (total_USD <= buy_amount_USD && buy_amount_USD !== 0) ? total_USD + 5 : total_USD;
      $("input[name='total_USD']").val(total_USD);
    }
    if (change !== 'buy_amount_USD') {
      // total_USD / (1 + commission / 100)
      buy_amount_USD = nearest(total_USD * (1 - (commission / 100.00)), 1);
      $("input[name='buy_amount_USD']").val(buy_amount_USD);
    }
    if (change !== 'buy_amount_BTC' && change !== 'buy_amount_mBTC') {
      // rate / buy_amount_USD
      buy_amount_BTC = precision(buy_amount_USD / rate, 8);
      $("input[name='buy_amount_BTC']").val(buy_amount_BTC);
    }
    if (change !== 'buy_amount_BTC' && change === 'buy_amount_mBTC') {
      // buy_amount_mBTC / 1000
      buy_amount_BTC = precision(buy_amount_mBTC / 1000, 8);
      $("input[name='buy_amount_BTC']").val(buy_amount_BTC);
    }
    if (change !== 'buy_amount_mBTC') {
      // buy_amount_BTC * 1000
      buy_amount_mBTC = precision(buy_amount_BTC * 1000, 8);
      $("input[name='buy_amount_mBTC']").val(buy_amount_mBTC);
    }

    // total_USD - buy_amount_USD
    $('#fee_total').text(total_USD - buy_amount_USD);
  }

  init();
});
