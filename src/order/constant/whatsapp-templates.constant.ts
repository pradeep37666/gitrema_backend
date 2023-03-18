export const OrderNotifications = {
  Pickup: {
    OrderCreateNotification: {
      en: `Dear {{CustomerName}}
           Thank you for your order.
           Your order # {{OrderNumber}}
           we will notify you when your order is ready.`,
      ar: `أهلا  {{CustomerName}}
           استلمنا طلبك رقم # {{OrderNumber}}. وطلبك الان قيد التجهيز.
           سوف نتواصل معك عندما يكون طلبك جاهز للتسليم`,
    },
    OrderReadyNotification: {
      en: `Hi {{CustomerName}}
           Your Order # {{OrderNumber}}
           is now ready for pickup`,
      ar: `أهلا  {{CustomerName}}
           طلبك رقم 1 في كوفي ناريل جاهز للاستلام`,
    },
  },
};
