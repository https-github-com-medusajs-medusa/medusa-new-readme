import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator"
import { defaultStoreOrdersFields, defaultStoreOrdersRelations } from "."

import { OrderService } from "../../../../services"
import { Type } from "class-transformer"
import { validator } from "../../../../utils/validator"

/**
 * @oas [get] /orders
 * operationId: "GetOrders"
 * summary: "Look Up an Order"
 * description: "Look up an order using filters."
 * parameters:
 *   - (query) display_id=* {number} The display id given to the Order.
 *   - in: query
 *     name: email
 *     style: form
 *     explode: false
 *     description: The email associated with this order.
 *     required: true
 *     schema:
 *       type: string
 *       format: email
 *   - in: query
 *     name: shipping_address
 *     style: form
 *     explode: false
 *     description: The shipping address associated with this order.
 *     schema:
 *       type: object
 *       properties:
 *         postal_code:
 *           type: string
 *           description: The postal code of the shipping address
 * x-codeSamples:
 *   - lang: JavaScript
 *     label: JS Client
 *     source: |
 *       import Medusa from "@medusajs/medusa-js"
 *       const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 })
 *       medusa.orders.lookupOrder({
 *         display_id: 1,
 *         email: 'user@example.com'
 *       })
 *       .then(({ order }) => {
 *         console.log(order.id);
 *       });
 *   - lang: Shell
 *     label: cURL
 *     source: |
 *       curl --location --request GET 'https://medusa-url.com/store/orders?display_id=1&email=user@example.com'
 * tags:
 *   - Order
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             order:
 *               $ref: "#/components/schemas/order"
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 */
export default async (req, res) => {
  const validated = await validator(StoreGetOrdersParams, req.query)

  const orderService: OrderService = req.scope.resolve("orderService")

  const orders = await orderService.list(
    {
      display_id: validated.display_id,
      email: validated.email,
    },
    {
      select: defaultStoreOrdersFields,
      relations: defaultStoreOrdersRelations,
    }
  )

  if (orders.length !== 1) {
    res.sendStatus(404)
    return
  }

  const order = orders[0]

  res.json({ order })
}

export class ShippingAddressPayload {
  @IsOptional()
  @IsString()
  postal_code?: string
}

export class StoreGetOrdersParams {
  @IsNumber()
  @Type(() => Number)
  display_id: number

  @IsEmail()
  email: string

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressPayload)
  shipping_address?: ShippingAddressPayload
}
