import { jest } from '@jest/globals';
import nodemailer, { type SendMailOptions } from 'nodemailer';
import type { ServerConfig } from './schema.js';
import { EmailValidator } from './email-validator.js';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailValidator', () => {
  describe('parseEmailPattern', () => {
    test('should parse exact email address', () => {
      const result = EmailValidator.parseEmailPattern('test@example.com');
      expect(result).toEqual({
        pattern: 'test@example.com',
        type: 'exact'
      });
    });

    test('should parse domain pattern', () => {
      const result = EmailValidator.parseEmailPattern('@example.com');
      expect(result).toEqual({
        pattern: 'example.com',
        type: 'domain'
      });
    });

    test('should parse wildcard domain pattern', () => {
      const result = EmailValidator.parseEmailPattern('example.com');
      expect(result).toEqual({
        pattern: 'example.com',
        type: 'wildcard'
      });
    });
  });

  describe('isEmailAllowed', () => {
    test('should allow email when no lists are specified', () => {
      const validator = new EmailValidator();
      expect(validator.isEmailAllowed('test@example.com')).toBe(true);
    });

    test('should allow email when it matches allow list pattern', () => {
      const validator = new EmailValidator([
        { pattern: 'example.com', type: 'wildcard' }
      ], undefined);
      expect(validator.isEmailAllowed('test@example.com')).toBe(true);
      expect(validator.isEmailAllowed('test@sub.example.com')).toBe(true);
      expect(validator.isEmailAllowed('test@other.com')).toBe(false);
    });

    test('should block email when it matches block list pattern', () => {
      const validator = new EmailValidator(undefined, [
        { pattern: 'spam.com', type: 'wildcard' }
      ]);
      expect(validator.isEmailAllowed('test@spam.com')).toBe(false);
      expect(validator.isEmailAllowed('test@sub.spam.com')).toBe(false);
      expect(validator.isEmailAllowed('test@example.com')).toBe(true);
    });

    test('should handle exact email matches', () => {
      const validator = new EmailValidator([
        { pattern: 'test@example.com', type: 'exact' }
      ], undefined);
      expect(validator.isEmailAllowed('test@example.com')).toBe(true);
      expect(validator.isEmailAllowed('other@example.com')).toBe(false);
    });

    test('should handle domain matches', () => {
      const validator = new EmailValidator([
        { pattern: 'example.com', type: 'domain' }
      ], undefined);
      expect(validator.isEmailAllowed('test@example.com')).toBe(true);
      expect(validator.isEmailAllowed('test@other.com')).toBe(false);
    });

    test('should throw error when both lists are specified', () => {
      expect(() => new EmailValidator(
        [{ pattern: 'example.com', type: 'wildcard' }],
        [{ pattern: 'spam.com', type: 'wildcard' }]
      )).toThrow('Cannot specify both allow_list and block_list');
    });
  });
});

describe('EmailServer', () => {
  let mockTransporter: {
    sendMail: jest.Mock<Promise<{ messageId: string }>, [SendMailOptions]>;
  };

  beforeEach(() => {
    // Setup environment variables for tests
    process.env.EMAIL_SERVICE = 'gmail';
    process.env.EMAIL_FROM = 'test@example.com';
    process.env.EMAIL_USERNAME = 'test@example.com';
    process.env.EMAIL_PASSWORD = 'password123';
    process.env.EMAIL_ALLOW_LIST = 'example.com,@trusted.com,specific@example.com';

    // Create the mock with explicit typing
    const sendMailMock = jest.fn();
    sendMailMock.mockResolvedValue({ messageId: 'test-id' });

    mockTransporter = {
      sendMail: sendMailMock
    };
    
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.EMAIL_ALLOW_LIST;
    delete process.env.EMAIL_BLOCK_LIST;
  });

  test('should initialize with correct configuration', () => {
    const config: ServerConfig = {
      email_service: 'gmail',
      email_from: 'test@example.com',
      email_username: 'test@example.com',
      email_password: 'password123',
      allow_list: [
        { pattern: 'example.com', type: 'wildcard' }
      ]
    };

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: config.email_service,
      auth: {
        user: config.email_username,
        pass: config.email_password,
      },
    });
  });

  test('should send email with correct parameters', () => {
    const emailData = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      message_content: 'Test Message',
    };

    mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'test@example.com',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.message_content,
      html: emailData.message_content,
    }));
  });

  test('should handle attachments correctly', () => {
    const emailData = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      message_content: 'Test Message',
      attachments: [
        {
          filename: 'test.txt',
          content: 'Test content',
          contentType: 'text/plain',
        },
      ],
    };

    mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      attachments: expect.arrayContaining([
        expect.objectContaining({
          filename: 'test.txt',
          content: 'Test content',
          contentType: 'text/plain',
        }),
      ]),
    }));
  });

  test('should handle email sending errors', () => {
    const testError = new Error('Test error');
    mockTransporter.sendMail.mockRejectedValueOnce(testError);

    expect(mockTransporter.sendMail).toHaveBeenCalled();
  });

  test('should handle HTML content correctly', () => {
    const emailData = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      message_content: '<h1>Test</h1><p>Message</p>',
    };

    mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      html: emailData.message_content,
      text: 'TestMessage', // HTML tags should be stripped
    }));
  });
});