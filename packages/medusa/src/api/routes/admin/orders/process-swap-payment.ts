import { OrderService, SwapService } from "../../../../services"
import { defaultAdminOrdersFields, defaultAdminOrdersRelations } from "."

import { EntityManager } from "typeorm"

/**
 * @oas [post] /orders/{id}/swaps/{swap_id}/process-payment
 * operationId: "PostOrdersOrderSwapsSwapProcessPayment"
 * summary: "Process Swap Payment"
 * description: "When there are differences between the returned and shipped Products in a Swap, the difference must be processed. Either a Refund will be issued or a Payment will be captured."
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} The ID of the Order.
 *   - (path) swap_id=* {string} The ID of the Swap.
 * x-codeSamples:
 *   - lang: JavaScript
 *     label: JS Client
 *     source: |
 *       import Medusa from "@medusajs/medusa-js"
 *       const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 })
 *       // must be previously logged in or use api token
 *       medusa.admin.orders.processSwapPayment(order_id, swap_id)
 *       .then(({ order }) => {
 *         console.log(order.id);
 *       });
 *   - lang: Shell
 *     label: cURL
 *     source: |
 *       curl --location --request POST 'https://medusa-url.com/admin/orders/{id}/swaps/{swap_id}/process-payment' \
 *       --header 'Authorization: Bearer {api_token}'
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 * tags:
 *   - Swap
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
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
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
  const { id, swap_id } = req.params

  const orderService: OrderService = req.scope.resolve("orderService")
  const swapService: SwapService = req.scope.resolve("swapService")
  const entityManager: EntityManager = req.scope.resolve("manager")

  await entityManager.transaction(async (manager) => {
    await swapService.withTransaction(manager).processDifference(swap_id)

    const order = await orderService.withTransaction(manager).retrieve(id, {
      select: defaultAdminOrdersFields,
      relations: defaultAdminOrdersRelations,
    })

    res.json({ order })
  })
}
