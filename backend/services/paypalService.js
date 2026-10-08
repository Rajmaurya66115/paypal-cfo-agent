const createOrder = async (amount, description) => { return { id: "PAYPAL_SANDBOX_ORDER_" + Date.now(), status: "CREATED", amount, description }; }; module.exports = { createOrder };
