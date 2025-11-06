# PayNow.js

The Embeddable PayNow.gg checkout experience!

## Demo Integrations

- [PayNow.js Demo](https://js.paynow.gg/)
- [Limitless Rust Store](https://store.limitlessrust.com/)
- [PayNow Headless Template](https://headless-template.paynow.gg/)

## Installation
```bash
# npm
npm install @paynow-gg/paynow.js

# yarn
yarn add @paynow-gg/paynow.js

# pnpm
pnpm add @paynow-gg/paynow.js
```

## Usage

### HTML/Browser
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.paynow.gg/paynow-js/bundle.js"></script>
</head>
<body>
  <button id="pay-button">Pay Now</button>

  <script>
    document.getElementById('pay-button').addEventListener('click', function() {
      PayNow.checkout.on("completed", (event) => {
        console.log("Payment successful!", event);
        
        // Close the checkout before redirecting
        PayNow.checkout.close();
        
        // Redirect to success page or update UI
        window.location.href = `/success?orderId=${event.orderId}`;
      });

      PayNow.checkout.on("ready", () => {
        console.log("Checkout loaded and ready");
      });

      PayNow.checkout.on("closed", () => {
        console.log("User closed the checkout");
      });

      PayNow.checkout.open({
        token: "your-checkout-token"
      });
    });
  </script>
</body>
</html>
```

### ES Modules
```typescript
import PayNow from "@paynow-gg/paynow.js"

PayNow.checkout.on("completed", (event) => {
  console.log("Payment successful!", event);
  
  // Close the checkout before redirecting
  PayNow.checkout.close();
  
  // Redirect to success page or update UI
  window.location.href = `/success?orderId=${event.orderId}`;
});

PayNow.checkout.on("ready", () => {
  console.log("Checkout loaded and ready");
});

PayNow.checkout.on("closed", () => {
  console.log("User closed the checkout");
});

PayNow.checkout.open({
  token: "your-token-here"
});
```

## PayNow.gg Support

For support, questions, or more information, join our Discord community:

- [Discord](https://discord.com/invite/paynow)

## Contributing

Contributions are welcome! If you would like to improve PayNow.js or suggest new features, please fork the repository, make your changes, and submit a pull request.