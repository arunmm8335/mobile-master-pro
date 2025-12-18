import { CURRENCY } from '../constants';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const createOrder = async (items: any[], total: number) => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: total }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const initializePayment = async (amount: number, orderId: string) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: "rzp_test_YOUR_KEY_HERE", // Enter the Key ID generated from the Dashboard
      amount: amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "MobileMaster Pro",
      description: "Transaction",
      image: "https://example.com/your_logo",
      order_id: orderId, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: async function (response: any) {
        // Verify payment on backend
        try {
            const verifyResponse = await fetch('/api/payment/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                }),
            });
            
            const verifyResult = await verifyResponse.json();
            if (verifyResult.success) {
                resolve(response);
            } else {
                reject(new Error('Payment verification failed'));
            }
        } catch (error) {
            reject(error);
        }
      },
      prefill: {
        name: "Gaurav Kumar",
        email: "gaurav.kumar@example.com",
        contact: "9000090000"
      },
      notes: {
        address: "Razorpay Corporate Office"
      },
      theme: {
        color: "#0f172a"
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response: any){
        reject(new Error(response.error.description));
    });
    rzp1.open();
  });
};
