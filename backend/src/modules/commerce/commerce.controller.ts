import { Request, Response } from 'express';
import { CommerceService } from './commerce.service.js';
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

export const handleGatewayCallback = async (req: Request, res: Response) => {
  // Support both GET query parameters and POST body parameters from Iranian gateways (ZarinPal, Saman/SEP, SnappPay)
  const params = { ...req.query, ...req.body };
  const authority = params.Authority || params.authority || params.RefNum || params.Token || params.resNum || '';
  const status = params.Status || params.status || (params.state === 'OK' ? 'OK' : '') || '';
  const gateway = req.params.gateway || params.gateway || 'shaparak';

  const frontendBaseUrl = process.env.FRONTEND_URL || 'https://tecyad.ir';

  // If status is OK or positive state
  if (status === 'OK' || status === '100' || String(params.State).toLowerCase() === 'ok') {
    return res.redirect(`${frontendBaseUrl}/payment/success?authority=${encodeURIComponent(authority)}&gateway=${encodeURIComponent(gateway)}`);
  }

  // Otherwise redirect to failed payment page
  return res.redirect(`${frontendBaseUrl}/payment/failed?authority=${encodeURIComponent(authority)}&gateway=${encodeURIComponent(gateway)}`);
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
