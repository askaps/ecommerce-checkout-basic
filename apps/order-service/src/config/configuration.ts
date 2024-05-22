export default () => ({
  env: process.env.NODE_ENV,
  appName: process.env.ORDER_SERVICE_APPNAME,
  port: parseInt(process.env.ORDER_SERVICE_PORT),
  nthOrderDiscountCount: parseInt(process.env.ORDER_NTH_ORDER_DISCOUNT_COUNT),
  nthOrderCouponValue: parseInt(process.env.ORDER_NTH_ORDER_COUPON_VALUE),
});
