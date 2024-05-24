/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'prod', 'local').default('local'),
  ORDER_SERVICE_APPNAME: Joi.string().default('order-service'),
  ORDER_SERVICE_PORT: Joi.number().default(4000),
  ORDER_NTH_ORDER_DISCOUNT_COUNT: Joi.number().default(2),
  ORDER_NTH_ORDER_COUPON_VALUE: Joi.number().default(10),
});
