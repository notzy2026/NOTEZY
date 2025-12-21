import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentResult {
    success: boolean;
    noteId?: string;
    error?: string;
}

export function useRazorpay() {
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiatePayment = async (
        noteId: string,
        amount: number,
        noteTitle: string
    ): Promise<PaymentResult> => {
        if (!user || !userProfile) {
            return { success: false, error: 'Please login to make a purchase' };
        }

        setLoading(true);
        setError(null);

        try {
            const functions = getFunctions();
            const createOrder = httpsCallable(functions, 'createRazorpayOrder');

            // Step 1: Create order on backend
            const orderResult = await createOrder({ noteId, amount });
            const orderData = orderResult.data as {
                orderId: string;
                amount: number;
                currency: string;
            };

            // Step 2: Open Razorpay checkout
            return new Promise((resolve) => {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'Notezy',
                    description: `Purchase: ${noteTitle}`,
                    order_id: orderData.orderId,
                    prefill: {
                        name: userProfile.name,
                        email: userProfile.email,
                    },
                    theme: {
                        color: '#6366f1',
                    },
                    handler: async function (response: {
                        razorpay_payment_id: string;
                        razorpay_order_id: string;
                        razorpay_signature: string;
                    }) {
                        try {
                            // Step 3: Verify payment on backend
                            const verifyPayment = httpsCallable(functions, 'verifyRazorpayPayment');
                            const verifyResult = await verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });

                            const verifyData = verifyResult.data as { success: boolean; noteId: string };
                            setLoading(false);
                            resolve({ success: true, noteId: verifyData.noteId });
                        } catch (verifyError: any) {
                            setLoading(false);
                            setError(verifyError.message || 'Payment verification failed');
                            resolve({ success: false, error: verifyError.message });
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                            resolve({ success: false, error: 'Payment cancelled' });
                        },
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.on('payment.failed', function (response: any) {
                    setLoading(false);
                    setError(response.error.description);
                    resolve({ success: false, error: response.error.description });
                });
                razorpay.open();
            });
        } catch (err: any) {
            setLoading(false);
            const errorMessage = err.message || 'Failed to initiate payment';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    return {
        initiatePayment,
        loading,
        error,
        clearError: () => setError(null),
    };
}
