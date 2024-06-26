# E-commerce Checkout

Microservices based api structure for basic ecommerce cart and checkout with coupons

Live at: https://ecb-microservices-personal-no-organization-48ffca2f.koyeb.app

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/21370371-6d2bc9e5-b52d-428e-8913-cb1bfd9ff93d?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D21370371-6d2bc9e5-b52d-428e-8913-cb1bfd9ff93d%26entityType%3Dcollection%26workspaceId%3D61d3f6cf-bef9-4e2e-aeee-33273af7e7b9)

### Functional Requirements:

1. API to create cart
2. API to get cart
3. API to add items to the cart.
4. API to apply coupon to cart (update cart)
5. API to initiate checkout
6. API to generate a discount code after every nth order.
7. API to get the statistics for the admin.
   (Lists count of items purchased, total purchase amount, list of discount codes and total discount amount.)

### Non-Functional Requirements:

1. Code quality and readability.
2. Proper documentation and comments.
3. Unit tests to ensure code reliability.
4. Use of an in-memory store.

### Installation

1. Install yarn as dependency manager

```bash
npm install --global yarn
```

2: Install required packages using yarn

```bash
yarn install
```

3: Rename .env-example to .env in root

4: Change required configurations in .env

```bash
NODE_ENV=local
JWT_SECRET={ANY_RANDOM_COMPLEX_STRING}

# order-service
ORDER_SERVICE_APPNAME=order-service
ORDER_SERVICE_PORT=4000

# nth order which will get discount if coupon applied
ORDER_NTH_ORDER_DISCOUNT_COUNT=2

# percentage based discount provided to every nth order
ORDER_NTH_ORDER_COUPON_VALUE=10
```

5: Run service using

```bash
yarn run local:order-service
```

5: APIs base url will be served on: HOST:PORT/SERVICE_NAME/api/ENDPOINT
eg: http://localhost:4000/order-service/api/v1/carts/123

- Test cases can be invoked using

```bash
yarn run test
```

- To build a production release

```bash
yarn run build:order-service
```

- To run on production

```bash
yarn run start
```

## Auth token generation

1. Go to: https://10015.io/tools/jwt-encoder-decoder
2. Put your signing key used as JWT_SECRET (ANY_RANDOM_COMPLEX_STRING) in .env
3. Use one of below payload as json input
   User:

```bash
{
"userId": "123",
"roles": []
}
```

Admin

```bash
{
"userId": "123",
"roles": ["ADMIN"]
}
```

4. Click on Encode button, a JWT token will be generated

## High-Level Design

### Components

1. API Layer - Endpoints (postman_collection.json):

**Swagger Documentation: {BASE_URL}/order-service/api/docs**

| API                     | Type  | Description                 |
| ----------------------- | ----- | --------------------------- |
| `v1/carts`              | POST  | Create cart                 |
| `v1/carts/{cartId}`     | GET   | Get cart                    |
| `v1/carts/{cartId}`     | POST  | Add item(s) to cart         |
| `v1/carts/{cartId}`     | PATCH | Apply coupon                |
| `v1/checkouts/{cartId}` | POST  | Initiate checkout           |
| `admin/v1/coupons`      | POST  | Generate coupon             |
| `admin/v1/overview`     | GET   | Get overview of order stats |

2. Business Logic Layer

   - Cart Management: Handles creating carts, adding items to carts, and retrieving cart data.
   - Order Processing: Manages checkout and order creation.
   - Discount Management: Generates and validates discount codes.
   - Admin Management: Compiles and returns statistics on orders and discounts.

3. In-Memory Data Store

   - Used to store user carts, orders, and discount codes temporarily using cache-manager (or similar).

4. Testing Layer
   - Uses Jest for unit tests to ensure the correctness of each component.

### Sequence Diagrams

**Create Cart**

```plaintext
  Client                           API Layer                   Business Logic                   In-Memory Data Store
    |                                |                               |                                    |
    |        POST /v1/carts          |                               |                                    |
    |------------------------------->|                               |                                    |
    |                                |--> call Cart Management       |                                    |
    |                                |--> create()                   |                                    |
    |                                |                               |--> store cart data                 |
    |                                |                               |                                    |
    |<-------------------------------|                               |                                    |
    |  Response: Cart object         |                               |                                    |
    |                                |                               |                                    |
```

