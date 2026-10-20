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

export const updateCartItemPlan = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.updateCartItemPlan(req.user._id as string, req.params.itemId as string, req.body.paymentPlan);
  sendSuccess(res, result, 'Cart item payment plan updated');
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
  const resNum = String(params.ResNum || params.resNum || '').trim();
  const refNum = String(params.RefNum || params.refNum || '').trim();
  const token = String(params.Token || params.token || '').trim();
  const authority = String(resNum || refNum || token || params.Authority || params.authority || '').trim();
  const status = String(params.Status || params.status || '').trim();
  const state = String(params.State || params.state || '').toUpperCase().trim();
  const gateway = String(req.params.gateway || params.gateway || 'saman');

  const frontendBaseUrl = (process.env.FRONTEND_URL || 'https://tecyad.ir').replace(/\/+$/, '');
  const isSuccess = state === 'OK' || status === '100' || status === '2';

  const rrn = String(params.RRN || params.rrn || '').trim();
  const traceNo = String(params.TraceNo || params.traceNo || '').trim();
  const terminalId = String(params.TerminalId || params.terminalId || params.TerminalNumber || '').trim();
  const maskedPan = String(params.PAN || params.pan || params.CardNumber || params.cardNumber || '').trim();

  // 1. First, search Payment record by unique server-side authorities/identifiers
  let payment: any = null;
  if (authority || resNum || token) {
    payment = await Payment.findOne({
      $or: [
        { authority },
        { resNum: resNum || authority },
        { referenceId: resNum || authority },
        { referenceId: authority },
        { authority: token }
      ].filter(Boolean)
    });
  }

  // 2. Search WalletTransaction if authority indicates wallet or payment references wallet transaction
  const isWalletAuthority = authority.startsWith('WALLET') || resNum.startsWith('WALLET');
  let walletTx: any = null;
  if (payment?.walletTransactionId) {
    walletTx = await WalletTransaction.findById(payment.walletTransactionId);
  }
  if (!walletTx && (isWalletAuthority || authority)) {
    walletTx = await WalletTransaction.findOne({
      $or: [
        { referenceId: authority },
        { referenceId: resNum },
        { resNum: resNum || authority },
        { trackingCode: refNum || authority }
      ].filter(Boolean)
    });
  }

  // 3. Handle Wallet Top-Up Return Flow: Must ALWAYS return to Student Wallet, NEVER to Cart or Checkout!
  if (payment?.originType === 'wallet_topup' || isWalletAuthority || walletTx) {
    try {
      if (walletTx) {
        if (isSuccess) {
          const verifyChargeRes = await WalletService.verifyCharge(
            walletTx.userId.toString(),
            walletTx.referenceId || authority,
            'OK',
            {
              refNum,
              rrn,
              traceNo,
              maskedPan,
              terminalId,
              rawParams: params
            }
          );
          if (verifyChargeRes.success) {
            return res.redirect(`${frontendBaseUrl}/student/wallet?charged=true&amount=${walletTx.amount}&refNum=${encodeURIComponent(refNum || walletTx.refNum || '')}&traceNo=${encodeURIComponent(traceNo || walletTx.traceNo || '')}&rrn=${encodeURIComponent(rrn || walletTx.rrn || '')}&resNum=${encodeURIComponent(resNum || authority)}`);
          } else if ((verifyChargeRes as any).underReview) {
            return res.redirect(`${frontendBaseUrl}/student/wallet?charged=pending&traceNo=${encodeURIComponent(traceNo || '')}&resNum=${encodeURIComponent(resNum || authority)}&refNum=${encodeURIComponent(refNum || '')}`);
          } else {
            return res.redirect(`${frontendBaseUrl}/student/wallet?charged=failed&message=${encodeURIComponent(verifyChargeRes.message || 'خطا در تایید شارژ')}&traceNo=${encodeURIComponent(traceNo || '')}&resNum=${encodeURIComponent(resNum || authority)}&refNum=${encodeURIComponent(refNum || '')}`);
          }
        } else {
          await WalletService.verifyCharge(walletTx.userId.toString(), walletTx.referenceId || authority, 'NOK');
          return res.redirect(`${frontendBaseUrl}/student/wallet?charged=failed&reason=cancelled&traceNo=${encodeURIComponent(traceNo || '')}&resNum=${encodeURIComponent(resNum || authority)}`);
        }
      }
    } catch (e) {
      console.error('Wallet gateway callback handling error:', e);
    }
    // Safe server-determined fallback: always student wallet
    return res.redirect(`${frontendBaseUrl}/student/wallet?charged=failed&reason=cancelled&resNum=${encodeURIComponent(resNum || authority)}`);
  }

  // 4. Handle Order / Course / Class Purchase Callback
  try {
    if (payment) {
      const orderIdStr = payment.orderId ? payment.orderId.toString() : '';
      if (isSuccess) {
        if (payment.status === 'pending' || payment.status === 'under_review') {
          const verifyRes = await CommerceService.verifyPaymentMock(
            payment.userId.toString(),
            payment.authority || authority,
            'OK',
            {
              refNum,
              rrn,
              traceNo,
              maskedPan,
              terminalId,
              rawParams: params
            }
          );
          if (verifyRes.success) {
            return res.redirect(`${frontendBaseUrl}/payment/success?orderId=${encodeURIComponent(orderIdStr)}&refNum=${encodeURIComponent(refNum || payment.refNum || '')}&traceNo=${encodeURIComponent(traceNo || '')}&gateway=${encodeURIComponent(gateway)}`);
          } else if ((verifyRes as any).underReview) {
            return res.redirect(`${frontendBaseUrl}/payment/failed?origin=${encodeURIComponent(payment.originType || 'order')}&orderId=${encodeURIComponent(orderIdStr)}&authority=${encodeURIComponent(authority)}&status=under_review&message=${encodeURIComponent('تراکنش در انتظار بررسی و استعلام نهایی از شاپرک می‌باشد.')}`);
          } else {
            return res.redirect(`${frontendBaseUrl}/payment/failed?origin=${encodeURIComponent(payment.originType || 'order')}&orderId=${encodeURIComponent(orderIdStr)}&authority=${encodeURIComponent(authority)}&gateway=${encodeURIComponent(gateway)}&message=${encodeURIComponent(verifyRes.message || 'خطا در تایید تراکنش')}`);
          }
        } else if (payment.status === 'paid') {
          return res.redirect(`${frontendBaseUrl}/payment/success?orderId=${encodeURIComponent(orderIdStr)}&refNum=${encodeURIComponent(payment.refNum || refNum)}&gateway=${encodeURIComponent(gateway)}`);
        }
      } else {
        // State is not OK or payment canceled by user
        if (payment.status === 'pending') {
          await CommerceService.verifyPaymentMock(
            payment.userId.toString(),
            payment.authority || authority,
            'NOK'
          );
        }
        return res.redirect(`${frontendBaseUrl}/payment/failed?origin=${encodeURIComponent(payment.originType || 'order')}&orderId=${encodeURIComponent(orderIdStr)}&authority=${encodeURIComponent(authority)}&gateway=${encodeURIComponent(gateway)}&message=${encodeURIComponent('پرداخت توسط کاربر لغو گردید')}`);
      }
    }
  } catch (err: any) {
    console.error('Order gateway callback handling error:', err);
  }

  // Fallback for general order
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

export const getAccountingOverview = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.getAccountingOverview(req.query as any);
  sendSuccess(res, result, 'اطلاعات داشبورد حسابداری با موفقیت دریافت شد');
};

export const getAccountingTransactions = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.getAccountingTransactions(req.query as any);
  sendSuccess(res, result, 'تراکنش‌های حسابداری با موفقیت دریافت شد');
};

export const getAccountingTransactionById = async (req: AuthRequest, res: Response) => {
  const result = await CommerceService.getAccountingTransactionById(req.params.id as string);
  sendSuccess(res, result, 'جزئیات تراکنش مالی با موفقیت دریافت شد');
};


