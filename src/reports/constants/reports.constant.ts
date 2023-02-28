export const REPORT_HEADER = {
  ORDER_GENERAL: [
    'id',
    'restaurantName',
    'restaurantNameAr',
    'status',
    'createdAt',
    'orderType',
    'tableName',
    'tableNameAr',
    'paymentStatus',
    'paymentMethod',
    'couponCode',
    'totalOrderAmount',
    'refundAmount',
    'customerName',
    'customerEmail',
    'customerPhoneNumber',
  ],
  ORDER_USER: [
    'restaurantName',
    'restaurantNameAr',
    'customerName',
    'customerPhoneNumber',
    'orderType',
    'visitCount',
    'lastVisitDate',
  ],
  ORDER_LIVE_CYCLE: [
    'restaurantName',
    'restaurantNameAr',
    'status',
    'createdAt',
    'updatedAt',
    'orderId',
    'timeToOrder',
    'fromOrderToKitchen',
    'fromKitchenToOrderReady',
    'fromOrderReadyToClose',
    'fromScanToClose',
    'fromOrderToClose',
  ],
  RESERVATIONS: [
    'restaurantName',
    'restaurantNameAr',
    'customerName',
    'customerPhoneNumber',
    'isCancelled',
    'totalMembers',
    'date',
  ],
  ORDER_KITCHEN: [
    'chef',
    'status',
    'createdAt',
    'orderType',
    'orderId',
    'timeToStartPrepare',
    'timeFromPrepareToReady',
  ],
};

export const ONE_MINUTE = 60000;
