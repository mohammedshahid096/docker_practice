// Assert Queue
export const queueNames = {
  mailQueue: "mail_queue",
  subscribeUsersMailQueue: "subscribed_users_mail_queue",
  orderQueue: "order_queue",
  paymentQueue: "payment_queue",
};

export const queueExchange = {
  mailExchange: "mail_exchange",
  notificationExchangeTopic: "notification_exchange",

  newProductLaunchFanout: "new_product_launch",
};

export const queueRouting = {
  mailKey: "mail_routing_key",
  subscribeUserMailKey: "subscribe_user_mail_routing_key",
};
