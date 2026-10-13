import { Setting } from '../../modules/admin/setting.model.js';
import { AuditService } from './audit.service.js';

export interface SmsConfig {
  smsProvider: 'kavenegar' | 'farazsms' | 'ghasedak' | 'mock';
  smsApiKey?: string;
  smsOtpPattern: string;
  smsSenderNumber?: string;
  requireOtp?: boolean;
}

export class SmsService {
  /**
   * Retrieves active SMS configuration from the Setting collection with defaults.
   */
  static async getConfig(): Promise<SmsConfig> {
    try {
      const settings = await Setting.find({
        key: { $in: ['smsProvider', 'smsApiKey', 'smsOtpPattern', 'smsSenderNumber', 'requireOtp', 'sms_config'] }
      }).lean();

      const configMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);

      const composite = configMap['sms_config'] || {};

      return {
        smsProvider: configMap.smsProvider || composite.provider || 'kavenegar',
        smsApiKey: configMap.smsApiKey || composite.apiKey || process.env.SMS_API_KEY || '314937696D7663454E6E2F67686443317373574B7167315765316C58473374693638444673506D7531446F3D',
        smsOtpPattern: configMap.smsOtpPattern || composite.pattern || process.env.SMS_OTP_PATTERN || 'TecyadOTP',
        smsSenderNumber: configMap.smsSenderNumber || composite.senderNumber || process.env.SMS_SENDER_NUMBER || '',
        requireOtp: configMap.requireOtp !== undefined ? Boolean(configMap.requireOtp) : true
      };
    } catch (err) {
      console.error('Error fetching SMS configuration:', err);
      return {
        smsProvider: 'kavenegar',
        smsOtpPattern: 'TecyadOTP',
        requireOtp: true
      };
    }
  }

  /**
   * Normalizes Iranian mobile phone numbers to 09XXXXXXXXX
   */
  static normalizeMobile(input: string): string {
    if (!input) return '';
    let mobile = String(input).trim();
    // Convert Persian & Arabic numbers to English
    mobile = mobile.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
    mobile = mobile.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    mobile = mobile.replace(/[\s\-_]/g, '');

    if (mobile.startsWith('+98')) mobile = '0' + mobile.slice(3);
    else if (mobile.startsWith('0098')) mobile = '0' + mobile.slice(4);
    else if (mobile.startsWith('98') && mobile.length === 12) mobile = '0' + mobile.slice(2);
    else if (!mobile.startsWith('0') && mobile.length === 10) mobile = '0' + mobile;

    return mobile;
  }

  /**
   * Sends an OTP token using the pattern/template (Default: TecyadOTP)
   */
  static async sendOtp(
    recipientMobile: string,
    token: string,
    customPattern?: string,
    overrideConfig?: Partial<SmsConfig>
  ): Promise<{ success: boolean; message: string; messageId?: string; simulated: boolean; provider: string; pattern: string }> {
    const mobile = this.normalizeMobile(recipientMobile);
    if (!mobile || !/^09\d{9}$/.test(mobile)) {
      throw new Error('شماره موبایل وارد شده نامعتبر است (باید ۱۱ رقم با فرمت ۰۹ باشد)');
    }

    const currentConfig = await this.getConfig();
    const config: SmsConfig = {
      ...currentConfig,
      ...overrideConfig
    };

    const pattern = customPattern || config.smsOtpPattern || 'TecyadOTP';
    const provider = config.smsProvider || 'kavenegar';
    const apiKey = config.smsApiKey?.trim();

    // If no real API key is supplied or provider is mock, perform a safe mock delivery
    if (provider === 'mock' || !apiKey) {
      console.log(`\n================== [SMS OTP - MOCK] ==================`);
      console.log(`📱 گیرنده: ${mobile}`);
      console.log(`🔑 کد اعتبارسنجی: ${token}`);
      console.log(`📋 الگوی پیامک (Pattern): ${pattern}`);
      console.log(`🌐 ارائه‌دهنده: ${provider} (تست محلی)`);
      console.log(`======================================================\n`);

      AuditService.log({
        action: 'ارسال پیامک کد تایید (Mock)',
        category: 'sms',
        title: `ارسال کد تایید ${token} به ${mobile} با الگوی ${pattern} (آزمایشی)`,
        status: 'success',
        details: {
          mobile,
          pattern,
          provider,
          simulated: true,
          codeMasked: token.length > 2 ? `${token.slice(0, 2)}***` : '***'
        }
      });

      return {
        success: true,
        message: `پیامک آزمایشی با موفقیت برای شماره ${mobile} با الگوی ${pattern} ثبت شد`,
        simulated: true,
        provider,
        pattern
      };
    }

    // Real API dispatch depending on selected Iranian provider
    try {
      if (provider === 'kavenegar') {
        const url = `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/verify/lookup.json?receptor=${encodeURIComponent(mobile)}&token=${encodeURIComponent(token)}&template=${encodeURIComponent(pattern)}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        const data: any = await response.json();

        if (response.ok && data?.return?.status === 200) {
          const messageId = String(data?.entries?.[0]?.messageid || '');
          AuditService.log({
            action: 'ارسال پیامک اعتبارسنجی کاوه نگار',
            category: 'sms',
            title: `پیامک کد تایید با الگوی ${pattern} به شماره ${mobile} با موفقیت ارسال شد`,
            status: 'success',
            details: {
              mobile,
              pattern,
              provider: 'kavenegar',
              messageId,
              returnStatus: data.return.status
            }
          });

          return {
            success: true,
            message: `پیامک کد تایید با الگوی ${pattern} از طریق کاوه نگار ارسال شد`,
            messageId,
            simulated: false,
            provider,
            pattern
          };
        } else {
          const errMsg = data?.return?.message || 'خطا در ارتباط با وب‌سرویس کاوه نگار';
          AuditService.log({
            action: 'خطا در ارسال پیامک کاوه نگار',
            category: 'sms',
            title: `خطا در ارسال پیامک با الگوی ${pattern} به ${mobile}: ${errMsg}`,
            status: 'failure',
            details: { mobile, pattern, error: errMsg, response: data }
          });
          throw new Error(errMsg);
        }
      } else if (provider === 'farazsms') {
        // FarazSMS / IPPanel pattern sending
        const url = 'https://api2.ippanel.com/api/v1/sms/pattern/normal/send';
        const sender = config.smsSenderNumber?.trim() || '+983000505';

        const bodyData = {
          code: pattern,
          sender,
          recipient: mobile,
          values: {
            code: token
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
          },
          body: JSON.stringify(bodyData)
        });

        const data: any = await response.json();

        if (response.ok && (data?.status === 'OK' || data?.code === 200 || data?.data)) {
          const messageId = String(data?.data?.message_id || data?.message_id || '');
          AuditService.log({
            action: 'ارسال پیامک پترن فراز اس‌ام‌اس',
            category: 'sms',
            title: `پیامک با الگوی ${pattern} به شماره ${mobile} ارسال گردید`,
            status: 'success',
            details: { mobile, pattern, provider: 'farazsms', messageId }
          });

          return {
            success: true,
            message: `پیامک با الگوی ${pattern} از طریق فراز اس‌ام‌اس ارسال گردید`,
            messageId,
            simulated: false,
            provider,
            pattern
          };
        } else {
          const errMsg = data?.message || data?.error || 'خطا در ارسال پیامک فراز اس‌ام‌اس / IPPanel';
          AuditService.log({
            action: 'خطا در ارسال پیامک فراز اس‌ام‌اس',
            category: 'sms',
            title: `خطا در ارسال با الگوی ${pattern}: ${errMsg}`,
            status: 'failure',
            details: { mobile, pattern, error: errMsg, response: data }
          });
          throw new Error(errMsg);
        }
      } else if (provider === 'ghasedak') {
        const url = 'https://api.ghasedak.me/v2/verification/send/simple';
        const formData = new URLSearchParams();
        formData.append('receptor', mobile);
        formData.append('template', pattern);
        formData.append('type', '1');
        formData.append('param1', token);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        });

        const data: any = await response.json();

        if (response.ok && data?.result?.code === 200) {
          const messageId = String(data?.items?.[0] || '');
          AuditService.log({
            action: 'ارسال پیامک اعتبارسنجی قاصدک',
            category: 'sms',
            title: `پیامک با الگوی ${pattern} به ${mobile} ارسال شد`,
            status: 'success',
            details: { mobile, pattern, provider: 'ghasedak', messageId }
          });

          return {
            success: true,
            message: `پیامک با الگوی ${pattern} از طریق قاصدک ارسال شد`,
            messageId,
            simulated: false,
            provider,
            pattern
          };
        } else {
          const errMsg = data?.result?.message || 'خطا در ارسال پیامک قاصدک';
          AuditService.log({
            action: 'خطا در ارسال پیامک قاصدک',
            category: 'sms',
            title: `خطا در ارسال با الگوی ${pattern}: ${errMsg}`,
            status: 'failure',
            details: { mobile, pattern, error: errMsg, response: data }
          });
          throw new Error(errMsg);
        }
      } else {
        throw new Error(`ارائه‌دهنده پیامک «${provider}» پشتیبانی نمی‌شود.`);
      }
    } catch (apiErr: any) {
      console.error(`SmsService error (${provider}):`, apiErr.message);
      // Fallback log so trace is not lost
      AuditService.log({
        action: 'خطای سامانه پیامکی',
        category: 'sms',
        title: `خطا در ارسال پیامک به ${mobile} با الگوی ${pattern}: ${apiErr.message}`,
        status: 'failure',
        details: { mobile, pattern, provider, error: apiErr.message }
      });
      throw apiErr;
    }
  }

  /**
   * Broadcast or general text SMS
   */
  static async sendSms(
    recipientMobile: string,
    messageText: string
  ): Promise<{ success: boolean; simulated: boolean }> {
    const mobile = this.normalizeMobile(recipientMobile);
    if (!mobile) return { success: false, simulated: true };

    const config = await this.getConfig();
    const apiKey = config.smsApiKey?.trim();
    const provider = config.smsProvider || 'kavenegar';

    if (provider === 'mock' || !apiKey) {
      console.log(`[SMS Broadcast Mock] To ${mobile}: ${messageText.slice(0, 50)}...`);
      AuditService.log({
        action: 'ارسال پیامک متنی (Mock)',
        category: 'sms',
        title: `ارسال پیامک اطلاع‌رسانی به ${mobile} (آزمایشی)`,
        status: 'success',
        details: { mobile, preview: messageText.slice(0, 60), simulated: true }
      });
      return { success: true, simulated: true };
    }

    try {
      if (provider === 'kavenegar') {
        const sender = config.smsSenderNumber || '';
        const senderParam = sender ? `&sender=${encodeURIComponent(sender)}` : '';
        const url = `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/sms/send.json?receptor=${encodeURIComponent(mobile)}&message=${encodeURIComponent(messageText)}${senderParam}`;
        const res = await fetch(url);
        const data: any = await res.json();
        return { success: res.ok && data?.return?.status === 200, simulated: false };
      }
      return { success: true, simulated: false };
    } catch (err: any) {
      console.error('Error sending normal SMS:', err.message);
      return { success: false, simulated: false };
    }
  }

  /**
   * Test SMS utility using the pattern (default: TecyadOTP)
   */
  static async testSms(
    recipientMobile: string,
    customPattern?: string,
    overrideConfig?: Partial<SmsConfig>
  ) {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const pattern = customPattern || 'TecyadOTP';
    const result = await this.sendOtp(recipientMobile, code, pattern, overrideConfig);
    return {
      ...result,
      testCode: code
    };
  }

  /**
   * Retrieves active SMS account balance and credit status from Kavenegar/provider
   */
  static async getCredit(): Promise<{
    provider: string;
    remainCredit: number;
    remainCreditToman: number;
    remainCreditFormatted: string;
    expireDate?: string;
    type?: string;
    status: 'connected' | 'error' | 'mock';
    message?: string;
  }> {
    const config = await this.getConfig();
    const apiKey = config.smsApiKey?.trim();
    const provider = config.smsProvider || 'kavenegar';

    if (provider === 'mock' || !apiKey) {
      return {
        provider: 'mock',
        remainCredit: 1000000,
        remainCreditToman: 100000,
        remainCreditFormatted: '۱۰۰,۰۰۰ تومان (شبیه‌ساز)',
        status: 'mock',
        message: 'سامانه در حالت شبیه‌ساز پیامک قرار دارد'
      };
    }

    try {
      if (provider === 'kavenegar') {
        const url = `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/account/info.json`;
        const res = await fetch(url);
        const data: any = await res.json();

        if (data?.return?.status === 200 && data.entries) {
          const remainCredit = Number(data.entries.remaincredit || 0);
          const remainCreditToman = Math.floor(remainCredit / 10);
          let expireDate: string | undefined;
          if (data.entries.expiredate) {
            const expSec = Number(data.entries.expiredate);
            if (!isNaN(expSec) && expSec > 0) {
              expireDate = new Date(expSec * 1000).toLocaleDateString('fa-IR');
            }
          }

          return {
            provider: 'kavenegar',
            remainCredit,
            remainCreditToman,
            remainCreditFormatted: `${remainCreditToman.toLocaleString('fa-IR')} تومان (${remainCredit.toLocaleString('fa-IR')} ریال)`,
            expireDate,
            type: data.entries.type || 'Master',
            status: 'connected',
            message: 'اتصال به وب‌سرویس کاوه‌نگار برقرار است'
          };
        } else {
          return {
            provider: 'kavenegar',
            remainCredit: 0,
            remainCreditToman: 0,
            remainCreditFormatted: '۰ ریال',
            status: 'error',
            message: data?.return?.message || 'خطا در دریافت وضعیت حساب کاوه‌نگار'
          };
        }
      }

      return {
        provider,
        remainCredit: 0,
        remainCreditToman: 0,
        remainCreditFormatted: 'نامشخص',
        status: 'connected',
        message: `استعلام شارژ برای ارائه‌دهنده ${provider} پشتیبانی نمی‌شود`
      };
    } catch (err: any) {
      console.error('Error fetching SMS credit from provider:', err.message);
      return {
        provider,
        remainCredit: 0,
        remainCreditToman: 0,
        remainCreditFormatted: 'خطای ارتباط با سامانه پیامکی',
        status: 'error',
        message: err.message
      };
    }
  }
}
