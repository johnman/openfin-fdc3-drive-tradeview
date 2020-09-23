if (window !== window.top) {
  return;
}
let platform = fin.Platform.getCurrentSync();
console.log("Trading view preload loaded");

let navigate = (view, ticker) => {
  let urlParams = new URLSearchParams(window.location.search);
  let currentSymbol = urlParams.get("symbol");
  if (
    currentSymbol !== undefined &&
    currentSymbol !== null &&
    currentSymbol.length > 0 &&
    currentSymbol.toLowerCase() !== ticker.toLowerCase()
  ) {
    view
      .navigate("https://www.tradingview.com/chart/?symbol=" + ticker)
      .then((x) =>
        console
          .log("Navigated view to ticker: " + ticker)
          .catch((err) =>
            console.log(
              "error navigating view to ticker: " + ticker + " error: " + err
            )
          )
      );
  }
};

let checkCurrentContext = (view) => {
  platform.getWindowContext().then((context) => {
    console.log("Current context: " + JSON.stringify(context));
    if (context !== undefined && context.instrument !== undefined) {
      navigate(view, context.instrument.id.ticker);
    }
  });
};

setTimeout(() => {
  let view = fin.View.getCurrentSync();
  console.log("Got view");

  checkCurrentContext(view);

  view
    .getCurrentWindow()
    .then((win) => {
      console.log("Got window: " + JSON.stringify(win.me));
      win.on("context-changed", (data) => {
        console.log("Received context: " + JSON.stringify(data));
        navigate(view, data.context.instrument.id.ticker);
      });
    })
    .catch((err) => console.log(err));

  view
    .addListener("target-changed", (event) => {
      checkCurrentContext(view);
    })
    .then(() => {
      console.log("Listening to target change");
    })
    .catch((err) => {
      console.log("Error listening to target change.");
    });

  if (window.fin && window.fdc3) {
    window.fdc3.addContextListener(async (ctx) => {
      console.log("Received fdc3 context: " + JSON.stringify(ctx));
      if (
        ctx.type === "fdc3.instrument" &&
        ctx.id !== undefined &&
        ctx.id.ticker !== undefined
      ) {
        navigate(view, ctx.id.ticker);
      }
    });
  } else {
  }
}, 200);