**Get Cart**

```plaintext
  Client                           API Layer                   Business Logic                   In-Memory Data Store
    |                                |                               |                                    |
    |       GET /v1/carts/{cartId}   |                               |                                    |
    |------------------------------->|                               |                                    |
    |                                |--> call Cart Management       |                                    |
    |                                |--> get()                      |                                    |
    |                                |                               |--> retrieve cart data              |
    |                                |                               |                                    |
    |<-------------------------------|                               |                                    |
    |  Response: Cart object         |                               |                                    |
    |                                |                               |                                    |
```

**Add Item to Cart**

```plaintext
  Client                           API Layer                   Business Logic                   In-Memory Data Store
    |                                |                               |                                    |
    |   POST /v1/carts/{cartId}      |                               |                                    |
    |------------------------------->|                               |                                    |
    |                                |--> validate input             |                                    |
    |                                |--> call Cart Management       |                                    |
    |                                |--> update()                   |                                    |
    |                                |                               |--> update cart data                |
    |                                |                               |                                    |
    |<-------------------------------|                               |                                    |
    |  Response: Cart object         |                               |                                    |
    |                                |                               |                                    |

```

**Apply Coupon to Cart**

```plaintext
  Client                           API Layer                   Business Logic                   In-Memory Data Store
    |                                |                               |                                    |
    |  PATCH /v1/carts/{cartId}      |                               |                                    |
    |------------------------------->|                               |                                    |
    |                                |--> validate input             |                                    |
    |                                |--> call Cart Management       |                                    |
    |                                |--> patch()                    |                                    |
    |                                |                               |--> update cart with discount       |
    |                                |                               |                                    |
    |<-------------------------------|                               |                                    |
    |  Response: Cart object         |                               |                                    |
    |                                |                               |                                    |

```

**Initiate Checkout**

```plaintext
  Client                           API Layer                   Business Logic                   In-Memory Data Store
    |                                |                               |                                    |
    | POST /v1/checkouts/{cartId}    |                               |                                    |
    |------------------------------->|                               |                                    |
    |                                |--> validate input             |                                    |
    |                                |--> call Order Processing      |                                    |
    |                                |--> create()                   |                                    |
    |                                |                               |--> retrieve cart data              |
    |                                |                               |<-----------------------------------|
    |                                |                               |--> calculate total                 |
    |                                |                               |--> apply discount if any           |
    |                                |                               |--> create order                    |
    |                                |                               |--> store order data                |
    |                                |                               |--> clear cart data                 |
    |                                |                               |                                    |
    |<-------------------------------|                               |                                    |
    |  Response: Order object        |                               |                                    |
    |                                |                               |                                    |
    |                                |--> check if nth order         |                                    |
    |                                |--> if yes, generate discount  |                                    |
    |                                |--> call Discount Management   |                                    |
    |                                |--> create()                   |                                    |
    |                                |                               |--> store discount code             |
    |                                |                               |                                    |

```

**Generate Coupon (Admin)**

```plaintext
  Admin                            API Layer                   Business Logic                   In-Memory Data Store
    |                                |                               |                                    |
    |      POST /admin/v1/coupons    |                               |                                    |
    |------------------------------->|                               |                                    |
    |                                |--> validate input             |                                    |
    |                                |--> call Discount Management   |                                    |
    |                                |--> create()                   |                                    |
    |                                |                               |--> store discount code             |
    |                                |                               |                                    |
    |<-------------------------------|                               |                                    |
    |  Response: Coupon object       |                               |                                    |
    |                                |                               |                                    |
```

**Get Overview Stats (Admin)**

```plaintext
  Admin                            API Layer                   Business Logic                   In-Memory Data Store
    |                                 |                               |                                    |
    |   GET /admin/v1/overview        |                               |                                    |
    |-------------------------------> |                               |                                    |
    |                                 |--> call Admin Management      |                                    |
    |                                 |--> overview()                 |                                    |
    |                                 |                               |--> Get order and discount stats    |
    |                                 |                               |                                    |
    |<------------------------------- |                               |                                    |
    |  Response: Overview stats object|                               |                                    |
    |                                 |                               |                                    |
```
