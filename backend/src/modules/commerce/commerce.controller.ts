import { Request, Response } from 'express';
import { CommerceService } from './commerce.service.js';
import { SamanGatewayService } from './saman-gateway.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const getCart = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.getCart(req.user._id as string);
  sendSuccess(res, result, 'Cart retrieved successfully');
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.addToCart(req.user._id as string, req.body);
  sendSuccess(res, result, 'Item added to cart', 201);
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.removeFromCart(req.user._id as string, req.params.itemId as string);
  sendSuccess(res, result, 'Item removed from cart');
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.clearCart(req.user._id as string);
  sendSuccess(res, result, 'Cart cleared');
};

export const checkoutPreview = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.checkoutPreview(req.user._id as string, req.body.couponCode);
  sendSuccess(res, result, 'Checkout preview generated');
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { couponCode, useWallet } = req.body;
  const result = await CommerceService.createOrder(req.user._id as string, couponCode, Boolean(useWallet));
  sendSuccess(res, result, 'Order created successfully', 201);
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.getMyOrders(req.user._id as string);
  sendSuccess(res, result, 'Orders retrieved successfully');
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.getOrderById(req.user._id as string, req.params.id as string);
  sendSuccess(res, result, 'Order retrieved successfully');
};

export const createMockPayment = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.createPaymentMock(req.user._id as string, req.params.orderId as string);
  sendSuccess(res, result, 'Payment intent created');
};

export const verifyMockPayment = async (req: AuthRequest, res: Response) => {
  const { authority, status } = req.body;
  const result = await CommerceService.verifyPaymentMock(req.user._id as string, authority as string, status as 'OK' | 'NOK');
  sendSuccess(res, result, 'Payment verification processed');
};

import { Payment } from './payment.model.js';
import { WalletTransaction } from '../wallet/wallet-transaction.model.js';
import { WalletService } from '../wallet/wallet.service.js';

export const handleGatewayCallback = async (req: Request, res: Response) => {
  // Support both GET query parameters and POST body parameters from Iranian gateways (Saman/SEP, ZarinPal, SnappPay)
  const params = { ...req.query, ...req.body };
  const resNum = params.ResNum || params.resNum || '';
  const refNum = params.RefNum || params.refNum || '';
  const token = params.Token || params.token || '';
  const authority = resNum || refNum || token || params.Authority || params.authority || '';
  const status = params.Status || params.status || '';
  const state = String(params.State || params.state || '').toUpperCase();
  const gateway = req.params.gateway || params.gateway || 'saman';

  const frontendBaseUrl = process.env.FRONTEND_URL || 'https://tecyad.ir';
  const isSuccess = state === 'OK' || status === '100' || status === '2';

  const rrn = params.RRN || params.rrn || '';
  const traceNo = params.TraceNo || params.traceNo || '';

  // 1. Handle online wallet charge callback
  if (authority && String(authority).startsWith('WALLET_')) {
    try {
      const tx = await WalletTransaction.findOne({ referenceId: authority });
      if (tx) {
        if (isSuccess) {
          const verifyChargeRes = await WalletService.verifyCharge(
            tx.userId.toString(),
            authority,
            'OK',
            {
              refNum,
              rrn,
              traceNo,
              rawParams: params
            }
          );
          if (verifyChargeRes.success) {
            return res.redirect(`${frontendBaseUrl}/student/wallet?charged=true&amount=${tx.amount}&refNum=${encodeURIComponent(refNum)}`);
          } else {
            return res.redirect(`${frontendBaseUrl}/student/wallet?charged=failed&message=${encodeURIComponent(verifyChargeRes.message || 'خطا در تایید شارژ')}`);
          }
        } else {
          await WalletService.verifyCharge(tx.userId.toString(), authority, 'NOK');
          return res.redirect(`${frontendBaseUrl}/student/wallet?charged=failed`);
        }
      }
    } catch (e) {
      console.error('Wallet gateway callback handling error:', e);
    }
    return res.redirect(`${frontendBaseUrl}/student/wallet?charged=failed`);
  }

  // 2. Handle order purchase callback
  try {
    const payment = await Payment.findOne({
      $or: [
        { authority },
        { referenceId: authority },
        { referenceId: resNum },
        { authority: token }
      ]
    });

    if (payment) {
      if (isSuccess) {
        if (payment.status === 'pending') {
          const verifyRes = await CommerceService.verifyPaymentMock(
            payment.userId.toString(),
            payment.authority || authority,
            'OK',
            {
              refNum,
              rrn,
              traceNo,
              rawParams: params
            }
          );
          if (verifyRes.success) {
            return res.redirect(`${frontendBaseUrl}/payment/success?orderId=${encodeURIComponent(payment.orderId.toString())}&refNum=${encodeURIComponent(refNum || payment.refNum || '')}&gateway=${encodeURIComponent(gateway)}`);
          } else {
            return res.redirect(`${frontendBaseUrl}/payment/failed?authority=${encodeURIComponent(authority)}&gateway=${encodeURIComponent(gateway)}&message=${encodeURIComponent(verifyRes.message || 'خطا در تایید تراکنش')}`);
          }
        } else if (payment.status === 'paid') {
          return res.redirect(`${frontendBaseUrl}/payment/success?orderId=${encodeURIComponent(payment.orderId.toString())}&refNum=${encodeURIComponent(payment.refNum || refNum)}&gateway=${encodeURIComponent(gateway)}`);
        }
      } else {
        // State is not OK or payment canceled
        if (payment.status === 'pending') {
          await CommerceService.verifyPaymentMock(
            payment.userId.toString(),
            payment.authority || authority,
            'NOK'
          );
        }
      }
    }
  } catch (err: any) {
    console.error('Order gateway callback handling error:', err);
  }

  // Fallback to failed payment page
  return res.redirect(`${frontendBaseUrl}/payment/failed?authority=${encodeURIComponent(authority)}&gateway=${encodeURIComponent(gateway)}`);
};

export const renderSepForm = async (req: Request, res: Response) => {
  const token = (req.params.token || req.query.token || '') as string;
  if (!token) {
    return res.status(400).send('توکن پرداخت یافت نشد');
  }
  const html = SamanGatewayService.generateAutoSubmitForm(token);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
};

export const getInstructorSales = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  const result = await CommerceService.getInstructorSales(
    req.user._id as string, 
    month ? parseInt(month as string) : undefined,
    year ? parseInt(year as string) : undefined
  );
  sendSuccess(res, result, 'Instructor sales retrieved successfully');
};

