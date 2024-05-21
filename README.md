# E-commerce Checkout

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

## High-Level Design

### Components

1. API Layer - Endpoints:
   | API | Type | Description |
   | -------------------- | ----- |------------ |
   | `v1/carts` | POST | Create cart |
   | `v1/carts/{cartId}` | GET | Get cart |
   | `v1/carts/{cartId}` | POST | Add item(s) to cart |
   | `v1/carts/{cartId}` | PATCH | Apply coupon |
   | `v1/checkouts/{cartId}` | POST | Initiate checkout |
   | `admin/v1/coupons` | POST | Generate coupon |
   | `admin/v1/overview` | GET | Get overview of order stats |

2. Business Logic Layer

   - Cart Management: Handles creating carts, adding items to carts, and retrieving cart data.
   - Order Processing: Manages checkout and order creation.
   - Discount Management: Generates and validates discount codes.
   - Admin Management: Compiles and returns statistics on orders and discounts.

3. In-Memory Data Store

   - Used to store user carts, orders, and discount codes temporarily using NodeCache (or similar).

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
