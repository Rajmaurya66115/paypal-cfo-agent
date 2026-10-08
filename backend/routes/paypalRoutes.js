const express = require('express');
const router = express.Router();
const { client } = require('../utils/paypalClient');
const { OrdersController } = require('@paypal/paypal-server-sdk');
const Transaction = require('../models/Transaction');

router.post('/create-order', async (req, res) => {
  try {
    const { amount, description } = req.body;
    const ordersController = new OrdersController(client());

    const collect = {
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [{
          amount: { currencyCode: 'USD', value: amount.toString() },
          description: description || 'Autonomous CFO Agent Micro-Subscription',
        }],
      },
    };

    const { body, ...httpResponse } = await ordersController.ordersCreate(collect);
    const parsedBody = JSON.parse(body);

    await Transaction.create({
      paypalOrderId: parsedBody.id,
      amount: parseFloat(amount),
      currency: 'USD',
      status: parsedBody.status,
      description,
    });

    res.status(httpResponse.statusCode).json(parsedBody);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.post('/capture-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const ordersController = new OrdersController(client());

    const { body, ...httpResponse } = await ordersController.ordersCapture({ id: orderId, body: {} });
    const parsedBody = JSON.parse(body);

    await Transaction.findOneAndUpdate({ paypalOrderId: orderId }, { status: parsedBody.status });

    res.status(httpResponse.statusCode).json(parsedBody);
  } catch (error) {
    console.error('Failed to capture order:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;