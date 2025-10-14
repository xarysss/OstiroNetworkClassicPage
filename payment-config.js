// Payment configuration (do NOT commit real secrets)
// Replace placeholders with your real publishable keys and IDs

window.PAYMENT_CONFIG = {
    STRIPE_PUBLISHABLE_KEY: "pk_live_51SI9Cr2OeXC7UDnUMikWLzNxsv9rpdEdfsQzUPxWufkkG0ikmcECZr7VSeWwIdUIFU7MhEMgsyRYotKbiQclg3FV00URS8Me1u",
    // Map your service handles to Stripe Price IDs
    STRIPE_PRICES: {
        site_vitrine: "price_xxx_site_vitrine_400",
        site_hebergement: "price_xxx_site_hebergement_500",
        hebergement_support: "price_xxx_hebergement_support",
    },
    // PayPal
    PAYPAL_CLIENT_ID: "BAAtiqVZ1B9LV5L4MutDeFXLuzIbytIIhsdhcjCItd3LF7i_NArgudkuf3Pq2uetNitqoA90xlP5lSH5U4",
    PAYPAL_HOSTED_BUTTON_ID: "3HFFE75LH2LBS",
    PAYPAL_HOSTED_BUTTON_ID_NO_HOSTING: "TWF4DWMJETCMS",
    CURRENCY: "EUR"
};


